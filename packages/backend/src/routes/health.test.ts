import { buildApp } from "../app";
import { getConfig } from "../config";
import { getDb } from "../db/client";
import { runMigrations } from "../db/migrate";

describe("GET /api/health", () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    const db = getDb(":memory:");
    runMigrations(db);
    app = buildApp({ ...getConfig(), LOG_LEVEL: "silent" }, db);
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns 200 with status ok and db ok", async () => {
    const res = await app.inject({ method: "GET", url: "/api/health" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ status: "ok", db: "ok" });
  });
});
