import { buildApp } from "../app";
import { getConfig } from "../config";
import { getDb } from "../db/client";
import { runMigrations } from "../db/migrate";
import { todos } from "../db/schema";
import * as shared from "@todo-bmad/shared";

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

  it("returns todos with camelCase fields (id, text, completed, createdAt, completedAt)", async () => {
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
    expect(todo).toHaveProperty("completedAt");
    expect(todo).not.toHaveProperty("created_at");
    expect(todo).not.toHaveProperty("completed_at");
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

  it("returns 201 with { todo } containing id, text, completed, createdAt, completedAt for valid text", async () => {
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
    expect(todo).toHaveProperty("completedAt");
    expect(todo.completedAt).toBeNull();
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

  it("stores text containing HTML characters as-is without stripping", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "<b>hello</b>" },
    });
    expect(res.statusCode).toBe(201);
    const { todo } = JSON.parse(res.body);
    expect(todo.text).toBe("<b>hello</b>");
  });

  it("accepts and stores text that consists entirely of HTML tags", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "<b></b>" },
    });
    expect(res.statusCode).toBe(201);
    const { todo } = JSON.parse(res.body);
    expect(todo.text).toBe("<b></b>");
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

  it("accepts text at exactly 128 characters", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "a".repeat(128) },
    });
    expect(res.statusCode).toBe(201);
    const { todo } = JSON.parse(res.body);
    expect(todo.text).toHaveLength(128);
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

  it("returns completed: false, valid ISO 8601 createdAt, and completedAt: null in response", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "ISO date check" },
    });
    expect(res.statusCode).toBe(201);
    const { todo } = JSON.parse(res.body);
    expect(todo.completed).toBe(false);
    expect(new Date(todo.createdAt).toISOString()).toBe(todo.createdAt);
    expect(todo.completedAt).toBeNull();
  });

  it("rejects request body exceeding 10KB", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ text: "a", padding: "x".repeat(11000) }),
    });
    expect(res.statusCode).toBe(413);
  });

  it("returns 400 with VALIDATION_ERROR for malformed JSON body", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      headers: { "content-type": "application/json" },
      payload: "not valid json{",
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toBe("VALIDATION_ERROR");
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

describe("PATCH /api/todos/:id", () => {
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

  it("returns 200 with updated todo when active todo is set to completed: true", async () => {
    db.insert(todos)
      .values({
        id: "11111111-0000-4000-a000-000000000001",
        text: "Test todo",
        completed: false,
        createdAt: "2026-03-17T10:00:00.000Z",
      })
      .run();

    const res = await app.inject({
      method: "PATCH",
      url: "/api/todos/11111111-0000-4000-a000-000000000001",
      payload: { completed: true },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty("todo");
    expect(body.todo.completed).toBe(true);
  });

  it("sets completedAt to ISO timestamp when completing a todo", async () => {
    db.insert(todos)
      .values({
        id: "11111111-0000-4000-a000-000000000002",
        text: "Complete me",
        completed: false,
        createdAt: "2026-03-17T10:00:00.000Z",
      })
      .run();

    const before = new Date().toISOString();
    const res = await app.inject({
      method: "PATCH",
      url: "/api/todos/11111111-0000-4000-a000-000000000002",
      payload: { completed: true },
    });
    const after = new Date().toISOString();

    expect(res.statusCode).toBe(200);
    const { todo } = JSON.parse(res.body);
    expect(todo.completedAt).not.toBeNull();
    expect(typeof todo.completedAt).toBe("string");
    expect(new Date(todo.completedAt).toISOString()).toBe(todo.completedAt);
    expect(todo.completedAt >= before).toBe(true);
    expect(todo.completedAt <= after).toBe(true);
  });

  it("sets completedAt to null when uncompleting a todo", async () => {
    db.insert(todos)
      .values({
        id: "11111111-0000-4000-a000-000000000003",
        text: "Uncomplete me",
        completed: true,
        createdAt: "2026-03-17T10:00:00.000Z",
        completedAt: "2026-03-17T11:00:00.000Z",
      })
      .run();

    const res = await app.inject({
      method: "PATCH",
      url: "/api/todos/11111111-0000-4000-a000-000000000003",
      payload: { completed: false },
    });

    expect(res.statusCode).toBe(200);
    const { todo } = JSON.parse(res.body);
    expect(todo.completed).toBe(false);
    expect(todo.completedAt).toBeNull();
  });

  it("returns 200 with updated todo when completed todo is set to completed: false", async () => {
    db.insert(todos)
      .values({
        id: "11111111-0000-4000-a000-000000000004",
        text: "Done todo",
        completed: true,
        createdAt: "2026-03-17T10:00:00.000Z",
      })
      .run();

    const res = await app.inject({
      method: "PATCH",
      url: "/api/todos/11111111-0000-4000-a000-000000000004",
      payload: { completed: false },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.todo.completed).toBe(false);
  });

  it("response contains all fields (id, text, completed, createdAt, completedAt) with correct values", async () => {
    db.insert(todos)
      .values({
        id: "11111111-0000-4000-a000-000000000005",
        text: "Field check",
        completed: false,
        createdAt: "2026-03-17T10:00:00.000Z",
      })
      .run();

    const res = await app.inject({
      method: "PATCH",
      url: "/api/todos/11111111-0000-4000-a000-000000000005",
      payload: { completed: true },
    });

    expect(res.statusCode).toBe(200);
    const { todo } = JSON.parse(res.body);
    expect(todo.id).toBe("11111111-0000-4000-a000-000000000005");
    expect(todo.text).toBe("Field check");
    expect(todo.completed).toBe(true);
    expect(todo.createdAt).toBe("2026-03-17T10:00:00.000Z");
    expect(todo.completedAt).not.toBeNull();
  });

  it("returns 404 with NOT_FOUND error for non-existent todo ID", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/api/todos/99999999-0000-4000-a000-000000000000",
      payload: { completed: true },
    });

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.body);
    expect(body.error).toBe("NOT_FOUND");
    expect(body).toHaveProperty("message");
  });

  it("returns 400 with VALIDATION_ERROR when id is not a valid UUID", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/api/todos/not-a-uuid",
      payload: { completed: true },
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toBe("VALIDATION_ERROR");
    expect(body).toHaveProperty("message");
  });

  it("returns 400 with VALIDATION_ERROR when completed field is missing", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/api/todos/00000000-0000-4000-a000-000000000000",
      payload: {},
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toBe("VALIDATION_ERROR");
  });

  it("returns 400 with VALIDATION_ERROR when completed is a string (e.g. 'true')", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/api/todos/00000000-0000-4000-a000-000000000000",
      payload: { completed: "true" },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toBe("VALIDATION_ERROR");
  });

  it("returns 400 with VALIDATION_ERROR for empty body", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/api/todos/00000000-0000-4000-a000-000000000000",
      headers: { "content-type": "application/json" },
      payload: "{}",
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toBe("VALIDATION_ERROR");
  });

  it("updated todo reflects change in subsequent GET /api/todos", async () => {
    db.insert(todos)
      .values({
        id: "11111111-0000-4000-a000-000000000006",
        text: "Integration todo",
        completed: false,
        createdAt: "2026-03-17T10:00:00.000Z",
      })
      .run();

    await app.inject({
      method: "PATCH",
      url: "/api/todos/11111111-0000-4000-a000-000000000006",
      payload: { completed: true },
    });

    const getRes = await app.inject({ method: "GET", url: "/api/todos" });
    const body = JSON.parse(getRes.body);
    expect(body.todos).toHaveLength(1);
    expect(body.todos[0].completed).toBe(true);
  });
});

describe("POST /api/todos - non-ZodError re-throw", () => {
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
    jest.restoreAllMocks();
  });

  it("returns 500 when createTodoSchema.parse throws a non-ZodError", async () => {
    jest.spyOn(shared.createTodoSchema, "parse").mockImplementationOnce(() => {
      throw new Error("unexpected internal error");
    });

    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "Test" },
    });

    expect(res.statusCode).toBe(500);
  });
});

describe("PATCH /api/todos/:id - non-ZodError re-throw", () => {
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
    jest.restoreAllMocks();
  });

  it("returns 500 when updateTodoSchema.parse throws a non-ZodError", async () => {
    jest.spyOn(shared.updateTodoSchema, "parse").mockImplementationOnce(() => {
      throw new Error("unexpected internal error");
    });

    const res = await app.inject({
      method: "PATCH",
      url: "/api/todos/00000000-0000-4000-a000-000000000001",
      payload: { completed: true },
    });

    expect(res.statusCode).toBe(500);
  });
});

describe("DELETE /api/todos/:id", () => {
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

  it("returns 204 with empty body when deleting an existing todo", async () => {
    db.insert(todos)
      .values({
        id: "22222222-0000-4000-a000-000000000001",
        text: "Test todo",
        completed: false,
        createdAt: "2026-03-17T10:00:00.000Z",
      })
      .run();

    const res = await app.inject({
      method: "DELETE",
      url: "/api/todos/22222222-0000-4000-a000-000000000001",
    });

    expect(res.statusCode).toBe(204);
    expect(res.body).toBe("");
  });

  it("returns 404 with NOT_FOUND error for non-existent todo ID", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: "/api/todos/99999999-0000-4000-a000-000000000001",
    });

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.body);
    expect(body.error).toBe("NOT_FOUND");
    expect(body).toHaveProperty("message");
  });

  it("deleted todo no longer appears in GET /api/todos", async () => {
    db.insert(todos)
      .values({
        id: "22222222-0000-4000-a000-000000000001",
        text: "To be deleted",
        completed: false,
        createdAt: "2026-03-17T10:00:00.000Z",
      })
      .run();

    await app.inject({ method: "DELETE", url: "/api/todos/22222222-0000-4000-a000-000000000001" });

    const getRes = await app.inject({ method: "GET", url: "/api/todos" });
    const body = JSON.parse(getRes.body);
    expect(body.todos).toHaveLength(0);
  });

  it("returns 404 when deleting an already-deleted todo (idempotency boundary)", async () => {
    db.insert(todos)
      .values({
        id: "22222222-0000-4000-a000-000000000001",
        text: "Test todo",
        completed: false,
        createdAt: "2026-03-17T10:00:00.000Z",
      })
      .run();

    await app.inject({ method: "DELETE", url: "/api/todos/22222222-0000-4000-a000-000000000001" });

    const res = await app.inject({
      method: "DELETE",
      url: "/api/todos/22222222-0000-4000-a000-000000000001",
    });

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.body);
    expect(body.error).toBe("NOT_FOUND");
  });

  it("returns 400 with VALIDATION_ERROR when id is not a valid UUID", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: "/api/todos/not-a-uuid",
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toBe("VALIDATION_ERROR");
    expect(body).toHaveProperty("message");
  });
});

describe("Rate limiting", () => {
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

  it("returns 429 after exceeding 120 requests per minute from the same source", async () => {
    // Under app.inject(), @fastify/rate-limit keys by request.ip, which defaults
    // to "127.0.0.1" for all injected requests — so all 121 requests are treated
    // as the same client and the limit is correctly triggered on the 121st.
    for (let i = 0; i < 119; i++) {
      await app.inject({ method: "GET", url: "/api/todos" });
    }
    // The 120th request must succeed (still within the limit)
    const withinLimit = await app.inject({ method: "GET", url: "/api/todos" });
    expect(withinLimit.statusCode).toBe(200);
    // The 121st request must be rate-limited
    const overLimit = await app.inject({ method: "GET", url: "/api/todos" });
    expect(overLimit.statusCode).toBe(429);
  });
});

describe("Security headers (Helmet)", () => {
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

  it("sets X-Content-Type-Options: nosniff on responses", async () => {
    const res = await app.inject({ method: "GET", url: "/api/todos" });
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("sets X-Frame-Options on responses", async () => {
    const res = await app.inject({ method: "GET", url: "/api/todos" });
    expect(res.headers["x-frame-options"]).toBeDefined();
  });

  it("sets Cross-Origin-Opener-Policy and Referrer-Policy headers", async () => {
    const res = await app.inject({ method: "GET", url: "/api/todos" });
    expect(res.headers["cross-origin-opener-policy"]).toBeDefined();
    expect(res.headers["referrer-policy"]).toBeDefined();
  });

  it("sets security headers on rate-limited 429 responses", async () => {
    for (let i = 0; i < 120; i++) {
      await app.inject({ method: "GET", url: "/api/todos" });
    }
    const res = await app.inject({ method: "GET", url: "/api/todos" });
    expect(res.statusCode).toBe(429);
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBeDefined();
  });
});
