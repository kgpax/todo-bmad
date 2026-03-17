# Story 1.6: Delete Todo Endpoint

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to delete a todo via the API,
So that I can remove tasks I no longer need.

## Acceptance Criteria

1. **Given** an existing todo **When** DELETE `/api/todos/:id` is called **Then** it returns 204 with no content

2. **Given** a todo has been deleted **When** GET `/api/todos` is called **Then** the deleted todo is no longer in the list

3. **Given** a non-existent todo ID **When** DELETE `/api/todos/:id` is called **Then** it returns 404 with `{ error: "NOT_FOUND", message: "..." }`

## Tasks / Subtasks

- [x] Task 1: Add DELETE /api/todos/:id handler to routes/todos.ts (AC: #1, #3)
  - [x] 1.1 Add DELETE `/api/todos/:id` handler inside the existing `todosRoutes` plugin, after the PATCH handler (line 78+)
  - [x] 1.2 Handler step 1: extract `id` from `request.params` (use inline type `{ Params: { id: string } }`)
  - [x] 1.3 Handler step 2: check if todo exists via `app.db.select().from(todos).where(eq(todos.id, request.params.id)).get()`
  - [x] 1.4 Handler step 3: if no row found → return 404 with `{ error: NOT_FOUND, message: "Todo not found" }`
  - [x] 1.5 Handler step 4: delete via `app.db.delete(todos).where(eq(todos.id, request.params.id)).run()`
  - [x] 1.6 Handler step 5: return `reply.status(204).send()`

- [x] Task 2: Write tests for DELETE /api/todos/:id (AC: #1–#3)
  - [x] 2.1 Add `describe("DELETE /api/todos/:id")` block to existing `src/routes/todos.test.ts` — reuse same `beforeEach`/`afterEach` pattern
  - [x] 2.2 Test: existing todo returns 204 with empty body
  - [x] 2.3 Test: non-existent ID returns 404 with `NOT_FOUND` error code
  - [x] 2.4 Test: deleted todo no longer appears in GET `/api/todos` (integration test — AC #2)
  - [x] 2.5 Test: deleting an already-deleted todo returns 404 (idempotency boundary)

- [x] Task 3: Verify all tests and build pass (run from project root)
  - [x] 3.1 Run `npm run test` — all tests pass across all packages
  - [x] 3.2 Run `npm run test:e2e` — all E2E tests pass
  - [x] 3.3 Run `npm run build` — production build completes without errors

## Dev Notes

### Architecture Compliance

This is the fourth and final route handler added to `routes/todos.ts`, completing the CRUD surface for the todo entity. All four handlers (GET, POST, PATCH, DELETE) live inside the single `todosRoutes` plugin.

**Critical constraints:**
- No body validation needed — DELETE has no request body
- Use `NOT_FOUND` constant from `@todo-bmad/shared` for the 404 error code
- Response: 204 No Content (empty body) on success — NOT `{ todo: ... }` like the other endpoints
- Error response: `{ error: "NOT_FOUND", message: "Todo not found" }` matching the existing PATCH 404 pattern exactly
- Named exports only (Enforcement Rule #2)
- Check existence before deleting — return 404 for non-existent IDs rather than silently succeeding

[Source: architecture.md#API & Communication Patterns, architecture.md#Implementation Patterns & Consistency Rules]

### Route Handler Implementation

Add the DELETE handler inside the **existing** `todosRoutes` plugin in `routes/todos.ts` after the PATCH handler (after line 78). Do NOT create a separate file or plugin.

**Handler flow:**
1. Extract `:id` from URL params
2. Look up existing todo: `app.db.select().from(todos).where(eq(todos.id, id)).get()`
3. If not found → 404 with `NOT_FOUND`
4. Delete the row: `app.db.delete(todos).where(eq(todos.id, id)).run()`
5. Return 204 with empty body

**No new imports needed.** All required imports are already present in `routes/todos.ts`:
- `eq` from `drizzle-orm` (added in Story 1.5)
- `NOT_FOUND` from `@todo-bmad/shared` (added in Story 1.5)
- `todos` from `../db/schema`

**DELETE handler pattern:**

```typescript
app.delete<{ Params: { id: string } }>("/api/todos/:id", async (request, reply) => {
  const existing = app.db.select().from(todos).where(eq(todos.id, request.params.id)).get();
  if (!existing) {
    return reply.status(404).send({
      error: NOT_FOUND,
      message: "Todo not found",
    });
  }

  app.db.delete(todos).where(eq(todos.id, request.params.id)).run();

  return reply.status(204).send();
});
```

**Key difference from PATCH:** No body parsing or Zod validation. The handler is simpler — just existence check, delete, and 204 response.

### Drizzle Query Patterns

**Select single row (existence check):** Same pattern as PATCH:
```typescript
const existing = app.db.select().from(todos).where(eq(todos.id, id)).get();
```

**Delete row:** Use `.delete()` + `.where()` + `.run()`:
```typescript
app.db.delete(todos).where(eq(todos.id, id)).run();
```

Both `eq` and `todos` schema are already imported. The `.delete()` method is called on `app.db` directly (not imported from `drizzle-orm`).

### Testing Strategy

Extend the existing `routes/todos.test.ts` with a new `describe("DELETE /api/todos/:id")` block. Reuse the same `beforeEach`/`afterEach` pattern established in all previous describe blocks.

**Seed data pattern:** Insert a todo directly via `db.insert(todos).values(...)` before the DELETE call:

```typescript
db.insert(todos).values({
  id: "test-id-1",
  text: "Test todo",
  completed: false,
  createdAt: "2026-03-17T10:00:00.000Z",
}).run();
```

**Test cases (~4 tests):**
1. Existing todo → 204, empty body
2. Non-existent ID → 404 with `NOT_FOUND`
3. Integration: deleted todo not in subsequent GET response
4. Double-delete → 404 on second attempt

**204 response body verification:** Fastify returns an empty string for `reply.status(204).send()`. Test should verify `res.statusCode === 204` and `res.body === ""`.

Current test count: 33 (4 GET + 13 POST + 8 PATCH + 8 shared). DELETE adds ~4 more → ~37 total.

### Technology Versions

| Package | Version | Notes |
|---------|---------|-------|
| drizzle-orm | ^0.45.1 | `.delete(table).where(eq()).run()` for row deletion |
| fastify | ^5.8 | Route params typed via generic `<{ Params: { id: string } }>`, 204 via `reply.status(204).send()` |

No new dependencies needed for this story.

### Project Structure Notes

```
packages/backend/src/
├── routes/
│   ├── todos.ts          (MODIFIED — add DELETE handler)
│   └── todos.test.ts     (MODIFIED — add DELETE test cases)
```

Only 2 files are modified. No new files. No new directories.

### What This Story Does NOT Include

- POST `/api/revalidate` (Story 1.8+)
- Any frontend changes
- New E2E tests or Playwright configuration
- Batch delete (only single-item delete by ID)
- Soft delete — this is a hard/permanent delete

### Anti-Patterns to Avoid

- **Do NOT create a separate route file for DELETE** — add to existing `todosRoutes` plugin in `routes/todos.ts`
- **Do NOT return 200 or a response body on success** — DELETE returns 204 with no content
- **Do NOT silently succeed for non-existent IDs** — must return 404 with `NOT_FOUND`
- **Do NOT add Zod body validation** — DELETE has no request body
- **Do NOT use `default` exports** — named exports only
- **Do NOT modify `app.ts`, `index.ts`, or any plugin** — only modify files in `routes/`
- **Do NOT return `{ todo: ... }` in the response** — 204 means no content

### Previous Story Intelligence

**From Story 1.5 (done):**
- PATCH handler pattern is near-identical for the existence check + 404 flow — reuse the same pattern
- All required imports (`eq`, `NOT_FOUND`) are already in `routes/todos.ts` — no import changes needed
- Tests follow `describe` block with `beforeEach`/`afterEach` setup — use the same pattern
- Seed data via `db.insert(todos).values({...}).run()` — same approach for DELETE tests
- 33 tests currently pass across the backend

**From Story 1.4 (done):**
- `stripHtmlTags` helper exists in `routes/todos.ts` — DELETE does not need it
- POST handler generates UUIDs with `randomUUID()` — DELETE does not need it

**From Story 1.2 (done):**
- Error handler in `plugins/error-handler.ts` catches unhandled errors → `INTERNAL_ERROR`
- `bodyLimit: 10240` is configured but irrelevant for DELETE (no body)
- The error handler will NOT interfere with explicit 404 responses since those are sent directly

### Naming Conventions (Enforced)

| Context | Convention | Example |
|---------|-----------|---------|
| API endpoint | kebab-case, plural noun | `/api/todos/:id` |
| Error codes | UPPER_SNAKE_CASE | `NOT_FOUND` |
| Exports | Named only | `export const todosRoutes` |
| Drizzle imports | camelCase | `eq` |

### Git Workflow

Per `project-context.md`: create feature branch `feat/1-6-delete-todo-endpoint` from `main` before starting implementation. Commit incrementally. Do not merge to `main` directly.

### References

- [Source: architecture.md#API & Communication Patterns] — DELETE endpoint spec: 204/404 responses
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — naming, exports, enforcement rules
- [Source: epics.md#Story 1.6] — acceptance criteria
- [Source: 1-5-update-todo-endpoint.md] — existence check pattern, 404 handling, test setup
- [Source: shared/src/constants.ts] — `NOT_FOUND` constant
- [Source: backend/src/routes/todos.ts] — current file with GET + POST + PATCH handlers
- [Source: backend/src/routes/todos.test.ts] — existing test structure with GET + POST + PATCH describe blocks

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Debug Log References

### Completion Notes List

- Implemented DELETE `/api/todos/:id` handler in `routes/todos.ts` following the exact PATCH pattern for existence check and 404 handling
- No new imports needed — `eq`, `NOT_FOUND`, and `todos` were already present from Story 1.5
- Returns 204 with empty body on success; returns 404 with `{ error: "NOT_FOUND", message: "Todo not found" }` for non-existent IDs
- Added 4 tests in `routes/todos.test.ts`: 204 empty body, 404 not found, integration (deleted todo absent from GET), double-delete idempotency boundary
- All 37 tests pass (33 pre-existing + 4 new DELETE tests); production build succeeds with no errors
- E2E tests pass: 2/2 (homepage HTTP 200, homepage contains "Hello World") — run outside sandbox with `required_permissions: ["all"]`

### File List

- packages/backend/src/routes/todos.ts
- packages/backend/src/routes/todos.test.ts

### Change Log

- 2026-03-17: Implemented DELETE `/api/todos/:id` handler — 204 on success, 404 for non-existent IDs; added 4 tests (37 total pass)
- 2026-03-17: Code review passed — all ACs verified, all tasks confirmed complete, 0 issues found. Status → done
