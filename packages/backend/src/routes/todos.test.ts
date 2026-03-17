import { buildApp } from "../app";
import { getConfig } from "../config";
import { getDb } from "../db/client";
import { runMigrations } from "../db/migrate";
import { todos } from "../db/schema";

describe("GET /api/todos", () => {
  let app: ReturnType<typeof buildApp>;
  let db: ReturnType<typeof getDb>;

  beforeEach(() => {
    const config = { ...getConfig(), LOG_LEVEL: "silent" };
    db = getDb(":memory:");
    runMigrations(db);
    app = buildApp(config, db);
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns 200 with empty todos array when database is empty", async () => {
    const res = await app.inject({ method: "GET", url: "/api/todos" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ todos: [] });
  });

  it("returns all todos when database has todos", async () => {
    db.insert(todos)
      .values({
        id: "abc-123",
        text: "Test todo",
        completed: false,
        createdAt: "2026-03-17T10:00:00.000Z",
      })
      .run();
    db.insert(todos)
      .values({
        id: "abc-456",
        text: "Second todo",
        completed: true,
        createdAt: "2026-03-17T11:00:00.000Z",
      })
      .run();

    const res = await app.inject({ method: "GET", url: "/api/todos" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.todos).toHaveLength(2);
    expect(body.todos[0].text).toBe("Second todo");
    expect(body.todos[1].text).toBe("Test todo");
  });

  it("returns todos with camelCase fields (id, text, completed, createdAt)", async () => {
    db.insert(todos)
      .values({
        id: "def-456",
        text: "Check fields",
        completed: false,
        createdAt: new Date().toISOString(),
      })
      .run();

    const res = await app.inject({ method: "GET", url: "/api/todos" });
    const body = JSON.parse(res.body);
    const todo = body.todos[0];

    expect(todo).toHaveProperty("id");
    expect(todo).toHaveProperty("text");
    expect(todo).toHaveProperty("completed");
    expect(todo).toHaveProperty("createdAt");
    expect(todo).not.toHaveProperty("created_at");
    expect(typeof todo.completed).toBe("boolean");
  });

  it("returns todos ordered by createdAt descending (newest first)", async () => {
    const older = "2026-03-01T10:00:00.000Z";
    const newer = "2026-03-17T10:00:00.000Z";

    db.insert(todos)
      .values({ id: "old-1", text: "Older todo", completed: false, createdAt: older })
      .run();
    db.insert(todos)
      .values({ id: "new-1", text: "Newer todo", completed: false, createdAt: newer })
      .run();

    const res = await app.inject({ method: "GET", url: "/api/todos" });
    const body = JSON.parse(res.body);
    expect(body.todos).toHaveLength(2);
    expect(body.todos[0].id).toBe("new-1");
    expect(body.todos[1].id).toBe("old-1");
  });
});

describe("POST /api/todos", () => {
  const UUID_V4_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  let app: ReturnType<typeof buildApp>;
  let db: ReturnType<typeof getDb>;

  beforeEach(() => {
    const config = { ...getConfig(), LOG_LEVEL: "silent" };
    db = getDb(":memory:");
    runMigrations(db);
    app = buildApp(config, db);
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns 201 with { todo } containing id, text, completed, createdAt for valid text", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "Buy groceries" },
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty("todo");
    const { todo } = body;
    expect(todo).toHaveProperty("id");
    expect(todo).toHaveProperty("text");
    expect(todo).toHaveProperty("completed");
    expect(todo).toHaveProperty("createdAt");
  });

  it("returned id matches UUID v4 regex pattern", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "Check UUID" },
    });
    const { todo } = JSON.parse(res.body);
    expect(todo.id).toMatch(UUID_V4_REGEX);
  });

  it("trims leading and trailing whitespace from text", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "  trimmed  " },
    });
    expect(res.statusCode).toBe(201);
    const { todo } = JSON.parse(res.body);
    expect(todo.text).toBe("trimmed");
  });

  it("strips HTML tags from text before storing", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "<b>hello</b>" },
    });
    expect(res.statusCode).toBe(201);
    const { todo } = JSON.parse(res.body);
    expect(todo.text).toBe("hello");
  });

  it("returns 400 with VALIDATION_ERROR for empty text", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "" },
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toBe("VALIDATION_ERROR");
    expect(body).toHaveProperty("message");
  });

  it("returns 400 with VALIDATION_ERROR for whitespace-only text", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "   " },
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toBe("VALIDATION_ERROR");
  });

  it("returns 400 with VALIDATION_ERROR for text exceeding 128 characters", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "a".repeat(129) },
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toBe("VALIDATION_ERROR");
  });

  it("returns completed: false and valid ISO 8601 createdAt in response", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "ISO date check" },
    });
    expect(res.statusCode).toBe(201);
    const { todo } = JSON.parse(res.body);
    expect(todo.completed).toBe(false);
    expect(new Date(todo.createdAt).toISOString()).toBe(todo.createdAt);
  });

  it("returns 400 for malformed JSON body", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      headers: { "content-type": "application/json" },
      payload: "not valid json{",
    });
    expect(res.statusCode).toBe(400);
  });

  it("created todo appears in subsequent GET /api/todos response", async () => {
    await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "Integration check" },
    });

    const getRes = await app.inject({ method: "GET", url: "/api/todos" });
    const body = JSON.parse(getRes.body);
    expect(body.todos).toHaveLength(1);
    expect(body.todos[0].text).toBe("Integration check");
  });
});
