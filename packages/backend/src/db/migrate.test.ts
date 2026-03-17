import { getDb } from "./client";
import { runMigrations } from "./migrate";

describe("Migrations", () => {
  it("creates the todos table with correct columns", () => {
    const db = getDb(":memory:");
    runMigrations(db);

    const result = db.$client
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='todos'")
      .get() as { name: string } | undefined;

    expect(result).toBeDefined();
    expect(result?.name).toBe("todos");

    const columns = db.$client
      .prepare("PRAGMA table_info(todos)")
      .all() as Array<{ name: string; type: string; notnull: number; dflt_value: unknown; pk: number }>;

    const colMap = Object.fromEntries(columns.map((c) => [c.name, c]));

    expect(colMap["id"]).toBeDefined();
    expect(colMap["id"].pk).toBe(1);

    expect(colMap["text"]).toBeDefined();
    expect(colMap["text"].notnull).toBe(1);

    expect(colMap["completed"]).toBeDefined();
    expect(colMap["completed"].notnull).toBe(1);

    expect(colMap["created_at"]).toBeDefined();
    expect(colMap["created_at"].notnull).toBe(1);
  });

  it("running migrations twice is idempotent", () => {
    const db = getDb(":memory:");
    expect(() => {
      runMigrations(db);
      runMigrations(db);
    }).not.toThrow();
  });
});
