# Story 1.10: 100% Unit Test Coverage

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want every non-trivial code path in every package to have a corresponding unit test and enforced coverage thresholds,
so that regressions are caught automatically and the codebase can evolve with full confidence.

## Background

Coverage measurement was intentionally deferred out of story 1-9 to keep that branch focused on functional delivery. This story owns the full coverage setup end-to-end: enabling collection, writing the missing tests, closing every gap, and locking thresholds at 100%.

**Once this story is merged, 100% unit test coverage is a permanent Definition of Done requirement.** Every subsequent story that adds or modifies source files must maintain 100% coverage — `npm run test` will fail with a non-zero exit code if any package drops below the threshold. Coverage is not optional and must not be deferred.

**This story touches no user-visible behaviour.** There are no UX, API, or architecture changes. It is entirely test and configuration work.

## Acceptance Criteria

1. **Given** all three packages **When** `npm run test` is executed **Then** every package reports 100% statements, branches, functions, and lines

2. **Given** coverage is not yet configured **When** this story begins **Then** the first task is to enable `collectCoverage` in all three `jest.config.js` files, confirm a baseline, and identify all gaps before writing any tests

3. **Given** `packages/frontend/src/lib/utils.ts` **When** coverage is measured **Then** `cn`, `pickRandom`, and `formatTimestamp` are each exercised by dedicated unit tests

4. **Given** `packages/frontend/src/lib/api.ts` **When** coverage is measured **Then** both `fetchTodos` and `createTodo` (including all error paths) are exercised by dedicated unit tests

5. **Given** `packages/backend/src/routes/todos.ts` **When** a non-ZodError is thrown inside a schema `parse()` call **Then** the route re-throws the error and the test verifies the server returns a 500

6. **Given** `packages/frontend/src/lib/api.ts` **When** `fetchTodos` receives a response whose body is `null` (not `{ todos: null }`) **Then** the function returns `[]` — and this is exercised by a unit test

7. **Given** `packages/frontend/src/hooks/use-todos.ts` **When** `addTodo` catches a truly non-object error (e.g. `throw null`) **Then** the fallback message `"Failed to create todo"` is returned — and this is exercised by a unit test

8. **Given** `packages/frontend/src/components/todo-input.tsx` optional-chaining ref calls **When** these branches are genuinely unreachable for a mounted component **Then** they are annotated with `/* istanbul ignore next */` and documented in `project-context.md` with a precise explanation of why

9. **Given** the Jest configuration for all three packages **When** the story is complete **Then** `coverageThreshold.global` is set to `100` for all four metrics in every `jest.config.js`

10. **Given** `project-context.md` **When** the story is complete **Then** the DoD Step 3 is updated to reflect: (a) 100% thresholds enforced on every `npm run test` run, (b) the file exclusion list, (c) the approved `/* istanbul ignore next */` usage pattern, and (d) an explicit rule that **no story may be marked `review` unless all packages pass at 100%**

11. **Given** `coverage/` output directories **When** the story is complete **Then** `coverage/` is listed in `.gitignore`

## Starting State

Coverage is **not enabled** at the start of this story. The jest configs have no `collectCoverage`, no `coverageThreshold`, and no `coverageReporters`.

The following test files **do not exist** and must be created:

| File | Functions that need tests |
|------|--------------------------|
| `packages/frontend/src/lib/utils.test.ts` | `cn`, `pickRandom`, `formatTimestamp` |
| `packages/frontend/src/lib/api.test.ts` | `fetchTodos` (all paths), `createTodo` (success + error paths) |

## Known Gaps (to validate after enabling coverage)

Run `npm run test` with coverage enabled as the very first action to confirm these gaps — treat this as the baseline, not as gospel.

### `packages/backend` — `src/routes/todos.ts`

| Lines | Root cause |
|-------|------------|
| 30, 62 | `throw err` defensive re-throw when `createTodoSchema.parse()` / `updateTodoSchema.parse()` raises a **non-ZodError** exception. Zod always throws `ZodError`, so this path is unreachable without mocking. |

**Fix strategy:** In `src/routes/todos.test.ts`, add two tests that use `jest.spyOn` (or `jest.mock('@todo-bmad/shared', ...)`) to make `parse` throw `new Error('unexpected')` for POST and PATCH respectively, then assert status 500. Restore mocks in `afterEach` with `jest.restoreAllMocks()`.

### `packages/frontend` — `src/lib/api.ts`

| Branch | Root cause |
|--------|------------|
| Line 15 — false branch of `data?.todos` | `data` itself could be `null`/`undefined`. `Array.isArray(null?.todos)` → false → returns `[]`. Existing tests cover `data.todos` being non-array, not `data` being nullish. |

**Fix strategy:** In the new `api.test.ts`, add a test where `response.json()` resolves to `null` and verify `fetchTodos` returns `[]`.

### `packages/frontend` — `src/hooks/use-todos.ts`

| Branch | Root cause |
|--------|------------|
| Line 38 — false branch of `apiError?.message` | The `?.` creates a branch for when `err` itself is `null`/`undefined`. Existing tests cover `err` being an object without `.message`, not `err` being `null`. |

**Fix strategy:** In `use-todos.test.ts`, add a test where `createTodo` rejects with `null` and verify `createError` is `"Failed to create todo"`.

### `packages/frontend` — `src/components/todo-input.tsx`

| Lines | Root cause |
|-------|------------|
| 40, 53, 67 | `inputRef.current?.focus()` / `?.blur()` — optional chaining creates an implicit null branch. For a mounted React component, `inputRef.current` is **always** attached to the DOM element at the point these effects/handlers execute. The null branch is structurally unreachable without adversarial test gymnastics. |

**Fix strategy:** Apply `/* istanbul ignore next */` to each of the three lines with an explanatory comment. See the "Istanbul ignore pattern" section below. Then document this pattern in `project-context.md`.

## Tasks / Subtasks

- [ ] Task 1 — Enable coverage collection and establish baseline (AC: 2)
  - [ ] Add `collectCoverage: true`, `collectCoverageFrom`, `coverageDirectory: "coverage"`, `coverageReporters: ["text", "lcov"]` to `packages/shared/jest.config.js` (no threshold yet)
  - [ ] Add the same to `packages/backend/jest.config.js`, excluding `src/index.ts` and `src/db/client.ts`
  - [ ] Add the same to `packages/frontend/jest.config.js`, excluding `src/app/layout.tsx`, `src/app/page.tsx`, and `src/lib/actions.ts`
  - [ ] Add `coverage/` to `.gitignore`
  - [ ] Run `npm run test` from the repo root and record the baseline percentage for each package
  - [ ] Confirm the known gaps above are present (or update this story if the baseline differs)

- [ ] Task 2 — Create `packages/frontend/src/lib/utils.test.ts` (AC: 1, 3)
  - [ ] Test `cn`: merges class names, deduplicates conflicting Tailwind classes, handles conditional/falsy classes
  - [ ] Test `pickRandom`: returns an item from the array, throws on empty array
  - [ ] Test `formatTimestamp`: formats as `DD/MM/YYYY HH:mm`, zero-pads single-digit values, output matches pattern regex
  - [ ] Confirm `utils.ts` reaches 100% in all metrics

- [ ] Task 3 — Create `packages/frontend/src/lib/api.test.ts` (AC: 1, 4, 6)
  - [ ] Test `fetchTodos` success: returns the todos array
  - [ ] Test `fetchTodos` non-ok response: returns `[]`
  - [ ] Test `fetchTodos` network error (fetch throws): returns `[]`
  - [ ] Test `fetchTodos` when `data.todos` is not an array: returns `[]`
  - [ ] Test `fetchTodos` when `data` itself is `null` (the `data?.todos` null branch): returns `[]`
  - [ ] Test `createTodo` success: returns the new todo
  - [ ] Test `createTodo` non-ok response with valid JSON error: throws the parsed `ApiError`
  - [ ] Test `createTodo` non-ok response with invalid JSON: throws fallback `ApiError`
  - [ ] Confirm `api.ts` reaches 100% in all metrics

- [ ] Task 4 — Backend: cover `throw err` re-throw paths (AC: 1, 5)
  - [ ] In `src/routes/todos.test.ts`, add test for POST that mocks `createTodoSchema.parse` to throw `new Error('unexpected')` and asserts status 500
  - [ ] Add the same for PATCH mocking `updateTodoSchema.parse`, assert status 500
  - [ ] Confirm `todos.ts` reaches 100% statements and lines

- [ ] Task 5 — Frontend: cover `use-todos.ts` null catch branch (AC: 1, 7)
  - [ ] In `src/hooks/use-todos.test.ts`, add test: `addTodo` sets `createError` to `"Failed to create todo"` when `createTodo` rejects with `null`
  - [ ] Confirm `use-todos.ts` branches reach 100%

- [ ] Task 6 — Frontend: annotate unreachable ref null branches in `todo-input.tsx` (AC: 1, 8)
  - [ ] Add `/* istanbul ignore next -- inputRef.current is always attached for a mounted component */` above line 40 (`inputRef.current?.focus()` in `useLayoutEffect`)
  - [ ] Add the same above line 53 (`inputRef.current?.focus()` in the disabled `useEffect`)
  - [ ] Add the same above line 67 (`inputRef.current?.blur()` in `handleKeyDown`)
  - [ ] Confirm `todo-input.tsx` branches reach 100%

- [ ] Task 7 — Set all thresholds to 100% and confirm full suite (AC: 1, 9)
  - [ ] Update `packages/shared/jest.config.js`: add `coverageThreshold` with all four metrics at `100`
  - [ ] Update `packages/backend/jest.config.js`: add `coverageThreshold` with all four metrics at `100`
  - [ ] Update `packages/frontend/jest.config.js`: add `coverageThreshold` with all four metrics at `100`
  - [ ] Run `npm run test` from repo root and confirm all three packages exit with code 0 showing 100%

- [ ] Task 8 — Update `project-context.md` DoD to make 100% coverage a permanent gate (AC: 10)
  - [ ] Update Step 3 heading to "Unit Tests & Coverage"
  - [ ] Add explicit rule: **no story may be marked `review` unless all packages report 100% across all four metrics**
  - [ ] Add the coverage threshold table (100% for statements, branches, functions, lines)
  - [ ] Add the file exclusion list (`src/lib/actions.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/index.ts`, `src/db/client.ts`)
  - [ ] Add the "Istanbul ignore pattern" approved usage section (see Dev Notes below)
  - [ ] Add rule: coverage gaps must be closed in the **same story** that introduces the gap — never deferred

- [ ] Task 9 — Commit
  - [ ] `git add` all changes
  - [ ] Commit: `test: enable 100% coverage threshold and close all gaps`

## Dev Notes

### ⚠️ CRITICAL — 100% Coverage is a Permanent DoD Gate

The single most important outcome of this story is the `project-context.md` update. The DoD Step 3 must make it **unambiguously clear** that:

- `npm run test` collects coverage on every run and **fails the build** if any package is below 100%
- No story may be marked `review` until all packages pass at 100% for all four metrics (statements, branches, functions, lines)
- Coverage gaps must be closed in the **same story** that introduces the code — never deferred to a later story
- The only permitted exception is annotated `/* istanbul ignore next */` for structurally unreachable branches (see pattern below), and each use must be justified in a comment

This is not a reporting exercise. The `coverageThreshold` in each `jest.config.js` is the enforcement mechanism. Without it, coverage numbers are advisory only and will drift.

### Istanbul Ignore Pattern (approved usage)

`/* istanbul ignore next */` is permitted **only** for code paths that are:

1. Structurally unreachable during a correctly mounted component's lifecycle (e.g. DOM ref null checks after mount), **and**
2. Documented with a comment explaining exactly why

**Approved format (the comment Istanbul recognises on the same or preceding line):**

```typescript
/* istanbul ignore next -- inputRef.current is always attached for a mounted component */
inputRef.current?.focus();
```

Do **not** use it to silence branches that are merely inconvenient to test. If a branch is reachable but hard to exercise, write the test.

### Mocking Zod Schema in Backend Tests

`createTodoSchema` and `updateTodoSchema` are named imports from `@todo-bmad/shared`. Use `jest.spyOn` first:

```typescript
import * as shared from "@todo-bmad/shared";

jest.spyOn(shared.createTodoSchema, "parse").mockImplementationOnce(() => {
  throw new Error("unexpected internal error");
});
```

If the compiled module bindings are non-configurable, fall back to a full `jest.mock`:

```typescript
jest.mock("@todo-bmad/shared", () => ({
  ...jest.requireActual("@todo-bmad/shared"),
  createTodoSchema: {
    parse: jest.fn().mockImplementationOnce(() => {
      throw new Error("unexpected");
    }),
  },
}));
```

Always call `jest.restoreAllMocks()` in `afterEach` to prevent test pollution.

### Coverage Config Reference

Each `jest.config.js` should end up with this structure (paths vary per package):

```js
collectCoverage: true,
collectCoverageFrom: [
  "src/**/*.{ts,tsx}",
  "!src/lib/actions.ts",       // frontend only — Next.js Server Action
  "!src/app/layout.tsx",       // frontend only
  "!src/app/page.tsx",         // frontend only
  "!src/index.ts",             // backend + shared — entry points
  "!src/db/client.ts",         // backend only — DB connection
],
coverageDirectory: "coverage",
coverageReporters: ["text", "lcov"],
coverageThreshold: {
  global: {
    statements: 100,
    branches: 100,
    functions: 100,
    lines: 100,
  },
},
```

### Verification Sequence

```bash
# Individual packages first, to pinpoint any remaining gaps
npm run test -w packages/shared
npm run test -w packages/backend
npm run test -w packages/frontend

# Then full suite
npm run test
```

All must exit with code 0 and show 100% across all four metrics for every package.

### Project Structure Notes

All changes are confined to:
- `packages/shared/jest.config.js` — coverage config + threshold
- `packages/backend/jest.config.js` — coverage config + threshold
- `packages/backend/src/routes/todos.test.ts` — 2 new tests (non-ZodError re-throw)
- `packages/frontend/jest.config.js` — coverage config + threshold
- `packages/frontend/src/lib/utils.test.ts` — **new file**
- `packages/frontend/src/lib/api.test.ts` — **new file**
- `packages/frontend/src/hooks/use-todos.test.ts` — 1 new test (null catch)
- `packages/frontend/src/components/todo-input.tsx` — 3 Istanbul ignore comments only (no logic change)
- `project-context.md` — DoD Step 3 update
- `.gitignore` — add `coverage/`

No production logic changes. No new runtime dependencies.

### References

- [Source: project-context.md#Definition of Done] — Step 3 Unit Tests (current bare form, to be expanded by this story)
- Previous story: `_bmad-output/implementation-artifacts/1-9-todo-creation-list-display.md` — introduced components and hooks that are the subject of coverage here

## Dev Agent Record

### Agent Model Used

_to be filled in by dev agent_

### Debug Log References

### Completion Notes List

### Change Log

### File List
