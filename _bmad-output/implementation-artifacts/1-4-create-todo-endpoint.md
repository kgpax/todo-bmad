# Story 1.4: Create Todo Endpoint

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to create a new todo via the API,
So that my task is persisted and available across sessions.

## Acceptance Criteria

1. **Given** valid todo text (1-128 characters) **When** POST `/api/todos` is called **Then** it returns 201 with `{ todo: Todo }` including a server-generated UUID v4 `id`

2. **Given** valid todo text with leading/trailing whitespace **When** POST `/api/todos` is called **Then** the text is trimmed before storage

3. **Given** todo text containing HTML tags **When** POST `/api/todos` is called **Then** HTML is stripped/sanitized before storage (NFR14)

4. **Given** empty text or whitespace-only text **When** POST `/api/todos` is called **Then** it returns 400 with `{ error: "VALIDATION_ERROR", message: "..." }`

5. **Given** text exceeding 128 characters **When** POST `/api/todos` is called **Then** it returns 400 with `VALIDATION_ERROR` (NFR17)

6. **Given** a request body exceeding 10KB **When** POST `/api/todos` is called **Then** the request is rejected (NFR17)

7. **Given** a malformed JSON body **When** POST `/api/todos` is called **Then** it returns 400 with `VALIDATION_ERROR`

8. **Given** a successfully created todo **When** the response is inspected **Then** `completed` is `false` and `createdAt` is a valid ISO 8601 timestamp

## Tasks / Subtasks

- [x] Task 1: Add POST /api/todos handler to routes/todos.ts (AC: #1–#3, #8)
  - [x] 1.1 Add `stripHtmlTags(text: string): string` helper function in `routes/todos.ts` using regex `/<[^>]*>/g`
  - [x] 1.2 Add new imports: `randomUUID` from `crypto`, `z` from `zod`, `createTodoSchema` and `VALIDATION_ERROR` from `@todo-bmad/shared`
  - [x] 1.3 Add POST `/api/todos` handler inside the existing `todosRoutes` plugin
  - [x] 1.4 Handler step 1: parse body with `createTodoSchema.parse(request.body)` in try/catch; on `z.ZodError` → return 400 with `{ error: VALIDATION_ERROR, message: err.issues[0].message }`
  - [x] 1.5 Handler step 2: sanitize via `stripHtmlTags(parsed.text)`
  - [x] 1.6 Handler step 3: generate `id` via `randomUUID()`, `createdAt` via `new Date().toISOString()`
  - [x] 1.7 Handler step 4: insert via `app.db.insert(todos).values({ id, text: sanitizedText, completed: false, createdAt }).run()`
  - [x] 1.8 Handler step 5: return `reply.status(201).send({ todo: { id, text: sanitizedText, completed: false, createdAt } })`

- [x] Task 2: Write tests for POST /api/todos (AC: #1–#8)
  - [x] 2.1 Add `describe("POST /api/todos")` block to existing `src/routes/todos.test.ts` — reuse same `beforeEach`/`afterEach` setup
  - [x] 2.2 Test: valid text returns 201 with `{ todo }` containing `id`, `text`, `completed`, `createdAt`
  - [x] 2.3 Test: returned `id` matches UUID v4 regex pattern
  - [x] 2.4 Test: leading/trailing whitespace is trimmed in response text
  - [x] 2.5 Test: HTML tags are stripped from stored text (e.g., `<b>hello</b>` → `hello`)
  - [x] 2.6 Test: empty text returns 400 with `VALIDATION_ERROR` error code
  - [x] 2.7 Test: whitespace-only text returns 400 with `VALIDATION_ERROR`
  - [x] 2.8 Test: text exceeding 128 characters returns 400 with `VALIDATION_ERROR`
  - [x] 2.9 Test: `completed` is `false` and `createdAt` is valid ISO 8601 in response
  - [x] 2.10 Test: malformed JSON body returns 400
  - [x] 2.11 Test: created todo appears in subsequent GET `/api/todos` response

- [x] Task 3: Verify all tests and build pass (run from project root)
  - [x] 3.1 Run `npm run test` — all tests pass across all packages
  - [x] 3.2 Run `npm run test:e2e` — all E2E tests pass (2/2)
  - [x] 3.3 Run `npm run build` — production build completes without errors

## Dev Notes

### Architecture Compliance

This is the second route handler added to `routes/todos.ts`, extending the existing `todosRoutes` plugin with a POST handler. Stories 1.5 and 1.6 follow this same pattern.

**Critical constraints:**
- Use `createTodoSchema` from `@todo-bmad/shared` for validation — never write ad-hoc validation (Enforcement Rule #4)
- Response shape: `{ todo: Todo }` (not `{ data: ... }`)
- Error response: `{ error: "VALIDATION_ERROR", message: "..." }` format
- Named exports only (Enforcement Rule #2)
- This is the first handler using Zod body validation — establishes the pattern for Stories 1.5 and 1.6

[Source: architecture.md#API & Communication Patterns, architecture.md#Implementation Patterns & Consistency Rules]

### Route Handler Implementation

Add the POST handler inside the **existing** `todosRoutes` plugin in `routes/todos.ts`. Do NOT create a separate file or plugin.

**Handler flow:**
1. Parse and validate: `createTodoSchema.parse(request.body)` — handles trim + length check
2. Sanitize: `stripHtmlTags(text)` — removes HTML tags for XSS prevention
3. Generate server values: `id` = `randomUUID()`, `createdAt` = `new Date().toISOString()`
4. Insert and respond: Drizzle `.insert().values().run()`, return 201 with `{ todo }`

**New imports needed in `routes/todos.ts`:**

```typescript
import { randomUUID } from "crypto";
import { z } from "zod";
import { createTodoSchema, VALIDATION_ERROR } from "@todo-bmad/shared";
```

**ZodError handling pattern:**

```typescript
app.post("/api/todos", async (request, reply) => {
  let parsed;
  try {
    parsed = createTodoSchema.parse(request.body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        error: VALIDATION_ERROR,
        message: err.issues[0].message,
      });
    }
    throw err;
  }

  const text = stripHtmlTags(parsed.text);
  const id = randomUUID();
  const createdAt = new Date().toISOString();

  app.db.insert(todos).values({ id, text, completed: false, createdAt }).run();

  return reply.status(201).send({
    todo: { id, text, completed: false, createdAt },
  });
});
```

### HTML Sanitization

**Approach:** Regex-based tag stripping — no external dependency needed for 128-char todo text.

```typescript
function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}
```

Handles: `<b>hello</b>` → `hello`, `<script>alert('xss')</script>` → `alert('xss')`, `<img src=x onerror=alert(1)>` → empty string.

Combined with React's JSX escaping on the frontend, this satisfies NFR14.

**Processing order:** Zod `.trim()` runs first (during parse), then HTML tags are stripped. So `  <b>hello</b>  ` → Zod trims to `<b>hello</b>` → strip to `hello`.

### UUID Generation

Use Node.js built-in `crypto.randomUUID()` — generates RFC 4122 v4 UUIDs. No external dependency.

```typescript
import { randomUUID } from "crypto";
const id = randomUUID();
```

### Zod 4 Validation Details

The `createTodoSchema` from `@todo-bmad/shared` already handles:
- `.trim()` — strips leading/trailing whitespace
- `.min(1)` — rejects empty strings (including whitespace-only after trim)
- `.max(128)` — enforces MAX_TEXT_LENGTH

On parse failure, Zod 4 throws `z.ZodError` with `error.issues` array. Use `error.issues[0].message` for the human-readable message.

**Note:** `fastify-type-provider-zod` is NOT installed. Use `schema.parse()` directly in handlers per architecture decision.

### Body Limit (10KB) — Already Handled

`bodyLimit: 10240` is configured in `app.ts` (set in Story 1.2). Fastify rejects oversized bodies with a 413 before the route handler runs. No additional code needed.

### Malformed JSON — Already Handled

Fastify's default content-type parser rejects malformed JSON with a 400 error. The global error handler in `plugins/error-handler.ts` formats it as `{ error: VALIDATION_ERROR, message: "..." }`. No additional code needed.

### Testing Strategy

Extend the existing `routes/todos.test.ts` with a new `describe("POST /api/todos")` block. Reuse the same `beforeEach`/`afterEach` setup.

**UUID v4 validation regex:**
```typescript
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
expect(todo.id).toMatch(UUID_V4_REGEX);
```

**ISO 8601 validation:**
```typescript
expect(new Date(todo.createdAt).toISOString()).toBe(todo.createdAt);
```

**Integration test (AC #11):** After POST, verify the todo appears in GET `/api/todos`.

### Technology Versions

| Package | Version | Notes |
|---------|---------|-------|
| zod | ^4.3.0 | `.parse()` throws `z.ZodError`, access `error.issues` |
| drizzle-orm | ^0.45.1 | `.insert().values().run()` synchronous with better-sqlite3 |
| fastify | ^5.8 | `request.body` auto-parsed for JSON content-type |
| Node.js crypto | built-in | `randomUUID()` for UUID v4 |

No new dependencies needed for this story.

### Project Structure Notes

```
packages/backend/src/
├── routes/
│   ├── todos.ts          (MODIFIED — add POST handler + stripHtmlTags helper)
│   └── todos.test.ts     (MODIFIED — add POST test cases)
```

Only 2 files are modified. No new files. No new directories. The `stripHtmlTags` helper is a local function in `routes/todos.ts` (not exported, not in a separate utils file).

### What This Story Does NOT Include

- PATCH `/api/todos/:id` (Story 1.5)
- DELETE `/api/todos/:id` (Story 1.6)
- POST `/api/revalidate` (Story 1.8+)
- `sanitize-html` or any external sanitization library
- Any frontend changes
- E2E tests or Playwright configuration

### Anti-Patterns to Avoid

- **Do NOT create a separate route file for POST** — add to existing `todosRoutes` plugin in `routes/todos.ts`
- **Do NOT write ad-hoc validation** — use `createTodoSchema` from `@todo-bmad/shared`
- **Do NOT install `fastify-type-provider-zod`** — not in this project; use `schema.parse()` directly
- **Do NOT install `uuid` npm package** — use built-in `crypto.randomUUID()`
- **Do NOT install `sanitize-html` npm package** — regex stripping is sufficient for 128-char text
- **Do NOT return the raw DB row** — construct the response object explicitly to ensure correct shape
- **Do NOT use `default` exports** — named exports only
- **Do NOT use `db.query` API** — use `db.insert().values()` (SQL-like API)
- **Do NOT modify `app.ts`, `index.ts`, or any plugin** — only modify files in `routes/`
- **Do NOT add pagination or filtering** — just create and return

### Previous Story Intelligence

**From Story 1.3 (done):**
- Route handler pattern: `fp(async (app: FastifyInstance) => { ... })` wrapped with `fastify-plugin`
- DB accessed via `app.db` decoration
- Drizzle operations are synchronous with better-sqlite3: `.all()` for select, `.run()` for mutations
- Tests use `beforeEach` with in-memory SQLite (`getDb(":memory:")`) + `buildApp(config, db)`, `afterEach` with `app.close()`
- `desc` imported from `drizzle-orm` root package
- All imports are named (no default exports)
- Currently 4 GET tests in `todos.test.ts` — new POST tests go in a separate `describe` block

**From Story 1.2 (done):**
- `fastify-plugin` wrapping is required for route plugins to access `app.db`
- Error handler formats: 400s → `VALIDATION_ERROR`, 500s → `INTERNAL_ERROR` with generic message
- `bodyLimit: 10240` already configured (10KB per NFR17)
- Malformed JSON bodies are caught by Fastify's parser → 400 error → error handler formats as `VALIDATION_ERROR`
- Test config: `{ ...getConfig(), LOG_LEVEL: "silent" }`

**From Story 1.1 (done):**
- Backend uses `module: CommonJS` + `moduleResolution: node` in tsconfig
- Import shared package as `@todo-bmad/shared`
- `crypto` is a Node.js built-in — just `import { randomUUID } from "crypto"`

### Naming Conventions (Enforced)

| Context | Convention | Example |
|---------|-----------|---------|
| Helper function | camelCase | `stripHtmlTags` |
| API endpoint | kebab-case, plural noun | `/api/todos` |
| JSON response keys | camelCase | `createdAt` |
| Error code | UPPER_SNAKE_CASE | `VALIDATION_ERROR` |
| Exports | Named only | `export const todosRoutes` |

### Git Workflow

Per `project-context.md`: create feature branch `feat/1-4-create-todo-endpoint` from `main` before starting implementation. Commit incrementally. Do not merge to `main` directly.

### References

- [Source: architecture.md#API & Communication Patterns] — POST endpoint spec, 201 response, error format
- [Source: architecture.md#Authentication & Security] — XSS prevention via HTML tag stripping
- [Source: architecture.md#Data Architecture] — UUID v4 generation, Zod validation, Drizzle insert
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — naming, exports, enforcement rules
- [Source: architecture.md#Process Conventions] — validation on server, error format
- [Source: epics.md#Story 1.4] — acceptance criteria
- [Source: 1-3-list-todos-endpoint.md] — route handler pattern, Drizzle query pattern, test setup
- [Source: shared/src/schemas.ts] — `createTodoSchema` definition (trim, min(1), max(128))
- [Source: shared/src/constants.ts] — `VALIDATION_ERROR` constant
- [Source: backend/src/plugins/error-handler.ts] — global error handler (catches malformed JSON, body limit)

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Debug Log References

No debug issues encountered. Implementation was straightforward following Dev Notes exactly.

### Completion Notes List

- ✅ Added `stripHtmlTags` helper using regex `/<[^>]*>/g` — no external deps needed
- ✅ Added POST `/api/todos` handler inside existing `todosRoutes` plugin with Zod parse, HTML strip, UUID gen, Drizzle insert, 201 response
- ✅ Body limit (10KB) and malformed JSON handling confirmed already handled by `app.ts` + `error-handler.ts` from Story 1.2
- ✅ 10 new tests added to `todos.test.ts` in a separate `describe("POST /api/todos")` block; all pass
- ✅ Full test suite: 22 backend tests + 17 shared tests — all pass, no regressions
- ✅ Production build: all 3 packages compile cleanly
- ✅ E2E tests: 2/2 pass (homepage HTTP 200 + "Hello World" content check)

### File List

- packages/backend/src/routes/todos.ts
- packages/backend/src/routes/todos.test.ts
- project-context.md

### Change Log

- 2026-03-17: Implemented POST /api/todos endpoint with validation, HTML sanitization, UUID generation, Drizzle insert, and 10 test cases (Story 1.4)
- 2026-03-17: Code review — fixed 3 issues: (H1) added post-sanitization empty-text guard after HTML stripping, (M1) strengthened malformed JSON test to assert VALIDATION_ERROR code, (M2) added project-context.md to File List. 23 backend tests now pass.
- **Post-story amendment (2026-03-20):** `stripHtmlTags` helper and its associated tests were removed in the security hardening spec (`tech-spec-security-hardening-critical-high`). React JSX escaping at render is the correct and complete XSS protection layer for this stack. Storing text verbatim and rendering it safely via `{todo.text}` is the intended pattern going forward.
