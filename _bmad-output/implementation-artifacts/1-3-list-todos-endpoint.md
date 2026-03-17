# Story 1.3: List Todos Endpoint

Status: done

## Story

As a user,
I want the system to provide my todo list when requested,
So that I can see all my existing tasks.

## Acceptance Criteria

1. **Given** the backend is running with no todos in the database **When** GET `/api/todos` is called **Then** it returns 200 with `{ todos: [] }`

2. **Given** todos exist in the database **When** GET `/api/todos` is called **Then** it returns 200 with `{ todos: Todo[] }` containing all todos

3. **Given** todos are returned **When** the response is inspected **Then** each todo includes `id`, `text`, `completed`, and `createdAt` fields with camelCase JSON keys

4. **Given** multiple todos exist **When** GET `/api/todos` is called **Then** todos are ordered by `createdAt` descending (newest first)

## Tasks / Subtasks

- [x] Task 1: Pass DB instance into `buildApp()` (AC: #1–#4)
  - [x] 1.1 Update `buildApp()` signature in `app.ts` to accept a `db` parameter (typed as `ReturnType<typeof getDb>`)
  - [x] 1.2 Store `db` on the Fastify instance via `app.decorate('db', db)` so route plugins can access it
  - [x] 1.3 Add a TypeScript module augmentation for Fastify to type the `db` decoration
  - [x] 1.4 Update `index.ts` to pass the `db` instance to `buildApp(config, db)`
  - [x] 1.5 Update `app.test.ts` — create an in-memory DB with migrations in `beforeEach` and pass it to `buildApp(config, db)`. All existing tests must still pass.

- [x] Task 2: Create route handler for GET `/api/todos` (AC: #1–#4)
  - [x] 2.1 Create `src/routes/todos.ts` — export an async Fastify plugin (wrapped with `fastify-plugin`) that registers `GET /api/todos`
  - [x] 2.2 Route handler queries `db.select().from(todos).orderBy(desc(todos.createdAt))` using the Drizzle schema
  - [x] 2.3 Return `{ todos: rows }` with 200 status code
  - [x] 2.4 Register the route plugin in `app.ts` via `app.register(todosRoutes)`

- [x] Task 3: Write tests for GET `/api/todos` (AC: #1–#4)
  - [x] 3.1 Create `src/routes/todos.test.ts` using Fastify `.inject()` with in-memory SQLite
  - [x] 3.2 Test: empty database returns `{ todos: [] }` with 200
  - [x] 3.3 Test: database with todos returns all items in response
  - [x] 3.4 Test: response fields are camelCase (`id`, `text`, `completed`, `createdAt`)
  - [x] 3.5 Test: todos are ordered by `createdAt` descending (newest first)
  - [x] 3.6 Ensure all tests pass via `npm test -w packages/backend`

## Dev Notes

### Architecture Compliance

This is the first API route handler in the project. It establishes the routing pattern that Stories 1.4–1.6 will follow. Get this right, and the remaining CRUD endpoints are straightforward.

**Critical pattern decisions:**
- Routes are registered as Fastify plugins (wrapped with `fastify-plugin` for scope visibility)
- DB is accessed via `app.db` decoration on the Fastify instance
- All route handlers live in `src/routes/` directory
- Route tests are co-located as `src/routes/todos.test.ts`

[Source: architecture.md#API & Communication Patterns, architecture.md#Project Structure & Boundaries]

### Wiring DB into the App

The current `buildApp(config)` does not accept or expose the database. You must update it to accept a `db` parameter and decorate the Fastify instance. This is a prerequisite for all route handlers.

**Pattern for `app.ts`:**

```typescript
import { getDb } from "./db/client";

type DbInstance = ReturnType<typeof getDb>;

declare module "fastify" {
  interface FastifyInstance {
    db: DbInstance;
  }
}

export function buildApp(config: AppConfig, db: DbInstance) {
  const app = Fastify({ /* existing options */ });

  app.decorate("db", db);

  // existing plugin registrations...
  app.register(todosRoutes);

  return app;
}
```

The `declare module "fastify"` augmentation gives TypeScript full type safety when accessing `app.db` in route handlers.

### Route Handler Pattern

**File: `src/routes/todos.ts`**

```typescript
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { desc } from "drizzle-orm";
import { todos } from "../db/schema";

export const todosRoutes = fp(async (app: FastifyInstance) => {
  app.get("/api/todos", async (request, reply) => {
    const rows = app.db.select().from(todos).orderBy(desc(todos.createdAt)).all();
    return { todos: rows };
  });
});
```

Key details:
- Import `desc` from `drizzle-orm` (not from `drizzle-orm/sqlite-core`)
- Use `.all()` for synchronous better-sqlite3 execution (Drizzle with better-sqlite3 is synchronous — no `await` needed, but `await` on a non-Promise is harmless)
- Drizzle automatically maps `created_at` → `createdAt` per the schema definition
- Drizzle returns `completed` as boolean (not 0/1) due to `{ mode: "boolean" }` in the schema
- Response shape is `{ todos: Todo[] }` — wrapping with the resource name, not a generic `data` key

### Drizzle Query Details

The select query with ordering:

```typescript
import { desc } from "drizzle-orm";
import { todos } from "../db/schema";

// Returns all todos, newest first
const rows = db.select().from(todos).orderBy(desc(todos.createdAt)).all();
```

- `desc()` is imported from `drizzle-orm` (the root package)
- `.all()` executes the query and returns all rows as an array
- With better-sqlite3, queries are synchronous — `.all()` returns the array directly
- Drizzle handles the column mapping: DB column `created_at` → TypeScript `createdAt`
- The result type is inferred from the schema — each row has `{ id: string, text: string, completed: boolean, createdAt: string }`

### Testing Strategy

Use the same Fastify `.inject()` pattern established in Story 1.2, but now include database setup since route tests need actual data.

**Test setup pattern for `src/routes/todos.test.ts`:**

```typescript
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
});
```

For tests that need seed data, insert directly via Drizzle:

```typescript
db.insert(todos).values({
  id: crypto.randomUUID(),
  text: "Test todo",
  completed: false,
  createdAt: new Date().toISOString(),
}).run();
```

- Use `:memory:` SQLite — no file cleanup needed
- `LOG_LEVEL: "silent"` suppresses Pino output in test runs
- Each test gets a fresh DB and app instance via `beforeEach`
- Insert test data directly via Drizzle's `.insert().values().run()` — synchronous with better-sqlite3

### Updating Existing Tests

`app.test.ts` must be updated to pass the new `db` parameter to `buildApp()`. Since those tests don't exercise routes that need the database, you can either:
- Create an in-memory DB with migrations (consistent approach), OR
- Create a minimal DB just for decoration (simpler but less consistent)

Recommended: create an in-memory DB with migrations in `app.test.ts` `beforeEach`, matching the route test pattern. This ensures all tests follow the same setup.

### Technology Versions

| Package | Version | Notes |
|---------|---------|-------|
| drizzle-orm | ^0.45.1 | `desc` imported from `drizzle-orm` root |
| fastify | ^5.8 | `app.decorate()` for DB, plugin registration |
| fastify-plugin | ^5.1 | Already installed, use for route plugin |
| better-sqlite3 | ^12.8 | Synchronous queries via `.all()`, `.run()` |

No new dependencies are needed for this story. All required packages are already installed.

### Naming Conventions (Enforced)

| Context | Convention | Example |
|---------|-----------|---------|
| Route file | kebab-case | `todos.ts` |
| Route test file | kebab-case | `todos.test.ts` |
| Plugin export | camelCase | `todosRoutes` |
| API endpoint | kebab-case, plural noun | `/api/todos` |
| JSON response key | camelCase | `createdAt` |
| Exports | Named only | `export const todosRoutes` |

### Target File Structure (This Story)

```
packages/backend/src/
├── index.ts              (MODIFIED — pass db to buildApp)
├── app.ts                (MODIFIED — accept db param, decorate, register routes)
├── app.test.ts           (MODIFIED — pass db to buildApp)
├── config.ts             (unchanged)
├── db/                   (unchanged)
│   ├── schema.ts
│   ├── client.ts
│   ├── migrate.ts
│   └── migrate.test.ts
├── plugins/              (unchanged)
│   ├── cors.ts
│   └── error-handler.ts
└── routes/               (NEW directory)
    ├── todos.ts          (NEW — GET /api/todos route handler)
    └── todos.test.ts     (NEW — route integration tests)
```

### What This Story Does NOT Include

Do NOT implement these — they belong to later stories:
- POST `/api/todos` (Story 1.4)
- PATCH `/api/todos/:id` (Story 1.5)
- DELETE `/api/todos/:id` (Story 1.6)
- POST `/api/revalidate` (Story 1.8+)
- XSS sanitization (Story 1.4)
- Zod request body validation in routes (Story 1.4)
- Any frontend changes
- E2E tests or Playwright configuration

Only implement `GET /api/todos`. The route file (`todos.ts`) will be extended in subsequent stories to add POST, PATCH, and DELETE handlers.

### Anti-Patterns to Avoid

- **Do NOT use `default` exports** — named exports only (`export const todosRoutes`)
- **Do NOT create separate route files per HTTP method** — all `/api/todos` handlers go in `routes/todos.ts`
- **Do NOT add request body validation** — GET has no body; Zod validation is a Story 1.4 concern
- **Do NOT use `db.query` (Drizzle relational queries)** — use `db.select().from()` (SQL-like API) for consistency with subsequent CRUD stories
- **Do NOT return `null` in the API response** — return `{ todos: [] }` for empty results
- **Do NOT add pagination or filtering** — return all todos, no query parameters
- **Do NOT use `app.get('/api/todos', ...)` directly in `app.ts`** — routes must be in the `routes/` directory as plugins
- **Do NOT forget to wrap the route plugin with `fp()` (fastify-plugin)** — without it, the plugin scope is isolated and cannot access `app.db`

### Previous Story Intelligence

**From Story 1.2 (done):**
- `fastify-plugin` (`fp`) is required to escape Fastify's encapsulation — both `corsPlugin` and `errorHandlerPlugin` use it. Route plugins MUST also use it to access `app.db`.
- `@fastify/cors` uses array-form origin (`[config.origin]`) for proper filtering.
- `onSend` hook echoes `x-request-id` in response headers.
- Tests use `LOG_LEVEL: "silent"` to suppress Pino output.
- `node_modules` corruption was encountered during Story 1.2 npm installs — if dependency issues arise, try `rm -rf node_modules && npm install`.

**From Story 1.1 (done):**
- Backend uses `module: CommonJS` + `moduleResolution: node` in tsconfig (critical for better-sqlite3 native module).
- Jest configured with `jest.config.js` (not `.ts`) with `--no-watchman` flag.
- Import shared package as `@todo-bmad/shared`.
- Backend dev command: `tsx watch src/index.ts`.

### Git Workflow

Per `project-context.md`: create feature branch `feat/1-3-list-todos-endpoint` from `main` before starting implementation. Commit incrementally. Do not merge to `main` directly.

### Project Structure Notes

- The `routes/` directory is NEW in this story — it establishes the pattern for all subsequent route stories
- Route tests are co-located with route handlers: `todos.ts` and `todos.test.ts` in the same directory
- The Fastify type augmentation (`declare module "fastify"`) should be placed in `app.ts` where the decoration happens — this keeps the type extension near its implementation

### References

- [Source: architecture.md#API & Communication Patterns] — endpoint spec, response format, error codes
- [Source: architecture.md#Project Structure & Boundaries] — routes directory, test co-location
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — naming, exports, enforcement rules
- [Source: architecture.md#Data Architecture] — Drizzle schema, column mapping
- [Source: architecture.md#Core Architectural Decisions] — API response shape `{ todos: Todo[] }`
- [Source: epics.md#Story 1.3] — acceptance criteria
- [Source: 1-2-backend-server-foundation.md] — DB schema, client, migration, plugin patterns, test patterns

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Debug Log References

No issues encountered. Implementation was straightforward following the pattern established in Story 1.2.

### Completion Notes List

- Updated `buildApp()` to accept `db: DbInstance` parameter and decorated the Fastify instance via `app.decorate("db", db)`
- Added TypeScript module augmentation `declare module "fastify"` in `app.ts` to type the `db` decoration
- Updated `index.ts` to pass the `db` instance to `buildApp(config, db)` 
- Updated `app.test.ts` to create in-memory SQLite DB with migrations in `beforeEach` — all 6 existing tests still pass
- Created `src/routes/todos.ts` as a `fastify-plugin`-wrapped async plugin exporting `todosRoutes`; handler uses `db.select().from(todos).orderBy(desc(todos.createdAt)).all()` (synchronous better-sqlite3 style)
- Registered `todosRoutes` in `app.ts`
- Created `src/routes/todos.test.ts` with 4 tests covering: empty DB returns `{ todos: [] }`, seeded DB returns all items, fields are camelCase, ordering is newest-first
- All 12 backend tests pass; full suite of 29 tests passes; build succeeds; no linter errors

### File List

- packages/backend/src/app.ts (modified)
- packages/backend/src/index.ts (modified)
- packages/backend/src/app.test.ts (modified)
- packages/backend/src/routes/todos.ts (new)
- packages/backend/src/routes/todos.test.ts (new)
- _bmad-output/implementation-artifacts/1-3-list-todos-endpoint.md (modified)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified)

### Change Log

- 2026-03-17: Implemented Story 1.3 — List Todos Endpoint. Wired DB into buildApp(), created GET /api/todos route handler and tests. All ACs satisfied.
- 2026-03-17: Code review (claude-4.6-opus-high-thinking). 0 HIGH, 0 MEDIUM, 2 LOW findings. Fixed both: (1) "returns all todos" test now inserts multiple records and verifies count/order, (2) camelCase fields test now asserts `typeof completed === "boolean"`. Status → done.
