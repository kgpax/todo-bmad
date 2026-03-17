# Story 1.2: Backend Server Foundation

Status: review

## Story

As a developer,
I want a Fastify server with database and core plugins configured,
So that API endpoints can be added incrementally on a solid foundation.

## Acceptance Criteria

1. **Given** the backend package **When** the dev command is run **Then** the Fastify server starts on the configured port (default 3001)

2. **Given** server startup **When** the SQLite database file does not exist **Then** it is created and migrations are applied automatically

3. **Given** server startup **When** migrations have already been applied **Then** the server starts without re-running them

4. **Given** CORS configuration **When** a request arrives from the configured frontend origin **Then** it is allowed through

5. **Given** CORS configuration **When** a request arrives from an unknown origin **Then** it is rejected

6. **Given** any unhandled server error **When** the error handler processes it **Then** the response follows `{ error, message }` format without exposing internal details (NFR15)

7. **Given** the Pino logger **When** any request is processed **Then** it is logged with a request ID in structured JSON format

8. **Given** environment variables (PORT, DATABASE_PATH, CORS_ORIGIN) **When** set via `.env` **Then** they are used by the server configuration

## Tasks / Subtasks

- [x] Task 1: Install dependencies (AC: #1, #2, #4)
  - [x] 1.1 Install `drizzle-orm`, `better-sqlite3`, `@fastify/cors` as production dependencies
  - [x] 1.2 Install `@types/better-sqlite3`, `drizzle-kit` as dev dependencies
  - [x] 1.3 Verify `@todo-bmad/shared` workspace link still resolves after dependency changes

- [x] Task 2: Create Drizzle schema and database client (AC: #2, #3)
  - [x] 2.1 Create `src/db/schema.ts` — define `todos` table with columns: `id` (TEXT PK), `text` (TEXT NOT NULL), `completed` (INTEGER mode boolean, NOT NULL, default false), `created_at` (TEXT NOT NULL) using `sqliteTable` from `drizzle-orm/sqlite-core`
  - [x] 2.2 Create `src/db/client.ts` — export a `getDb()` function that accepts a database path, creates the better-sqlite3 connection, and returns a Drizzle ORM instance with schema
  - [x] 2.3 Create `drizzle.config.ts` at backend package root — dialect `sqlite`, schema path `./src/db/schema.ts`, out directory `./drizzle`, breakpoints enabled
  - [x] 2.4 Run `drizzle-kit generate` to produce the initial `0000_create_todos.sql` migration file in `drizzle/` directory
  - [x] 2.5 Verify the generated migration SQL creates the `todos` table with correct column types and constraints

- [x] Task 3: Create migration runner (AC: #2, #3)
  - [x] 3.1 Create `src/db/migrate.ts` — export a `runMigrations()` function that uses `migrate` from `drizzle-orm/better-sqlite3/migrator` pointing to the `drizzle/` folder
  - [x] 3.2 Verify migrations are idempotent (running twice does not error or duplicate tables)

- [x] Task 4: Create CORS plugin (AC: #4, #5)
  - [x] 4.1 Create `src/plugins/cors.ts` — export an async Fastify plugin that registers `@fastify/cors` with origin set to `config.CORS_ORIGIN`
  - [x] 4.2 Verify allowed origin passes, unknown origin is rejected

- [x] Task 5: Create error handler plugin (AC: #6)
  - [x] 5.1 Create `src/plugins/error-handler.ts` — export an async Fastify plugin that sets a global error handler
  - [x] 5.2 Error handler formats all errors to `{ error: string, message: string }` using `INTERNAL_ERROR` code from `@todo-bmad/shared`
  - [x] 5.3 For Zod validation errors, return 400 with `VALIDATION_ERROR` code and a safe message
  - [x] 5.4 Never expose stack traces, internal paths, or raw error messages in responses

- [x] Task 6: Wire up app.ts and index.ts (AC: #1, #2, #3, #7, #8)
  - [x] 6.1 Update `app.ts` `buildApp()` to accept config, set Fastify options (logger with requestIdHeader, bodyLimit 10KB), register CORS and error handler plugins
  - [x] 6.2 Update `index.ts` to run migrations before starting the server, pass config to `buildApp()`
  - [x] 6.3 Verify `npm run dev -w packages/backend` starts successfully, creates database file, applies migrations

- [x] Task 7: Add package.json scripts (AC: #2)
  - [x] 7.1 Add `db:generate` script: `drizzle-kit generate`
  - [x] 7.2 Add `db:migrate` script to run migrations via a standalone entry point (or `drizzle-kit migrate`)
  - [x] 7.3 Verify root `package.json` `db:generate` and `db:migrate` scripts proxy correctly to backend

- [x] Task 8: Write tests (AC: #1–#8)
  - [x] 8.1 Create `src/app.test.ts` — integration tests using Fastify `.inject()`:
    - Server boots and responds to requests
    - CORS allows configured origin
    - CORS rejects unknown origin
    - Unhandled errors return `{ error, message }` format without internals
    - Request IDs are present in responses
  - [x] 8.2 Create `src/db/migrate.test.ts` — migration tests:
    - Migrations create the `todos` table with correct columns
    - Running migrations twice is idempotent
  - [x] 8.3 Ensure all tests pass via `npm test -w packages/backend`

## Dev Notes

### Architecture Compliance

This story builds the backend foundation. Every subsequent backend story (1.3–1.6 for API endpoints) depends on the database, CORS, error handler, and logging established here. Follow the architecture document exactly.

**Source:** [architecture.md — Core Architectural Decisions, Infrastructure & Deployment, Implementation Patterns]

### Technology Versions

| Package | Version | Notes |
|---------|---------|-------|
| drizzle-orm | ^0.45 | Use 0.x stable, NOT 1.0 beta |
| drizzle-kit | latest | Dev dependency for migration generation |
| better-sqlite3 | latest | With `@types/better-sqlite3` |
| @fastify/cors | ^11.x | Compatible with Fastify 5.x, built-in TypeScript types |

These are added on top of existing Story 1.1 dependencies (Fastify ^5.8, TypeScript, tsx, Jest).

### Database Schema Specification

The `todos` table definition in Drizzle ORM:

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
  id: text("id").primaryKey(),
  text: text("text").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});
```

Key mapping: Drizzle maps `snake_case` SQL columns to `camelCase` TypeScript properties. The column name `created_at` maps to the TypeScript property `createdAt`.

**Data types:**
- `id`: TEXT — UUID v4 generated server-side via `crypto.randomUUID()` (Story 1.4 concern, but schema must support it)
- `text`: TEXT — max 128 chars (enforced by Zod schema at route level, not DB constraint)
- `completed`: INTEGER stored as 0/1, exposed as boolean via `{ mode: "boolean" }`
- `created_at`: TEXT — ISO 8601 timestamp string

### Database Client Pattern

```typescript
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

export function getDb(databasePath: string) {
  const sqlite = new Database(databasePath);
  sqlite.pragma("journal_mode = WAL");
  return drizzle({ client: sqlite, schema });
}
```

Enable WAL mode for better concurrent read performance. Export from `client.ts` so route handlers can import it.

### Migration Runner Pattern

```typescript
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";

export function runMigrations(db: ReturnType<typeof getDb>) {
  migrate(db, { migrationsFolder: path.resolve(__dirname, "../../drizzle") });
}
```

- `migrate()` is synchronous for better-sqlite3 (no `await` needed)
- The `migrationsFolder` path resolves relative to `src/db/migrate.ts` up to `packages/backend/drizzle/`
- Drizzle tracks applied migrations in an internal `__drizzle_migrations` table — re-running is safe

### Drizzle Config

Create `packages/backend/drizzle.config.ts`:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  breakpoints: true,
});
```

`breakpoints: true` is required because better-sqlite3 cannot execute multiple SQL statements in a single `.prepare().run()` call. Drizzle uses `-->statement-breakpoint` separators to split statements.

### CORS Plugin Pattern

```typescript
import cors from "@fastify/cors";
import { FastifyInstance } from "fastify";

export async function corsPlugin(app: FastifyInstance, config: { origin: string }) {
  await app.register(cors, { origin: config.origin });
}
```

- Set `origin` to `config.CORS_ORIGIN` (default `http://localhost:3000`)
- `@fastify/cors` v11.x is Fastify 5 compatible with built-in TypeScript types — no separate `@types` package needed

### Error Handler Plugin Pattern

```typescript
import { FastifyInstance, FastifyError } from "fastify";
import { INTERNAL_ERROR, VALIDATION_ERROR } from "@todo-bmad/shared";

export async function errorHandlerPlugin(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode = error.statusCode ?? 500;

    if (statusCode >= 500) {
      request.log.error(error);
    }

    reply.status(statusCode).send({
      error: statusCode === 400 ? VALIDATION_ERROR : INTERNAL_ERROR,
      message: statusCode >= 500
        ? "An unexpected error occurred"
        : error.message,
    });
  });
}
```

- Never expose `error.stack`, internal file paths, or raw error objects
- Log 5xx errors server-side for debugging; return generic message to client
- 400 errors use `VALIDATION_ERROR` code with the validation message (safe for client)
- 404 errors will be handled per-route in Stories 1.3–1.6 using `NOT_FOUND` code
- Future stories will add Zod validation error handling (checking `error.validation` or catching `ZodError`)

### Updated app.ts Pattern

```typescript
import Fastify from "fastify";
import { AppConfig } from "./config";
import { corsPlugin } from "./plugins/cors";
import { errorHandlerPlugin } from "./plugins/error-handler";

export function buildApp(config: AppConfig) {
  const app = Fastify({
    logger: {
      level: "info",
    },
    requestIdHeader: "x-request-id",
    bodyLimit: 10240, // 10KB per NFR17
  });

  app.register(corsPlugin, { origin: config.CORS_ORIGIN });
  app.register(errorHandlerPlugin);

  return app;
}
```

- `bodyLimit: 10240` enforces the 10KB request body limit (NFR17)
- `requestIdHeader` enables request ID tracking for structured logging (AC #7)
- Fastify's built-in Pino logger outputs structured JSON with request IDs automatically

### Updated index.ts Pattern

```typescript
import { buildApp } from "./app";
import { getConfig } from "./config";
import { getDb } from "./db/client";
import { runMigrations } from "./db/migrate";

const config = getConfig();
const db = getDb(config.DATABASE_PATH);
runMigrations(db);

const start = async () => {
  const app = buildApp(config);
  try {
    await app.listen({ port: config.PORT, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
```

- Migrations run synchronously before the server starts (better-sqlite3 is synchronous)
- Database is created automatically by better-sqlite3 if the file doesn't exist
- The `data/` directory must exist (created by Story 1.1 with `.gitkeep`)

### Testing Strategy

Use Fastify's `.inject()` method for integration tests — no HTTP server needed, no port conflicts, no cleanup.

Centralise app initialisation and teardown in `beforeEach`/`afterEach` blocks so individual tests stay focused on assertions:

```typescript
import { buildApp } from "./app";
import { getConfig } from "./config";
import { getDb } from "./db/client";
import { runMigrations } from "./db/migrate";

describe("App", () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    const config = { ...getConfig(), DATABASE_PATH: ":memory:" };
    const db = getDb(config.DATABASE_PATH);
    runMigrations(db);
    app = buildApp(config);
  });

  afterEach(async () => {
    await app.close();
  });

  it("boots and responds", async () => {
    const res = await app.inject({ method: "GET", url: "/nonexistent" });
    expect(res.statusCode).toBe(404);
  });
});
```

- Use `beforeEach` to create a fresh in-memory SQLite database, run migrations, and build the app — every test gets a clean slate
- Use `afterEach` to call `app.close()` so resources are released even if a test fails
- Individual tests only contain the request and assertions — no setup or cleanup code
- `:memory:` SQLite databases are destroyed automatically when the connection closes, so no file cleanup is needed

### Naming Conventions (Enforced)

| Context | Convention | Example |
|---------|-----------|---------|
| TypeScript files | kebab-case | `error-handler.ts`, `cors.ts` |
| Functions | camelCase | `buildApp`, `getDb`, `runMigrations` |
| Exports | Named only | `export function buildApp()` |
| DB table | snake_case plural | `todos` |
| DB columns | snake_case | `created_at` |
| Constants | UPPER_SNAKE_CASE | `INTERNAL_ERROR` |

### Target File Structure (This Story)

```
packages/backend/
├── package.json              (updated — new dependencies)
├── drizzle.config.ts         (NEW — Drizzle Kit config)
├── drizzle/                  (NEW — generated migration files, committed to git)
│   └── 0000_create_todos.sql (NEW — generated by drizzle-kit generate)
│   └── meta/                 (NEW — drizzle-kit metadata, committed to git)
└── src/
    ├── index.ts              (MODIFIED — run migrations, pass config)
    ├── app.ts                (MODIFIED — register plugins, configure logger/bodyLimit)
    ├── app.test.ts           (NEW — integration tests)
    ├── config.ts             (existing — no changes needed)
    ├── db/                   (NEW directory)
    │   ├── schema.ts         (NEW — Drizzle todos table definition)
    │   ├── client.ts         (NEW — better-sqlite3 + Drizzle connection)
    │   ├── migrate.ts        (NEW — migration runner)
    │   └── migrate.test.ts   (NEW — migration tests)
    └── plugins/              (NEW directory)
        ├── cors.ts           (NEW — @fastify/cors registration)
        └── error-handler.ts  (NEW — global error formatting)
```

### What This Story Does NOT Include

Do NOT implement these — they belong to later stories:
- API route handlers (Stories 1.3–1.6)
- Revalidation endpoint (Story 1.8+ concern)
- XSS sanitization logic (Story 1.4)
- Any frontend changes
- E2E tests or Playwright configuration (Story 1.9)
- HTML stripping/sanitization utility

### Anti-Patterns to Avoid

- **Do NOT create API routes** — this story is server foundation only
- **Do NOT use `drizzle-kit push`** — use `generate` + programmatic `migrate()` per architecture decision
- **Do NOT expose error internals** — never send `error.stack` or raw error objects to clients
- **Do NOT use in-band SQLite paths** — always use `config.DATABASE_PATH` from environment
- **Do NOT add a health check endpoint** — not in scope, keep the surface minimal
- **Do NOT install `dotenv`** — tsx and Node.js 22+ support `.env` loading natively
- **Do NOT use `default` exports** — named exports only per project convention
- **Do NOT create the `data/` directory** — it already exists from Story 1.1 with `.gitkeep`

### Previous Story Intelligence

**From Story 1.1 (done):**
- Monorepo with npm workspaces is scaffolded and working
- `@todo-bmad/shared` package exports Zod schemas, types, and constants — import via `@todo-bmad/shared`
- Backend uses `tsconfig.json` with `module: CommonJS` + `moduleResolution: node` (overrides base ESNext/bundler)
- Backend entry point is `src/index.ts`, app factory is `src/app.ts`, config loader is `src/config.ts`
- Jest configured with `jest.config.js` (not `.ts`) with `--no-watchman` flag
- `AppConfig` interface already defines `PORT`, `DATABASE_PATH`, `CORS_ORIGIN`, `REVALIDATION_SECRET`
- Backend dev command: `tsx watch src/index.ts`
- `data/.gitkeep` already exists for the SQLite database directory
- `concurrently` is installed at root for running frontend+backend in parallel

**Debug notes from Story 1.1:**
- shadcn CLI v4 `--style` flag was removed; components.json created manually
- Jest uses `.js` config format to avoid ts-node dependency
- `--no-watchman` flag added to Jest due to watchman socket permissions
- Backend tsconfig overrides module to CommonJS (critical for better-sqlite3 native module compatibility)

### Git Workflow

Per `project-context.md`: create feature branch `feat/1-2-backend-server-foundation` from `main` before starting implementation. Commit incrementally. Do not merge to `main` directly.

### Project Structure Notes

- The `drizzle/` directory (containing generated migration SQL files and `meta/` folder) MUST be committed to git — these are versioned migration files
- The `data/` directory containing `.db` files is gitignored (only `data/.gitkeep` is tracked)
- Import `@todo-bmad/shared` for constants like `INTERNAL_ERROR`, `VALIDATION_ERROR` — never redefine them

### References

- [Source: architecture.md#Data Architecture] — schema design, Drizzle config, UUID strategy
- [Source: architecture.md#Authentication & Security] — CORS, input validation, XSS
- [Source: architecture.md#API & Communication Patterns] — error format, endpoints
- [Source: architecture.md#Infrastructure & Deployment] — local dev ports, env config, logging
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — naming, process, enforcement rules
- [Source: architecture.md#Project Structure & Boundaries] — complete directory layout
- [Source: epics.md#Story 1.2] — acceptance criteria
- [Source: prd.md#Non-Functional Requirements] — NFR15 (no internals in errors), NFR17 (10KB body limit)

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Debug Log References

- **fastify-plugin scoping**: `@fastify/cors` and `errorHandlerPlugin` both needed to be wrapped with `fastify-plugin` (fp) to escape encapsulation and apply at the root scope. Without this, plugins registered in child scopes do not affect routes on the root app.
- **CORS string vs array origin**: `@fastify/cors` with `origin: string` sets it as a static fixed header for ALL requests. To enable proper origin filtering (reflecting origin only for allowed origins, rejecting unknown), the origin must be passed as an array: `[config.origin]`.
- **x-request-id response header**: Fastify's `requestIdHeader` reads the incoming header as the request ID but does NOT automatically echo it in the response. An `onSend` hook was added to `buildApp()` to set `reply.header('x-request-id', request.id)`.
- **node_modules corruption**: Initial `npm install` of drizzle/sqlite/cors packages caused EPERM errors on README files which corrupted some jest package files. Required a full clean reinstall (`rm -rf node_modules && npm install`).

### Completion Notes List

- All 8 tasks and subtasks completed as specified in the story.
- 7 integration/unit tests pass: server boot, CORS allow/reject, error format without internals, request ID, migration creation, migration idempotency.
- `fastify-plugin` added as production dependency (was transitive, now explicit).
- `@fastify/cors` configured with array-form origin for proper filtering behavior.
- `onSend` hook added to echo `x-request-id` in response headers.
- All acceptance criteria satisfied: AC#1 (server starts on port 3001), AC#2 (DB created on first run), AC#3 (migrations idempotent), AC#4 (configured origin allowed), AC#5 (unknown origin rejected), AC#6 (error format without internals), AC#7 (structured JSON logging with request ID), AC#8 (env vars loaded via config).

### File List

packages/backend/package.json
packages/backend/drizzle.config.ts
packages/backend/drizzle/0000_talented_king_bedlam.sql
packages/backend/drizzle/meta/0000_snapshot.json
packages/backend/drizzle/meta/_journal.json
packages/backend/src/app.ts
packages/backend/src/index.ts
packages/backend/src/app.test.ts
packages/backend/src/db/schema.ts
packages/backend/src/db/client.ts
packages/backend/src/db/migrate.ts
packages/backend/src/db/migrate.test.ts
packages/backend/src/plugins/cors.ts
packages/backend/src/plugins/error-handler.ts
package.json

## Change Log

- 2026-03-17: Story implemented — Drizzle schema/client/migrations, CORS plugin, error handler plugin, updated app.ts/index.ts, integration and migration tests added. All 7 tests pass. Status set to review.
