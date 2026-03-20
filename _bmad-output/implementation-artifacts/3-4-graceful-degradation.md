# Story 3.4: Graceful Degradation

Status: cancelled

## Story

As a user,
I want the app to still render when the backend is down,
So that I see a working page rather than a broken or blank screen.

## Acceptance Criteria

1. **Given** the backend API is unavailable during ISR server render **When** `page.tsx` attempts to fetch todos **Then** the page renders gracefully with the static shell (layout, responsive column, design tokens, input area) intact.

2. **Given** the server render fails to fetch data **When** the page is delivered to the browser **Then** the list area shows the `LoadError` component rather than a crash or blank page.

3. **Given** the static shell **When** rendered without API data **Then** the `TodoInput` component and all app chrome remain interactive and visually correct.

4. **Given** the client-side hydration **When** the page loads with a failed server fetch **Then** the `useTodos` hook initialises `loadError=true` from the `fetchFailed` prop and displays `LoadError`.

5. **Given** the user creates a todo while `loadError` is true (backend has recovered) **When** `addTodo` succeeds **Then** `loadError` is cleared, the `LoadError` component disappears, and the new todo appears in a `TodoList`.

6. **Given** the user creates a todo while `loadError` is true **When** `addTodo` fails (backend still down) **Then** `loadError` remains true, the `LoadError` component stays visible, and the create error callout also appears near the input.

7. **Given** the `LoadError` retry button **When** the user clicks it and the fetch succeeds **Then** the skeleton appears during the fetch and the real todo list (or `EmptyState`) replaces it on success.

8. **Given** the app shell **When** the backend recovers **Then** the user can retry loading or create new todos normally.

9. **Given** graceful degradation behaviour **When** unit tests are run **Then** tests pass for: `addTodo` clearing `loadError` on success, `addTodo` preserving `loadError` on failure, `TodoPage` transitioning from `LoadError` to `TodoList` after a successful create.

10. **Given** Journey 4 E2E test **When** the test exercises create failure with text recovery, toggle failure with retry, and delete failure with retry **Then** all error states show friendly messages, all retry paths succeed, and no data is lost.

**Testing note:** Playwright E2E is **not** required for the initial server-side fetch failure path. That fetch runs in the Next.js server process; reliable E2E would imply stopping the backend — **explicitly out of scope** (see ADR in `project-context.md`). AC #5 and #6 are verified by unit tests. E2E continues to cover mutation error recovery in `e2e/journey-4-error-recovery.spec.ts`.

## Tasks / Subtasks

- [ ] Task 1: Fix `useTodos.addTodo` to clear `loadError` on success (AC: #5, #8)
  - [ ] 1.1 In the `addTodo` success path (after `setTodos`), add `setLoadError(false)` so that a successful create dismisses the `LoadError` state
  - [ ] 1.2 Verify the failure path does NOT touch `loadError` — a failed `addTodo` must leave `loadError` unchanged (AC: #6)

- [ ] Task 2: Add unit tests in `use-todos.test.ts` (AC: #9)
  - [ ] 2.1 Test: `addTodo` clears `loadError` on success when `initialFetchFailed=true`
  - [ ] 2.2 Test: `addTodo` does NOT clear `loadError` on failure when `initialFetchFailed=true`
  - [ ] 2.3 Test: after `addTodo` success with `loadError` cleared, `todos` contains only the new item

- [ ] Task 3: Add integration test in `todo-page.test.tsx` (AC: #9)
  - [ ] 3.1 Test: `TodoPage` transitions from `LoadError` to `TodoList` after a successful `addTodo` when `fetchFailed=true`
  - [ ] 3.2 Test: `TodoPage` keeps `LoadError` visible after a failed `addTodo` when `fetchFailed=true`, and the create error callout also appears

- [ ] Task 4: Definition of Done verification
  - [ ] 4.1 `npm run lint` — 0 errors
  - [ ] 4.2 `npm run build` — clean build
  - [ ] 4.3 `npm run test` — all pass, 100% coverage maintained
  - [ ] 4.4 `npm run test:e2e` — all pass (with `required_permissions: ["all"]`)
  - [ ] 4.5 `npm run test:lighthouse` — all scores meet thresholds (with `required_permissions: ["all"]`)

## Cancellation Rationale (2026-03-20)

Story 3-3 (Initial Load Error) delivered ~95% of the graceful degradation scope defined in this story's acceptance criteria. The server-side error signaling (`fetchTodos` returning `{ fetchFailed: true }`), the `LoadError` component with retry CTA, the `SkeletonLoader` for client-side retry, the `useTodos` hook's `retryLoad()` function, and all supporting unit tests were implemented and pass with 100% coverage.

The single remaining gap — `addTodo` not clearing `loadError` on success when the backend recovers — is a 1-line fix (`setLoadError(false)`) plus 4 unit tests. This does not warrant a standalone story with full create-story → dev-story → code-review ceremony. It will be addressed as review feedback on story 3-3.

**Remaining work to fold into 3-3 review:**
1. Add `setLoadError(false)` in `useTodos.addTodo` success path (1 line in `use-todos.ts`)
2. Add 2 unit tests in `use-todos.test.ts`: addTodo clears/preserves loadError
3. Add 2 integration tests in `todo-page.test.tsx`: TodoPage transitions from LoadError to TodoList on successful/failed addTodo

## Dev Notes

### Scope: This Is a Focused Fix Story

Story 3-3 (Initial Load Error) already implemented the vast majority of the graceful degradation infrastructure:
- `fetchTodos()` returns `{ todos: [], fetchFailed: true }` on failure — never throws
- `page.tsx` passes `fetchFailed` to `<TodoPage>`
- `useTodos` initialises `loadError` from `initialFetchFailed`, exposes `retryLoad()`
- `LoadError` component renders with retry CTA
- `SkeletonLoader` renders during client-side retry
- 214 unit tests pass with 100% coverage

**The single bug this story fixes:** `addTodo` in `useTodos` does not clear `loadError` on success. When the user creates a todo while `loadError` is true (the backend was down during SSR but has since recovered), the todo is created on the server and added to local state, but the UI still shows `LoadError` because the rendering logic in `todo-page.tsx` checks `loadError` before `todos.length > 0`.

### The Exact Fix

In `packages/frontend/src/hooks/use-todos.ts`, inside the `addTodo` function's `try` block, after the `setTodos` call:

```typescript
// Current code (lines 62–69):
try {
  const newTodo = await createTodo(trimmed);
  setTodos((prev) => [newTodo, ...prev]);
  setCachedCreateText("");
  setJustAdded(true);
  // ...
}

// Fixed code — add one line:
try {
  const newTodo = await createTodo(trimmed);
  setTodos((prev) => [newTodo, ...prev]);
  setLoadError(false);  // ← ADD THIS LINE
  setCachedCreateText("");
  setJustAdded(true);
  // ...
}
```

That is the entire production code change. The `addTodo` failure path (`catch` block) already does NOT touch `loadError`, which is the correct behaviour — a failed create should not dismiss the load error since the backend may still be down.

### Rendering Logic (unchanged, for reference)

`todo-page.tsx` evaluates these conditions in order:

```
isLoading   → <SkeletonLoader />
loadError   → <LoadError onRetry={retryLoad} />
todos.length > 0 → <TodoList ... />
else        → <EmptyState ... />
```

After the fix, when `addTodo` succeeds: `loadError` is cleared → rendering falls through to `todos.length > 0` → `TodoList` displays the new todo. This is the correct graceful degradation recovery path.

### Why Only `addTodo`?

`toggleTodo` and `deleteTodo` operate on existing items in the `todos` array. If `loadError` is true, the list area shows `LoadError` — there are no visible items for the user to toggle or delete. Only `addTodo` can be triggered from the input field which is always rendered above the list area regardless of `loadError` state.

### What Happens After the Fix

1. User opens app → backend is down → `fetchTodos()` returns `{ todos: [], fetchFailed: true }` → page renders with shell + `LoadError`
2. Backend recovers → user types a todo and presses Enter → `addTodo` calls `createTodo()` → succeeds → `setLoadError(false)` → `LoadError` disappears → `TodoList` shows with the new item
3. The user only sees their newly created todo (not their historical list). This is expected — `addTodo` doesn't fetch the full list. `revalidateHome()` ensures the next server render includes all data.
4. Alternatively, the user can click the Retry button on `LoadError` → `retryLoad()` fetches the full list → all existing todos appear.

### Unit Tests to Add

**`use-todos.test.ts` — 2 new tests:**

```typescript
it("addTodo clears loadError on success when initialFetchFailed=true", async () => {
  mockCreateTodo.mockResolvedValue(newTodo);
  const { result } = renderHook(() => useTodos([], true));
  expect(result.current.loadError).toBe(true);

  await act(async () => {
    await result.current.addTodo("New todo");
  });

  expect(result.current.loadError).toBe(false);
  expect(result.current.todos).toHaveLength(1);
});

it("addTodo does NOT clear loadError on failure when initialFetchFailed=true", async () => {
  mockCreateTodo.mockRejectedValue({ message: "Still down" });
  const { result } = renderHook(() => useTodos([], true));
  expect(result.current.loadError).toBe(true);

  await act(async () => {
    await result.current.addTodo("New todo");
  });

  expect(result.current.loadError).toBe(true);
  expect(result.current.createError).toBe("Still down");
});
```

**`todo-page.test.tsx` — 2 new tests:**

```typescript
it("transitions from LoadError to TodoList after successful addTodo", async () => {
  mockCreateTodo.mockResolvedValue(newTodo);
  render(<TodoPage initialTodos={[]} emptyMessage="Nothing here yet" fetchFailed={true} />);

  // LoadError is showing
  expect(getAlertByType("load")).toBeInTheDocument();

  const input = screen.getByRole("textbox", { name: /new todo/i });
  fireEvent.change(input, { target: { value: "Walk the dog" } });
  fireEvent.keyDown(input, { key: "Enter" });

  await waitFor(() => {
    expect(queryAlertByType("load")).not.toBeInTheDocument();
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByText("Walk the dog")).toBeInTheDocument();
  });
});

it("keeps LoadError visible after failed addTodo, shows create error callout", async () => {
  mockCreateTodo.mockRejectedValue({ message: "Server error" });
  render(<TodoPage initialTodos={[]} emptyMessage="Nothing here yet" fetchFailed={true} />);

  expect(getAlertByType("load")).toBeInTheDocument();

  const input = screen.getByRole("textbox", { name: /new todo/i });
  fireEvent.change(input, { target: { value: "Walk the dog" } });
  fireEvent.keyDown(input, { key: "Enter" });

  await waitFor(() => {
    expect(getAlertByType("load")).toBeInTheDocument();
    expect(getAlertByType("create")).toBeInTheDocument();
  });
});
```

### E2E Tests (No Changes Needed)

Journey 4 (`e2e/journey-4-error-recovery.spec.ts`) already covers mutation error recovery:
- Create failure → restore text → retry succeeds
- Toggle failure → retry succeeds
- Delete failure → retry succeeds

No new E2E tests are needed. The SSR failure path (AC #1–#4) is covered by unit tests per the established ADR in `project-context.md`. The new AC #5–#6 transitions (loadError → addTodo → list) are client-side state transitions that are fully verifiable in unit tests.

### Existing Code: Files to Modify

| File | Change |
|------|--------|
| `packages/frontend/src/hooks/use-todos.ts` | Add `setLoadError(false)` in `addTodo` success path (1 line) |

### Existing Code: Files to Update Tests

| File | Change |
|------|--------|
| `packages/frontend/src/hooks/use-todos.test.ts` | Add 2 tests: addTodo clears/preserves loadError |
| `packages/frontend/src/components/todo-page.test.tsx` | Add 2 tests: TodoPage transitions on addTodo success/failure with fetchFailed |

### No New Files

No new components, hooks, or modules are needed. This story is purely a bug fix + test coverage.

### ZERO Lighthouse Regression Tolerance

This story adds zero new components, zero new imports, and zero changes to the rendering happy path. The single `setLoadError(false)` line only executes when `addTodo` succeeds — it has no impact on the initial server render, bundle size, or critical rendering path. Lighthouse scores should be completely unchanged.

Current enforced baselines:

| Category | Desktop | Mobile |
|---|---|---|
| Performance | **90** (observed 93) | **90** (observed 100) |
| Accessibility | **100** | **100** |
| Best Practices | **100** | **100** |
| SEO | **100** | **100** |

### Previous Story Intelligence (Story 3-3)

Key learnings from the previous story:
- `LoadError` uses `data-alert-type="load"` and `id="load-error"` — query alerts via `data-alert-type` attribute to avoid matching Next.js route announcer
- `SkeletonLoader` is a presentational component with `role="list"`, `aria-busy="true"`, `aria-label="Loading todos"`
- `fetchTodosClient()` throws `ApiError` on failure; `fetchTodos()` (server-side) never throws
- Test helpers `getAlertByType("load")` and `queryAlertByType("load")` already exist in `todo-page.test.tsx`
- 214 unit tests pass, 100% coverage — do not break any existing tests
- Lighthouse desktop 93, mobile 100 — do not introduce any regression
- `/* istanbul ignore next */` is only approved for `todo-input.tsx` ref guards — do not add new ignore comments

### Git Intelligence

Recent commits (most recent first):
- `1177bb8` — Feat/3 3 initial load error (#19)
- `eadc019` — Feat/3 2 error handling for mutations (#18)
- `a24064e` — Feat/3 1 loading state skeleton loader (#17)

### Performance Considerations

This is a 1-line production change. No performance impact whatsoever:
- No new dependencies
- No new components
- No new imports in the critical path
- No changes to SSR rendering
- No bundle size growth
- The `setLoadError(false)` call is a React state setter that batches with existing setters in the same event

### Project Structure Notes

- All changes are in existing files — no new files created
- Named exports only
- Use `@/` import alias for project-relative imports
- Co-located test files with source

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.4] — acceptance criteria, BDD scenarios
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — pending state pattern, useTodos hook, rendering strategy
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns] — mutation flow, error handling layers
- [Source: _bmad-output/implementation-artifacts/3-3-initial-load-error.md] — previous story, LoadError/SkeletonLoader implementation, fetchFailed prop chain
- [Source: project-context.md#ADR] — SSR failure testing strategy (unit-only), React Suspense rejected
- [Source: project-context.md#Definition of Done] — lint, build, test, e2e, lighthouse gates, 100% coverage
- [Source: project-context.md#Code Quality Rules] — no CSS class assertions in tests, POM pattern for E2E

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
