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
