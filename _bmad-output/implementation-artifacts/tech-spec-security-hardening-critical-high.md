---
title: 'Security Hardening: Critical & High Findings'
slug: 'security-hardening-critical-high'
created: '2026-03-20'
status: 'implementation-complete'
stepsCompleted: [1, 2, 3, 4]
tech_stack:
  - Fastify 5 (backend)
  - Next.js 16 (frontend)
  - '@fastify/rate-limit'
  - '@fastify/helmet'
  - Zod (shared validation)
  - TypeScript
files_to_modify:
  - packages/backend/src/config.ts
  - packages/backend/src/app.ts
  - packages/backend/src/routes/todos.ts
  - packages/backend/src/routes/todos.test.ts
  - packages/backend/src/plugins/rate-limit.ts (new)
  - packages/backend/src/plugins/helmet.ts (new)
  - packages/backend/package.json
  - packages/backend/.env.example
  - packages/frontend/.env.example
  - packages/frontend/next.config.ts
  - .env.example (root)
  - _bmad-output/implementation-artifacts/1-4-create-todo-endpoint.md
  - _bmad-output/implementation-artifacts/1-5-update-todo-endpoint.md
  - _bmad-output/implementation-artifacts/1-6-delete-todo-endpoint.md
code_patterns:
  - Fastify plugin wrapping pattern (fp from fastify-plugin)
  - Zod schema validation for body; inline regex check for path params
  - 100% Jest coverage gate enforced by coverageThreshold
test_patterns:
  - app.inject() for backend route integration tests
  - Jest describe/it blocks per route/feature
  - Non-UUID IDs in existing PATCH/DELETE tests must be updated to real UUIDs
---

# Tech-Spec: Security Hardening: Critical & High Findings

**Created:** 2026-03-20

## Overview

### Problem Statement

An adversarial security review identified six critical and high-severity issues in the codebase:

1. **[Critical]** `REVALIDATION_SECRET` is declared in both backend (`AppConfig`) and frontend (`.env.example`) but is never validated or enforced anywhere. It is dead security infrastructure that provides a false sense of protection.
2. **[Critical]** `REVALIDATION_SECRET` defaults to an empty string (`""`) in `getConfig()`, meaning the "secret" is effectively nothing if the env var is absent.
3. **[High]** `stripHtmlTags` in `routes/todos.ts` is the wrong sanitisation layer: React JSX already fully escapes `{todo.text}` at render, so the backend strip provides zero XSS protection while silently corrupting valid user input (e.g., `Buy <milk>` becomes `Buy `). It is also only applied to `POST`, not consistently across the API surface.
4. **[High]** No rate limiting exists on any backend endpoint. Any client with network access can flood `POST /api/todos` until disk is exhausted, or hammer `/api/health` to force continuous DB load.
5. **[High]** Neither service sets HTTP security headers. The Next.js frontend has no `headers()` config in `next.config.ts`. The Fastify backend has no `@fastify/helmet`. Neither sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, or `Content-Security-Policy`.
6. **[High]** Route path parameter `id` in `PATCH /api/todos/:id` and `DELETE /api/todos/:id` is passed to Drizzle ORM without UUID format validation. While Drizzle's parameterized queries prevent SQL injection, there is no guard against arbitrarily long or malformed strings.

### Solution

- Remove `REVALIDATION_SECRET` entirely from both services (config, `.env.example`). It is overkill for a personal todo app at this stage.
- Remove `stripHtmlTags` from the backend. Rely on React's JSX escaping (the correct and already-complete layer). Input containing angle brackets will be stored and rendered safely as text.
- Install `@fastify/rate-limit` and configure a 120 req/min global limit.
- Install `@fastify/helmet` and register it on the Fastify app with CSP disabled (it is a JSON API; CSP applies to HTML responses).
- Add HTTP security headers to `next.config.ts` via the `headers()` async function.
- Add inline UUID regex validation at the top of the PATCH and DELETE route handlers, returning `400 VALIDATION_ERROR` for non-UUID IDs.

### Scope

**In Scope:**
- Remove `REVALIDATION_SECRET` from `packages/backend/src/config.ts` and all three `.env.example` files (backend, frontend, repo root)
- Remove `stripHtmlTags` from `packages/backend/src/routes/todos.ts`; simplify POST handler; update/remove affected tests
- Update story `1-4-create-todo-endpoint.md` Dev Agent Record to note the removal
- Install and register `@fastify/rate-limit` on backend (120 req/min global)
- Install and register `@fastify/helmet` on backend
- Add security headers to `packages/frontend/next.config.ts`
- Add UUID path param validation to PATCH and DELETE handlers; update existing tests to use real UUID values

**Out of Scope:**
- Authentication / authorisation (intentional for personal app)
- CORS_ORIGIN startup validation
- `apiError.message` propagation to UI
- `NEXT_PUBLIC_API_URL` baked into Docker build
- Health endpoint authentication
- `API_URL` SSRF mitigation

---

## Context for Development

### Codebase Patterns

- **Plugin pattern:** All Fastify plugins are wrapped with `fp` from `fastify-plugin`. New plugins (`rate-limit.ts`, `helmet.ts`) must follow the same pattern as `cors.ts` and `error-handler.ts`.
- **Registration order in `app.ts`:** Currently: `corsPlugin` → `errorHandlerPlugin` → `healthRoutes` → `todosRoutes`. New security plugins should be registered before route plugins: `corsPlugin` → `rateLimitPlugin` → `helmetPlugin` → `errorHandlerPlugin` → routes.
- **Body validation:** Zod is used manually in handlers (parse → catch ZodError → 400). Path param validation follows the same explicit pattern — add inline UUID regex check at the top of the PATCH and DELETE handlers.
- **Test structure:** Each route has an integration test in `todos.test.ts` using `app.inject()` with an in-memory SQLite DB. New behaviour (rate limit 429, UUID 400, security headers) gets new `it()` blocks in the relevant `describe()`.
- **Coverage gate:** 100% coverage is mandatory. Any new code paths introduced must be tested. Any removed code paths (stripHtmlTags) must have their tests removed too.
- **Config structure:** `AppConfig` is a plain interface. `getConfig()` reads from `process.env` with fallbacks. Simply delete the `REVALIDATION_SECRET` field from both.

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `packages/backend/src/plugins/cors.ts` | Plugin wrapping pattern to copy for rate-limit and helmet |
| `packages/backend/src/app.ts` | Plugin registration order; where to add new plugins |
| `packages/backend/src/config.ts` | Remove `REVALIDATION_SECRET` from `AppConfig` and `getConfig()` |
| `packages/backend/src/routes/todos.ts` | Remove `stripHtmlTags`; add UUID validation to PATCH/DELETE |
| `packages/backend/src/routes/todos.test.ts` | Tests needing update: strip tests removed, UUID tests added, PATCH/DELETE IDs updated |
| `packages/frontend/next.config.ts` | Add `headers()` async function |
| `packages/backend/.env.example` | Remove `REVALIDATION_SECRET` line |
| `packages/frontend/.env.example` | Remove `REVALIDATION_SECRET` line |
| `_bmad-output/implementation-artifacts/1-4-create-todo-endpoint.md` | Update Dev Agent Record: note `stripHtmlTags` removed in this story |

### Technical Decisions

- **`stripHtmlTags` removal — no Zod replacement needed.** React's JSX rendering (`{todo.text}`) fully escapes all special characters at render time. Angle brackets in stored text (`<b>hello</b>`) are rendered as literal text, not HTML. No additional server-side sanitisation is required.
- **Helmet CSP disabled.** The Fastify backend serves only JSON API responses. CSP is a browser-side protection for HTML documents and has no effect on a JSON API. Disabling it avoids Helmet injecting a `Content-Security-Policy` header on JSON responses, which would be misleading.
- **Next.js CSP uses `'unsafe-inline'` and `'unsafe-eval'` pragmatically.** Next.js's runtime hydration injects inline scripts and uses `eval`-based constructs in development. A nonce-based strict CSP would require Next.js middleware configuration and is significantly more complex. The pragmatic approach adds the other defensive headers (which are pure wins) and a basic CSP that excludes external script origins. This is a documented limitation, not a defect. The `connect-src` directive explicitly includes `NEXT_PUBLIC_API_URL` because the frontend and API run on different origins; `'self'` alone would block client-side API fetches.
- **`X-XSS-Protection` is intentionally omitted.** This header is a legacy IE/Chrome-era mechanism that modern browsers have removed or disabled. Current OWASP guidance and MDN both recommend against setting it, as it can introduce vulnerabilities in some browsers. The CSP `script-src` directive is the correct modern replacement.
- **UUID validation: inline regex, not Fastify JSON Schema.** `format: 'uuid'` in Fastify's JSON Schema params requires `ajv-formats` to be registered. The existing codebase does not use Fastify schema validation at all (it uses Zod for body). An inline regex check in the handler is consistent with the existing pattern and avoids adding `ajv-formats` as a dependency.
- **Rate limit: global, not per-route.** A 120 req/min global limit is appropriate for a single-user personal app. Per-route limits (e.g. tighter on POST) can be layered on later. `@fastify/rate-limit` is the official Fastify plugin and follows the same registration pattern as `@fastify/cors`.
- **PATCH/DELETE test IDs must be updated.** Existing tests use non-UUID IDs like `"test-id-1"` in both the seeded DB and the URL. Once UUID validation is added, requests to `/api/todos/test-id-1` will return `400` before touching the DB. All `db.insert()` seed values and corresponding URL paths must be updated to valid UUID v4 strings.
- **UUID check before body parse: error precedence is intentional.** Because the UUID regex runs before Zod body parsing in PATCH, a request with both an invalid `:id` and an invalid body returns `400 VALIDATION_ERROR` for the ID reason, not for the body reason. This is acceptable — both are client errors and both get `400 VALIDATION_ERROR`. The ID check runs first for efficiency (reject without parsing body). This is a deliberate contract choice, not an oversight.
- **UUID regex matches v4 only, consistent with `randomUUID()`.** The regex `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i` is RFC 4122 variant-1, version-4 only. All todo IDs are generated by Node's `randomUUID()`, which always produces v4 UUIDs. No migration path involves non-v4 UUIDs. The regex is therefore a safe and exact match for the ID space.

---

## Implementation Plan

### Tasks

**Task 1 — Remove `REVALIDATION_SECRET` from backend config**
- File: `packages/backend/src/config.ts`
- Delete `REVALIDATION_SECRET: string` from the `AppConfig` interface
- Delete `REVALIDATION_SECRET: process.env.REVALIDATION_SECRET ?? "",` from the return object in `getConfig()`

**Task 2 — Remove `REVALIDATION_SECRET` from all `.env.example` files**
- File: `packages/backend/.env.example` — delete the line `REVALIDATION_SECRET=your-secret-here`
- File: `packages/frontend/.env.example` — delete the line `REVALIDATION_SECRET=your-secret-here`
- File: `.env.example` (repo root) — delete the line `REVALIDATION_SECRET=your-secret-here` from the `# Backend` section
- Note: `REVALIDATION_SECRET` also appears in historical planning/story docs (`architecture.md`, `epics.md`, `1-1-project-scaffolding-shared-api-contract.md`, `1-2-backend-server-foundation.md`, `1-8-empty-state-isr-page.md`, `tech-spec-docker-compose-containerization.md`). These are **archived historical records** describing what was built at the time — they do not need updating as they accurately reflect the past state. Only the **active operational files** (`.env.example` templates and `config.ts`) require cleanup.

**Task 3 — Remove `stripHtmlTags` from `todos.ts` and simplify POST handler**
- File: `packages/backend/src/routes/todos.ts`
- Delete the entire `stripHtmlTags` helper function (lines 9–11)
- In the POST handler, remove the call to `stripHtmlTags` and the subsequent empty-check block. Replace with:
  ```ts
  const text = parsed.text; // Zod schema already calls .trim() and enforces min(1)/max(128)
  ```
- Remove the `if (text.length === 0)` guard block that followed the strip call (it was only needed to catch tags-only input after stripping; Zod now handles all empty/short validation)
- Update the DB insert and response to use `text` directly (already was `text` after the strip, no variable rename needed)

**Task 4 — Install `@fastify/rate-limit`**
- Run: `npm install @fastify/rate-limit` from `packages/backend/`
- This modifies `packages/backend/package.json` (adds dependency) and the root `package-lock.json`

**Task 5 — Create rate-limit plugin**
- File: `packages/backend/src/plugins/rate-limit.ts` (new file)
- Pattern: copy structure from `cors.ts` exactly
  ```ts
  import rateLimit from "@fastify/rate-limit";
  import { FastifyInstance } from "fastify";
  import fp from "fastify-plugin";

  export const rateLimitPlugin = fp(async (app: FastifyInstance) => {
    await app.register(rateLimit, {
      max: 120,
      timeWindow: "1 minute",
    });
  });
  ```

**Task 6 — Install `@fastify/helmet`**
- Run: `npm install @fastify/helmet` from `packages/backend/`
- This modifies `packages/backend/package.json` (adds dependency) and the root `package-lock.json`

**Task 7 — Create helmet plugin**
- File: `packages/backend/src/plugins/helmet.ts` (new file)
  ```ts
  import helmet from "@fastify/helmet";
  import { FastifyInstance } from "fastify";
  import fp from "fastify-plugin";

  export const helmetPlugin = fp(async (app: FastifyInstance) => {
    await app.register(helmet, {
      contentSecurityPolicy: false,
    });
  });
  ```

**Task 8 — Register new plugins in `app.ts`**
- File: `packages/backend/src/app.ts`
- Add imports: `import { rateLimitPlugin } from "./plugins/rate-limit";` and `import { helmetPlugin } from "./plugins/helmet";`
- Register in order immediately after `corsPlugin`: `app.register(rateLimitPlugin);` then `app.register(helmetPlugin);`
- Final registration order: `corsPlugin` → `rateLimitPlugin` → `helmetPlugin` → `errorHandlerPlugin` → `healthRoutes` → `todosRoutes`

**Task 9 — Add UUID path param validation to PATCH and DELETE handlers**
- File: `packages/backend/src/routes/todos.ts`
- Add a module-level constant at the top of the file (below imports):
  ```ts
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  ```
- In `PATCH /api/todos/:id` handler: add as the very first statement in the handler body (before the Zod parse):
  ```ts
  if (!UUID_REGEX.test(request.params.id)) {
    return reply.status(400).send({ error: VALIDATION_ERROR, message: "Invalid todo id" });
  }
  ```
- In `DELETE /api/todos/:id` handler: add the same check as the very first statement in the handler body

**Task 10 — Add security headers to `next.config.ts`**
- File: `packages/frontend/next.config.ts`
- At the top of the file (after existing imports), read the API URL for the CSP:
  ```ts
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  ```
- Add an `async headers()` function to `nextConfig`. Note: `X-XSS-Protection` is intentionally omitted — it is a legacy header that modern browser security guidance considers obsolete and potentially harmful.
  ```ts
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com",
              "img-src 'self' data:",
              `connect-src 'self' ${apiUrl}`,
            ].join("; "),
          },
        ],
      },
    ];
  },
  ```
- **Why `connect-src` includes `apiUrl`:** The frontend page origin (`localhost:3000`) and the API origin (`localhost:3001`) are different. `'self'` only covers the page's own origin. Browser-initiated API fetches from client components go to `NEXT_PUBLIC_API_URL`; without it in `connect-src` those fetches would be blocked by the CSP. Since `NEXT_PUBLIC_API_URL` is baked at build time, reading it at module level in `next.config.ts` produces the correct value for each environment's build.

**Task 11 — Update `todos.test.ts`: remove strip tests, fix UUID IDs, add new tests**
- File: `packages/backend/src/routes/todos.test.ts`

  **Remove these two tests** from `describe("POST /api/todos")`:
  - `"strips HTML tags from text before storing"` (the behavior is removed)
  - `"returns 400 with VALIDATION_ERROR when text is only HTML tags"` (behavior changes: `<b></b>` is now a valid 7-char string that passes validation)

  **Add these two new tests** to `describe("POST /api/todos")`:
  ```ts
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

  it("accepts and stores tags-only text that was previously rejected after stripping", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/todos",
      payload: { text: "<b></b>" },
    });
    expect(res.statusCode).toBe(201);
    const { todo } = JSON.parse(res.body);
    expect(todo.text).toBe("<b></b>");
  });
  ```

  **Update all PATCH test IDs** — replace every non-UUID seed ID and URL path with valid UUIDs. Use these specific replacement values for consistency:
  | Old ID | New UUID |
  |--------|----------|
  | `"test-id-1"` (PATCH tests) | `"11111111-0000-4000-a000-000000000001"` |
  | `"test-id-ca1"` | `"11111111-0000-4000-a000-000000000002"` |
  | `"test-id-ca2"` | `"11111111-0000-4000-a000-000000000003"` |
  | `"test-id-2"` | `"11111111-0000-4000-a000-000000000004"` |
  | `"test-id-3"` | `"11111111-0000-4000-a000-000000000005"` |
  | `"test-id-4"` | `"11111111-0000-4000-a000-000000000006"` |

  Update `url` strings in PATCH `app.inject()` calls to match (e.g. `"/api/todos/11111111-0000-4000-a000-000000000001"`).

  **Update the "404 for non-existent" PATCH test**: change `url: "/api/todos/non-existent-id"` to `url: "/api/todos/99999999-0000-4000-a000-000000000000"` (valid UUID format, not in DB).

  **Add UUID validation tests** to `describe("PATCH /api/todos/:id")`:
  ```ts
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
  ```

  **Update all DELETE test IDs** similarly:
  | Old ID | New UUID |
  |--------|----------|
  | `"test-id-1"` (DELETE tests) | `"22222222-0000-4000-a000-000000000001"` |

  Update `url` strings in DELETE `app.inject()` calls to match.

  **Update the "404 for non-existent" DELETE test**: change `url: "/api/todos/non-existent-id"` to `url: "/api/todos/99999999-0000-4000-a000-000000000001"`.

  **Add UUID validation test** to `describe("DELETE /api/todos/:id")`:
  ```ts
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
  ```

  **Add rate limit test** — add a new `describe` block after existing ones:
  ```ts
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
      // Send 121 requests; the 121st should be rate-limited.
      // Under app.inject(), @fastify/rate-limit keys by request.ip, which defaults
      // to "127.0.0.1" for all injected requests — so all 121 requests are treated
      // as the same client and the limit is correctly triggered on the 121st.
      // The window is a fixed 1-minute sliding window; since all requests fire
      // synchronously in the same Jest tick, they all fall within the window.
      for (let i = 0; i < 120; i++) {
        await app.inject({ method: "GET", url: "/api/todos" });
      }
      const res = await app.inject({ method: "GET", url: "/api/todos" });
      expect(res.statusCode).toBe(429);
    });
  });
  ```
  > **Implementation note:** This test runs 121 sequential async calls. Jest's default per-test timeout is 5 seconds. Each `app.inject()` is synchronous in-memory with no network I/O and completes in sub-millisecond time, so 121 calls should complete well within the default timeout. If CI environments show flakiness, increase the test timeout with `jest.setTimeout(15000)` inside the `describe` block.

  **Add security headers test** — add a new `describe` block:
  ```ts
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
  });
  ```

**Task 12 — Update story Dev Agent Records for `stripHtmlTags` removal**

- File: `_bmad-output/implementation-artifacts/1-4-create-todo-endpoint.md`
  - Append to Dev Agent Record:
    > **Post-story amendment (2026-03-20):** `stripHtmlTags` helper and its associated tests were removed in the security hardening spec (`tech-spec-security-hardening-critical-high`). React JSX escaping at render is the correct and complete XSS protection layer for this stack. Storing text verbatim and rendering it safely via `{todo.text}` is the intended pattern going forward.

- File: `_bmad-output/implementation-artifacts/1-5-update-todo-endpoint.md`
  - Find the line stating that `stripHtmlTags` helper **exists** in `routes/todos.ts` and update it to note the function was removed in the security hardening spec.

- File: `_bmad-output/implementation-artifacts/1-6-delete-todo-endpoint.md`
  - Find the line stating that `stripHtmlTags` helper **exists** in `routes/todos.ts` and update it to note the function was removed in the security hardening spec.

---

## Acceptance Criteria

**AC1 — `REVALIDATION_SECRET` is fully removed**

- **Given** `packages/backend/src/config.ts`, **When** the file is read, **Then** neither `REVALIDATION_SECRET` nor `revalidation_secret` appears anywhere in the file.
- **Given** `packages/backend/.env.example`, **When** the file is read, **Then** `REVALIDATION_SECRET` does not appear.
- **Given** `packages/frontend/.env.example`, **When** the file is read, **Then** `REVALIDATION_SECRET` does not appear.
- **Given** `.env.example` (repo root), **When** the file is read, **Then** `REVALIDATION_SECRET` does not appear.
- **Given** the backend app is built with `npm run build`, **When** the build completes, **Then** exit code is 0 with no TypeScript errors.

**AC2 — `stripHtmlTags` is removed; input containing angle brackets is stored as-is**

- **Given** a `POST /api/todos` request with `{ text: "<b>hello</b>" }`, **When** the request is processed, **Then** response status is `201` and `todo.text` is `"<b>hello</b>"`.
- **Given** a `POST /api/todos` request with `{ text: "<b></b>" }`, **When** the request is processed, **Then** response status is `201` and `todo.text` is `"<b></b>"` (no longer rejected).
- **Given** `packages/backend/src/routes/todos.ts`, **When** the file is read, **Then** the string `stripHtmlTags` does not appear anywhere in the file.
- **Given** `npm run test` is run across all packages, **When** the test run completes, **Then** exit code is 0 and coverage is 100% on all metrics.

**AC3 — Rate limiting returns 429 after 120 requests/min**

- **Given** 121 consecutive requests to any API endpoint from the same source within a 1-minute window, **When** the 121st request is received, **Then** the response status is `429`.
- **Given** fewer than 121 requests in a 1-minute window, **When** any valid request is made, **Then** the response status is not `429`.

**AC4 — Backend security headers are present on all responses**

- **Given** any response from `GET /api/todos`, **When** the response headers are inspected, **Then** `x-content-type-options: nosniff` is present.
- **Given** any response from `GET /api/todos`, **When** the response headers are inspected, **Then** `x-frame-options` is present.

**AC5 — Frontend security headers are present on all responses**

- **Given** a request to any Next.js route, **When** the response headers are inspected, **Then** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and a `Content-Security-Policy` header are present.
- **Given** a request to any Next.js route, **When** the `Content-Security-Policy` header is inspected, **Then** `connect-src` includes the value of `NEXT_PUBLIC_API_URL` (not just `'self'`).

**AC6 — UUID path parameter validation returns 400 for non-UUID IDs**

- **Given** a `PATCH /api/todos/not-a-uuid` request with a valid body, **When** the request is processed, **Then** the response status is `400` and `body.error` is `"VALIDATION_ERROR"`.
- **Given** a `DELETE /api/todos/not-a-uuid` request, **When** the request is processed, **Then** the response status is `400` and `body.error` is `"VALIDATION_ERROR"`.
- **Given** a `PATCH /api/todos/{valid-uuid}` request where the UUID does not exist in the DB, **When** the request is processed, **Then** the response status is `404` and `body.error` is `"NOT_FOUND"` (UUID validation passes, DB lookup fails as expected).
- **Given** a `DELETE /api/todos/{valid-uuid}` request where the UUID does not exist in the DB, **When** the request is processed, **Then** the response status is `404` and `body.error` is `"NOT_FOUND"`.

---

## Additional Context

### Dependencies

New packages to install in `packages/backend/`:
- `@fastify/rate-limit` (prod dependency) — official Fastify rate limiting plugin
- `@fastify/helmet` (prod dependency) — official Fastify security headers plugin

No new frontend dependencies.

### Testing Strategy

- All new backend behaviour (rate limiting, helmet headers, UUID validation) is covered by integration tests using `app.inject()` in `todos.test.ts` (or a new `describe` block in the same file).
- The removal of `stripHtmlTags` requires deleting 2 tests and adding 1 replacement test.
- The UUID validation requires updating all PATCH/DELETE seed IDs to real UUIDs and adding 2 new `it()` blocks.
- Frontend header testing is not unit-testable (Next.js `headers()` config is a build-time concern). The AC is verified by manual/E2E inspection. No unit test is added for `next.config.ts`.
- 100% coverage gate must pass after all changes.

### Notes

- **`<b></b>` is now valid input.** This is a deliberate behavior change. The old code rejected it (after stripping, text was empty). The new code accepts it as a 7-character string. This is correct — it's the user's literal input. If they typed `<b></b>`, that's what they get stored.
- **PATCH/DELETE test UUID migration is mechanical but important.** Every single `db.insert()` seed and `app.inject()` URL in the PATCH and DELETE test suites must be updated before running tests, or the entire test suite for those routes will fail with `400` instead of the expected status codes.
- **Helmet plugin registration order.** Helmet must be registered after CORS (`@fastify/cors`) or CORS headers may be overridden. The specified order (cors → rate-limit → helmet → error-handler → routes) is safe.
- **Stories 1-5 and 1-6 must also be amended.** Both explicitly state that `stripHtmlTags` **exists** in `routes/todos.ts`. After removal those lines become false and will mislead any agent using those stories as a reference. Task 12 covers all three story amendments.
