import { buildApp } from "./app";
import { getConfig } from "./config";
import { getDb } from "./db/client";
import { runMigrations } from "./db/migrate";

describe("App", () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    const db = getDb(":memory:");
    runMigrations(db);
    app = buildApp({ ...getConfig(), LOG_LEVEL: "silent" }, db);
  });

  afterEach(async () => {
    await app.close();
  });

  it("boots and responds to requests", async () => {
    const res = await app.inject({ method: "GET", url: "/nonexistent" });
    expect(res.statusCode).toBe(404);
  });

  it("CORS allows configured origin", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/nonexistent",
      headers: {
        origin: "http://localhost:3000",
      },
    });
    expect(res.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000"
    );
  });

  it("CORS rejects unknown origin", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/nonexistent",
      headers: {
        origin: "http://evil.com",
      },
    });
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("unhandled errors return { error, message } format without internals", async () => {
    app.get("/throw", async () => {
      throw new Error("secret internal message");
    });
    const res = await app.inject({ method: "GET", url: "/throw" });
    expect(res.statusCode).toBe(500);
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty("error");
    expect(body).toHaveProperty("message");
    expect(body.message).toBe("An unexpected error occurred");
    expect(body.message).not.toContain("secret internal message");
    expect(body).not.toHaveProperty("stack");
  });

  it("request IDs are present in responses", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/nonexistent",
      headers: { "x-request-id": "test-id-123" },
    });
    expect(res.headers["x-request-id"]).toBe("test-id-123");
  });

  it("auto-generates a request ID when none is provided", async () => {
    const res = await app.inject({ method: "GET", url: "/nonexistent" });
    expect(res.headers["x-request-id"]).toBeDefined();
  });
});
