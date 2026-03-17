# Story 1.5: Update Todo Endpoint

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to update a todo's completion status via the API,
So that I can track which tasks are done.

## Acceptance Criteria

1. **Given** an existing active todo **When** PATCH `/api/todos/:id` is called with `{ completed: true }` **Then** it returns 200 with the updated todo showing `completed: true`

2. **Given** an existing completed todo **When** PATCH `/api/todos/:id` is called with `{ completed: false }` **Then** it returns 200 with the updated todo showing `completed: false`

3. **Given** a non-existent todo ID **When** PATCH `/api/todos/:id` is called **Then** it returns 404 with `{ error: "NOT_FOUND", message: "..." }`

4. **Given** an invalid request body (missing or non-boolean `completed` field) **When** PATCH `/api/todos/:id` is called **Then** it returns 400 with `VALIDATION_ERROR`

## Tasks / Subtasks

- [x] Task 1: Add PATCH /api/todos/:id handler to routes/todos.ts (AC: #1–#3)
  - [x] 1.1 Add new imports: `eq` from `drizzle-orm`, `updateTodoSchema` and `NOT_FOUND` from `@todo-bmad/shared`
  - [x] 1.2 Add PATCH `/api/todos/:id` handler inside the existing `todosRoutes` plugin
  - [x] 1.3 Handler step 1: extract `id` from `request.params` (use inline type `{ id: string }`)
  - [x] 1.4 Handler step 2: parse body with `updateTodoSchema.parse(request.body)` in try/catch; on `z.ZodError` → return 400 with `{ error: VALIDATION_ERROR, message: err.issues[0].message }`
  - [x] 1.5 Handler step 3: select the existing todo via `app.db.select().from(todos).where(eq(todos.id, id)).get()`
  - [x] 1.6 Handler step 4: if no row found → return 404 with `{ error: NOT_FOUND, message: "Todo not found" }`
  - [x] 1.7 Handler step 5: update via `app.db.update(todos).set({ completed: parsed.completed }).where(eq(todos.id, id)).run()`
  - [x] 1.8 Handler step 6: return `reply.status(200).send({ todo: { ...existing, completed: parsed.completed } })`

- [x] Task 2: Write tests for PATCH /api/todos/:id (AC: #1–#4)
  - [x] 2.1 Add `describe("PATCH /api/todos/:id")` block to existing `src/routes/todos.test.ts` — reuse same `beforeEach`/`afterEach` pattern
  - [x] 2.2 Test: active todo updated to `completed: true` returns 200 with updated todo
  - [x] 2.3 Test: completed todo updated to `completed: false` returns 200 with updated todo
  - [x] 2.4 Test: response contains all fields (`id`, `text`, `completed`, `createdAt`) with correct values
  - [x] 2.5 Test: non-existent ID returns 404 with `NOT_FOUND` error code
  - [x] 2.6 Test: missing `completed` field returns 400 with `VALIDATION_ERROR`
  - [x] 2.7 Test: non-boolean `completed` value (e.g. string `"true"`) returns 400 with `VALIDATION_ERROR`
  - [x] 2.8 Test: empty body returns 400 with `VALIDATION_ERROR`
  - [x] 2.9 Test: updated todo reflects change in subsequent GET `/api/todos`

- [x] Task 3: Verify all tests and build pass (run from project root)
  - [x] 3.1 Run `npm run test` — all tests pass across all packages
  - [x] 3.2 Run `npm run test:e2e` — all E2E tests pass
  - [x] 3.3 Run `npm run build` — production build completes without errors

## Dev Notes

### Architecture Compliance

This is the third route handler added to `routes/todos.ts`, extending the existing `todosRoutes` plugin with a PATCH handler. Story 1.6 (DELETE) follows this same pattern.

**Critical constraints:**
- Use `updateTodoSchema` from `@todo-bmad/shared` for validation — never write ad-hoc validation (Enforcement Rule #4)
- Use `NOT_FOUND` constant from `@todo-bmad/shared` for the 404 error code
- Response shape: `{ todo: Todo }` (not `{ data: ... }`)
- Error responses: `{ error: "NOT_FOUND", message: "..." }` and `{ error: "VALIDATION_ERROR", message: "..." }`
- Named exports only (Enforcement Rule #2)
- Follow the same ZodError handling pattern established in Story 1.4

[Source: architecture.md#API & Communication Patterns, architecture.md#Implementation Patterns & Consistency Rules]

### Route Handler Implementation

Add the PATCH handler inside the **existing** `todosRoutes` plugin in `routes/todos.ts`. Do NOT create a separate file or plugin.

**Handler flow:**
1. Extract `:id` from URL params
2. Parse and validate body: `updateTodoSchema.parse(request.body)` — validates `completed` is a boolean
3. Look up existing todo: `app.db.select().from(todos).where(eq(todos.id, id)).get()`
4. If not found → 404 with `NOT_FOUND`
5. Update the row: `app.db.update(todos).set({ completed }).where(eq(todos.id, id)).run()`
6. Return 200 with `{ todo }` containing the full updated todo object

**New imports needed in `routes/todos.ts`:**

```typescript
import { desc, eq } from "drizzle-orm";
import { createTodoSchema, updateTodoSchema, VALIDATION_ERROR, NOT_FOUND } from "@todo-bmad/shared";
```

Note: `desc` is already imported; update the import line to include `eq` alongside it. Update the `@todo-bmad/shared` import to include `updateTodoSchema` and `NOT_FOUND`.

**PATCH handler pattern:**

```typescript
app.patch<{ Params: { id: string } }>("/api/todos/:id", async (request, reply) => {
  let parsed;
  try {
    parsed = updateTodoSchema.parse(request.body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        error: VALIDATION_ERROR,
        message: err.issues[0].message,
      });
    }
    throw err;
  }

  const existing = app.db.select().from(todos).where(eq(todos.id, request.params.id)).get();
  if (!existing) {
    return reply.status(404).send({
      error: NOT_FOUND,
      message: "Todo not found",
    });
  }

  app.db.update(todos).set({ completed: parsed.completed }).where(eq(todos.id, request.params.id)).run();

  return reply.status(200).send({
    todo: { ...existing, completed: parsed.completed },
  });
});
```

### updateTodoSchema Details

The `updateTodoSchema` from `@todo-bmad/shared` is:

```typescript
export const updateTodoSchema = z.object({
  completed: z.boolean(),
});
```

Validates that:
- `completed` field exists
- `completed` is a boolean (rejects strings like `"true"`, numbers, null, undefined)

On parse failure, Zod 4 throws `z.ZodError` with `error.issues` array. Use `error.issues[0].message` for the human-readable message.

### Drizzle Query Patterns

**Select single row:** Use `.get()` (returns the row or `undefined`):
```typescript
const existing = app.db.select().from(todos).where(eq(todos.id, id)).get();
```

**Update row:** Use `.set()` + `.where()` + `.run()`:
```typescript
app.db.update(todos).set({ completed: parsed.completed }).where(eq(todos.id, id)).run();
```

`eq` must be imported from `drizzle-orm` (same package that provides `desc`).

### Response Construction

Build the response object from the existing row with the updated field applied. Do NOT re-query the database after update — construct the response directly:

```typescript
return reply.status(200).send({
  todo: { ...existing, completed: parsed.completed },
});
```

This ensures the response matches the `{ todo: Todo }` shape with camelCase fields (`id`, `text`, `completed`, `createdAt`).

### Testing Strategy

Extend the existing `routes/todos.test.ts` with a new `describe("PATCH /api/todos/:id")` block. Reuse the same `beforeEach`/`afterEach` pattern.

**Seed data pattern for tests:** Insert a todo directly via `db.insert(todos).values(...)` in individual tests to set up known state before PATCH:

```typescript
db.insert(todos).values({
  id: "test-id-1",
  text: "Test todo",
  completed: false,
  createdAt: "2026-03-17T10:00:00.000Z",
}).run();
```

**Integration test (AC verification):** After PATCH, verify the change persists in a subsequent GET `/api/todos`.

### Technology Versions

| Package | Version | Notes |
|---------|---------|-------|
| zod | ^4.3.0 | `.parse()` throws `z.ZodError`, access `error.issues` |
| drizzle-orm | ^0.45.1 | `.select().where(eq()).get()` for single row, `.update().set().where().run()` for mutation |
| fastify | ^5.8 | Route params typed via generic `<{ Params: { id: string } }>` |

No new dependencies needed for this story.

### Project Structure Notes

```
packages/backend/src/
├── routes/
│   ├── todos.ts          (MODIFIED — add PATCH handler, update imports)
│   └── todos.test.ts     (MODIFIED — add PATCH test cases)
```

Only 2 files are modified. No new files. No new directories.

### What This Story Does NOT Include

- DELETE `/api/todos/:id` (Story 1.6)
- POST `/api/revalidate` (Story 1.8+)
- Updating the `text` field (PATCH only updates `completed`)
- Any frontend changes
- New E2E tests or Playwright configuration

### Anti-Patterns to Avoid

- **Do NOT create a separate route file for PATCH** — add to existing `todosRoutes` plugin in `routes/todos.ts`
- **Do NOT write ad-hoc validation** — use `updateTodoSchema` from `@todo-bmad/shared`
- **Do NOT return the raw DB row without spreading** — construct the response with the updated `completed` value applied
- **Do NOT re-query the database after update** — spread the existing row and override `completed`
- **Do NOT use `default` exports** — named exports only
- **Do NOT modify `app.ts`, `index.ts`, or any plugin** — only modify files in `routes/`
- **Do NOT allow updating the `text` field** — the `updateTodoSchema` only accepts `completed`
- **Do NOT return 200 for non-existent IDs** — must return 404 with `NOT_FOUND`

### Previous Story Intelligence

**From Story 1.4 (done):**
- ZodError handling: `try { schema.parse(body) } catch (err) { if (err instanceof z.ZodError) → 400 }` — reuse this exact pattern
- `stripHtmlTags` helper is defined in `routes/todos.ts` — PATCH does not need it (no text modification)
- POST handler is at line 19, PATCH handler goes after it (around line 49+)
- Imports at top: `randomUUID` from `crypto`, `FastifyInstance` from `fastify`, `fp` from `fastify-plugin`, `desc` from `drizzle-orm`, `z` from `zod`, `createTodoSchema` and `VALIDATION_ERROR` from `@todo-bmad/shared`, `todos` from `../db/schema`
- `randomUUID` import is NOT needed for PATCH
- Current test file has 4 GET tests + 13 POST tests = 17 total backend route tests; PATCH adds ~8 more

**From Story 1.3 (done):**
- Route handler pattern: `fp(async (app: FastifyInstance) => { ... })` wrapped with `fastify-plugin`
- DB accessed via `app.db` decoration
- Drizzle operations are synchronous with better-sqlite3: `.all()` for select many, `.get()` for select one, `.run()` for mutations
- Tests use `beforeEach` with in-memory SQLite (`getDb(":memory:")`) + `buildApp(config, db)`, `afterEach` with `app.close()`
- Test config: `{ ...getConfig(), LOG_LEVEL: "silent" }`

**From Story 1.2 (done):**
- Error handler in `plugins/error-handler.ts` catches 400s → `VALIDATION_ERROR`, 500s → `INTERNAL_ERROR`
- `bodyLimit: 10240` already configured
- Malformed JSON handled by Fastify parser

### Naming Conventions (Enforced)

| Context | Convention | Example |
|---------|-----------|---------|
| API endpoint | kebab-case, plural noun | `/api/todos/:id` |
| JSON response keys | camelCase | `completed`, `createdAt` |
| Error codes | UPPER_SNAKE_CASE | `NOT_FOUND`, `VALIDATION_ERROR` |
| Exports | Named only | `export const todosRoutes` |
| Drizzle imports | camelCase | `eq`, `desc` |

### Git Workflow

Per `project-context.md`: create feature branch `feat/1-5-update-todo-endpoint` from `main` before starting implementation. Commit incrementally. Do not merge to `main` directly.

### References

- [Source: architecture.md#API & Communication Patterns] — PATCH endpoint spec, 200/404/400 responses, error format
- [Source: architecture.md#Data Architecture] — Zod validation, Drizzle queries
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — naming, exports, enforcement rules
- [Source: architecture.md#Process Conventions] — validation on server, error format
- [Source: epics.md#Story 1.5] — acceptance criteria
- [Source: 1-4-create-todo-endpoint.md] — ZodError handling pattern, test setup, anti-patterns
- [Source: shared/src/schemas.ts] — `updateTodoSchema` definition (`z.object({ completed: z.boolean() })`)
- [Source: shared/src/constants.ts] — `NOT_FOUND`, `VALIDATION_ERROR` constants
- [Source: backend/src/routes/todos.ts] — current file with GET + POST handlers
- [Source: backend/src/routes/todos.test.ts] — existing test structure with GET + POST describe blocks

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Debug Log References

No blockers encountered.

### Completion Notes List

- Added PATCH `/api/todos/:id` handler to `routes/todos.ts` inside the existing `todosRoutes` plugin
- Updated imports: `eq` from `drizzle-orm`, `updateTodoSchema` and `NOT_FOUND` from `@todo-bmad/shared`
- Handler validates body with `updateTodoSchema`, returns 404 for non-existent IDs, updates DB and returns merged response object without re-querying
- Added 8 new tests in `todos.test.ts` covering all 4 ACs: happy path (true/false toggle), full field verification, 404, three 400 validation scenarios, and integration test
- All 33 backend tests pass, all E2E tests pass, production build succeeds

### File List

- packages/backend/src/routes/todos.ts (modified)
- packages/backend/src/routes/todos.test.ts (modified)

### Change Log

- 2026-03-17: Implemented PATCH /api/todos/:id endpoint with full validation, 404 handling, and 8 test cases (Story 1.5)
