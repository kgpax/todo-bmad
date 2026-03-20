# Story 3.2: Error Handling for Mutations

Status: review

## Story

As a user,
I want friendly, helpful feedback when creating, completing, or deleting a todo fails,
So that I know what happened and can easily try again without losing my work.

## Acceptance Criteria

1. **Given** the ErrorCallout component **When** rendered for a failed create **Then** it displays personality-driven copy from the create error bank ("That one didn't stick. Give it another go?").

2. **Given** the ErrorCallout component **When** rendered for a failed toggle **Then** it displays copy from the toggle error bank ("Hmm, couldn't update that one. Try again?").

3. **Given** the ErrorCallout component **When** rendered for a failed delete **Then** it displays copy from the delete error bank ("Wouldn't let go of that one. One more try?").

4. **Given** a mutation failure **When** the error animation sequence plays **Then** the affected element shakes (~300ms, 2-3 oscillations), flashes error color (~200ms), then the callout fades in (~150ms after shake completes).

5. **Given** a user with `prefers-reduced-motion` enabled **When** a mutation fails **Then** the error callout appears immediately with no shake or flash animation.

6. **Given** the ErrorCallout **When** inspected **Then** it has `role="alert"` and is linked to its triggering element via `aria-describedby`.

7. **Given** a failed create operation **When** the error occurs **Then** the user's typed text is cached internally and the error callout includes a restore action that puts the text back in the input.

8. **Given** a failed create with text restored **When** the user presses Enter again **Then** the create is retried with the restored text.

9. **Given** a failed toggle **When** the user taps the checkbox again **Then** the toggle is retried and the error callout clears on success.

10. **Given** a failed delete **When** the user taps the delete button again **Then** the delete is retried and the error callout clears on success.

11. **Given** a successful retry after any error **When** the operation succeeds **Then** the error callout fades out and the normal success animation plays.

12. **Given** all error handling code **When** unit tests are run **Then** tests pass for ErrorCallout rendering (all 3 copy banks), error state management in useTodos, text cache/restore logic, and ARIA attributes.

13. **Given** E2E test for failed create **When** the API rejects a create request **Then** the input shakes, error callout appears, and the user can recover their text and retry.

14. **Given** E2E test for failed toggle **When** the API rejects a toggle request **Then** the item shakes, error callout appears near the item, and retry succeeds.

15. **Given** E2E test for failed delete **When** the API rejects a delete request **Then** the item shakes, error callout appears near the item, and retry succeeds.

## Tasks / Subtasks

- [x] Task 1: Create ErrorCallout component (AC: #1, #2, #3, #6)
  - [x] 1.1 Create `packages/frontend/src/components/error-callout.tsx`
  - [x] 1.2 Accept props: `type` (`"create" | "toggle" | "delete"`), `message` (optional override), `id` (for `aria-describedby` linking)
  - [x] 1.3 Render personality-driven copy from the appropriate bank based on `type`, falling back to the copy bank default if no `message` override
  - [x] 1.4 Apply `role="alert"` and a generated `id` for `aria-describedby` linking from the triggering element
  - [x] 1.5 Style: warm error color text, subtle, small — not card-based. Use `text-error` for color. Fade-in via CSS animation (`error-callout-fade-in` class).

- [x] Task 2: Add shake + error flash animation to `globals.css` (AC: #4, #5)
  - [x] 2.1 Add `@keyframes error-shake` to `globals.css`: translateX oscillation (0 → -4px → 4px → -4px → 4px → 0) over `var(--duration-shake)` (300ms)
  - [x] 2.2 Add `@keyframes fade-in` for ErrorCallout entry animation
  - [x] 2.3 Create `[data-error-animate="true"]` CSS rule applying the shake animation; attribute is derived directly from error prop
  - [x] 2.4 Under the existing `@media (prefers-reduced-motion: reduce)` block, ensure error animations are disabled (the existing `--duration-shake: 0ms` token handles timing, but also set `animation: none` explicitly for the error animation class)

- [x] Task 3: Wire create error into TodoInput (AC: #1, #4, #5, #6, #7, #8, #11)
  - [x] 3.1 Add new props to `TodoInput`: `createError: string | null`, `cachedCreateText: string`, `onClearError: () => void`
  - [x] 3.2 `data-error-animate` is derived directly from `createError` prop — shake fires via CSS when attribute appears
  - [x] 3.3 Render `<ErrorCallout type="create" />` below the input card when `createError` is truthy, with `aria-describedby` on the input referencing the callout's `id`
  - [x] 3.4 Show a "Restore" tertiary button/link inside the ErrorCallout when `cachedCreateText` is non-empty; clicking it sets input text from cached value
  - [x] 3.5 Clear `createError` (via `onClearError`) when the user starts typing or successfully submits
  - [x] 3.6 On successful retry (user presses Enter with restored text), error callout fades out naturally as `createError` clears

- [x] Task 4: Wire item-level errors into TodoItem (AC: #2, #3, #4, #5, #6, #9, #10, #11)
  - [x] 4.1 Add new props to `TodoItem`: `error: string | undefined`, `errorType: "toggle" | "delete" | undefined`
  - [x] 4.2 `data-error-animate` derived directly from `error` prop — shake fires via CSS when attribute appears
  - [x] 4.3 `errorType` passed from `TodoWithMeta.errorType` (set in hook catch blocks)
  - [x] 4.4 Render `<ErrorCallout />` below the card (inside the listitem wrapper) when both `error` and `errorType` are truthy
  - [x] 4.5 Add `aria-describedby` referencing the callout's `id` on the card container when error is set
  - [x] 4.6 Error clears on next successful operation (hook clears `error` on retry start)

- [x] Task 5: Wire errors through TodoPage and TodoList (AC: all)
  - [x] 5.1 Update `TodoPage` to destructure `createError`, `cachedCreateText`, `clearCreateError` from `useTodos` and pass to `TodoInput`
  - [x] 5.2 Text restore handled internally by `TodoInput` using `cachedCreateText` prop
  - [x] 5.3 `clearCreateError` passed to `TodoInput` as `onClearError`
  - [x] 5.4 Update `TodoList` to pass `error={todo.error}` and `errorType={todo.errorType}` to each `TodoItem`

- [x] Task 6: Update `useTodos` hook (AC: #7, #8, #9, #10, #11)
  - [x] 6.1 Add `clearCreateError()` method that sets `createError` to `null`
  - [x] 6.2 `addTodo()` clears `createError` at start of each attempt (already did this)
  - [x] 6.3 Toggle/delete retry clears per-item `error` at start of retry (sets `error: undefined` at start of mutation)
  - [x] 6.4 Return `clearCreateError` from the hook
  - [x] Also: added `errorType?: "toggle" | "delete"` to `TodoWithMeta`; set `errorType: "toggle"` in `toggleTodo` catch, `errorType: "delete"` in `deleteTodo` catch

- [x] Task 7: Unit tests for ErrorCallout (AC: #12)
  - [x] 7.1 Create `packages/frontend/src/components/error-callout.test.tsx`
  - [x] 7.2 Test: renders create error copy when `type="create"`
  - [x] 7.3 Test: renders toggle error copy when `type="toggle"`
  - [x] 7.4 Test: renders delete error copy when `type="delete"`
  - [x] 7.5 Test: has `role="alert"` attribute
  - [x] 7.6 Test: has `id` attribute for `aria-describedby` linking
  - [x] 7.7 Test: renders restore button when `onRestore` prop provided
  - [x] 7.8 Test: calls `onRestore` callback when restore button clicked
  - [x] 7.9 Test: does not render restore button when `onRestore` not provided
  - [x] 7.10 100% coverage — no untested branches

- [x] Task 8: Update existing unit tests (AC: #12)
  - [x] 8.1 Update `todo-input.test.tsx`: test error callout rendering, shake attribute, text restore, aria-describedby linking, error clearing on type
  - [x] 8.2 Update `todo-item.test.tsx`: test error callout rendering for toggle and delete errors, shake attribute, aria-describedby linking
  - [x] 8.3 Update `todo-list.test.tsx`: test that `error` and `errorType` props are forwarded to TodoItem
  - [x] 8.4 Update `todo-page.test.tsx`: test error callout appears on create/toggle/delete failure and clears on retry
  - [x] 8.5 Update `use-todos.test.ts`: test `clearCreateError` method, verify `errorType` on failure, verify error clearing on retry
  - [x] 8.6 100% coverage maintained across all packages

- [x] Task 9: E2E tests for error scenarios (AC: #13, #14, #15)
  - [x] 9.1 Add error-related locators and methods to `e2e/pages/todo-page.ts` POM: `createErrorCallout()`, `getItemErrorCallout(text)`, `restoreText()`, `isCardShaking()`
  - [x] 9.2 Use `page.route()` to intercept API calls and return error responses for testing
  - [x] 9.3 Add test: create failure → error callout with create message → restore text → retry succeeds → callout disappears
  - [x] 9.4 Add test: toggle failure → item error callout with toggle message → retry succeeds → callout disappears
  - [x] 9.5 Add test: delete failure → item error callout with delete message → retry succeeds → callout disappears
  - [x] 9.6 Tests in `e2e/journey-4-error-recovery.spec.ts`

- [x] Task 10: Definition of Done verification
  - [x] 10.1 `npm run lint` — 0 errors
  - [x] 10.2 `npm run build` — clean build
  - [x] 10.3 `npm run test` — all pass, 100% coverage maintained
  - [x] 10.4 `npm run test:e2e` — all pass (with `required_permissions: ["all"]`)
  - [x] 10.5 `npm run test:lighthouse` — all scores meet thresholds (with `required_permissions: ["all"]`)

## Dev Notes

### Critical: Existing Error State Infrastructure

The `useTodos` hook **already implements** error state management. This story's primary job is **wiring that state to the UI** and creating the `ErrorCallout` component. Do NOT reinvent the error handling logic.

**Already implemented in `use-todos.ts`:**
- `createError: string | null` — set on create failure, cleared on next `addTodo()` call
- `cachedCreateText: string` — stores the text that was being created, populated before API call, cleared on success
- `TodoWithMeta.error?: string` — per-item error, set on toggle/delete failure
- `TodoWithMeta.pendingAction?: "creating" | "toggling" | "deleting"` — per-item pending, cleared before error is set
- `isCreating: boolean` — create in-flight flag

**Already returned but NOT consumed by UI:**
- `createError` — returned from hook but not destructured in `todo-page.tsx`
- `cachedCreateText` — returned from hook but not destructured in `todo-page.tsx`
- `todo.error` — exists on `TodoWithMeta` but not passed from `TodoList` → `TodoItem`

**What needs to be ADDED to the hook:**
- `clearCreateError()` method — allows UI to clear the error when user starts typing
- No other hook changes needed; the error state logic is complete

### ErrorCallout Component Design

**Architecture decision: ErrorCallout placement**

The ErrorCallout must render **inside** the same wrapper element as its parent component, not as a separate sibling in the auto-animated list. This prevents `@formkit/auto-animate` from treating the callout as a new list item with its own enter/exit animation.

- For **create errors**: render the ErrorCallout below the input card in `TodoInput`, outside the animated list entirely
- For **item errors**: render the ErrorCallout below the `TodoItem` card but inside the `<div role="listitem">` wrapper in `TodoList`

**Copy banks:**

```typescript
const ERROR_COPY = {
  create: [
    "That one didn't stick. Give it another go?",
    "Couldn't save that one. Try again?",
    "Something got in the way. One more shot?",
  ],
  toggle: [
    "Hmm, couldn't update that one. Try again?",
    "That change didn't take. Give it another tap?",
    "Couldn't flip that one. Try once more?",
  ],
  delete: [
    "Wouldn't let go of that one. One more try?",
    "That one's holding on. Try again?",
    "Couldn't remove that one. Give it another go?",
  ],
};
```

Use `pickRandom()` from `@/lib/utils` to select from the bank. The copy should feel warm and human — never technical.

**Styling:**
- Small text, `text-error` color
- Subtle fade-in via CSS `opacity` transition (not a CSS animation — use `transition: opacity var(--duration-fast)` with a mounted state)
- No card or border — keep it lightweight. This is a text callout, not a card
- For create errors with cached text, include a tertiary "Restore" link/button

**ARIA:**
- `role="alert"` on the callout container
- Generate a stable `id` (e.g., `error-callout-{todoId}` for items, `error-callout-create` for input)
- The triggering element gets `aria-describedby={calloutId}` when error is present

### Shake + Error Flash Animation

**Add to `globals.css`:**

```css
@keyframes error-shake {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-4px); }
  30% { transform: translateX(4px); }
  45% { transform: translateX(-4px); }
  60% { transform: translateX(4px); }
  75% { transform: translateX(-2px); }
  90% { transform: translateX(2px); }
}
```

**Application approach:**
- Use a `data-error-animate` attribute on the card container
- When the attribute is present, apply: `animation: error-shake var(--duration-shake) ease-in-out`
- After animation completes (~300ms), briefly flash the card border or background with error color, then fade in the callout
- Trigger the animation via a React state toggle: set `data-error-animate="true"`, then remove it after the animation ends (use `onAnimationEnd` event)

**Reduced motion:** The existing `--duration-shake: 0ms` under `prefers-reduced-motion: reduce` makes the shake instantaneous. Also add explicit `animation: none` for the error animation class under the reduced motion media query for safety. The callout should appear immediately without any delay.

### Wiring Through Components

**`todo-page.tsx` changes:**
```
// Destructure additional values from useTodos:
const { createError, cachedCreateText, clearCreateError } = useTodos(initialTodos);

// Pass to TodoInput:
<TodoInput
  createError={createError}
  cachedCreateText={cachedCreateText}
  onClearError={clearCreateError}
  onRestoreText={() => { /* set input text to cachedCreateText */ }}
/>
```

**Challenge: text restore across component boundary**

`TodoInput` manages its own local `text` state. The `cachedCreateText` lives in the `useTodos` hook. To restore text, you need the `TodoInput` component to accept and apply the cached text.

**Recommended approach:** Pass `cachedCreateText` as a prop. When the user clicks "Restore" in the ErrorCallout, `TodoInput` calls `setText(cachedCreateText)`. This keeps text state local to TodoInput. The restore callback simply sets `text` from the cached prop.

**`todo-item.tsx` changes:**
- Add `error?: string` prop
- Determine error type: since `pendingAction` is cleared before `error` is set, the component needs to know which action failed. Two approaches:
  - **Option A (recommended):** Pass both `error` and a new `errorType: "toggle" | "delete"` prop derived in `useTodos` or `TodoList`
  - **Option B:** Store the "last pending action" in a `useRef` inside TodoItem and use it when error appears
- Render `<ErrorCallout type={errorType} />` below the card when `error` is truthy

**`todo-list.tsx` changes:**
- Pass `error={todo.error}` to `<TodoItem />`
- The error type can be derived: if the todo's `completed` state hasn't changed from what the server last returned, it was likely a toggle error; otherwise it's a delete error. However, this is fragile. Better to extend `TodoWithMeta` with `errorType?: "toggle" | "delete"`.

**Recommended: extend `TodoWithMeta`:**
```typescript
export interface TodoWithMeta extends Todo {
  pendingAction?: "creating" | "toggling" | "deleting";
  error?: string;
  errorType?: "toggle" | "delete";
}
```
Set `errorType` in the catch blocks of `toggleTodo` and `deleteTodo` in `use-todos.ts`. This is the cleanest approach — no guessing, no refs.

### Existing Code: Files to Modify

| File | Change |
|------|--------|
| `packages/frontend/src/hooks/use-todos.ts` | Add `clearCreateError()`, add `errorType` to catch blocks, return `clearCreateError` |
| `packages/frontend/src/components/todo-page.tsx` | Destructure and pass `createError`, `cachedCreateText`, `clearCreateError` |
| `packages/frontend/src/components/todo-input.tsx` | Accept error props, render ErrorCallout, trigger shake, handle restore |
| `packages/frontend/src/components/todo-item.tsx` | Accept `error` and `errorType` props, render ErrorCallout, trigger shake |
| `packages/frontend/src/components/todo-list.tsx` | Pass `error` and `errorType` from `todo` to `TodoItem` |
| `packages/frontend/src/app/globals.css` | Add `@keyframes error-shake`, error animation styles |

### Existing Code: Files to Create

| File | Purpose |
|------|---------|
| `packages/frontend/src/components/error-callout.tsx` | ErrorCallout component |
| `packages/frontend/src/components/error-callout.test.tsx` | ErrorCallout unit tests |

### Test Strategy

**Unit tests (`error-callout.test.tsx`):**
- Use `@testing-library/react` with `render()` + `screen` queries
- Test each error type renders the correct copy bank
- Test `role="alert"` is present
- Test `id` attribute is generated
- Test restore button renders conditionally and calls callback
- Do NOT assert on CSS classes — use `data-` attributes and `role`/`aria-` attributes

**Updated unit tests:**
- `todo-input.test.tsx`: test that ErrorCallout renders when `createError` is set, test `aria-describedby` linking, test restore button restores cached text, test error clears on new text input
- `todo-item.test.tsx`: test that ErrorCallout renders when `error` is set, test shake attribute, test `aria-describedby` linking
- `todo-list.test.tsx`: test that `error` and `errorType` are forwarded to `TodoItem`
- `todo-page.test.tsx`: test error-related props are passed through
- `use-todos.test.ts`: test `clearCreateError`, test `errorType` is set on failures

**E2E tests (`journey-4-error-recovery.spec.ts`):**
- Use Playwright `page.route()` to intercept and mock API failures
- POM pattern: add error-related helpers to `todo-page.ts`
- Test create failure → restore → retry → success
- Test toggle failure → retry → success
- Test delete failure → retry → success
- Verify `role="alert"` appears and disappears appropriately

### Performance Considerations

- ErrorCallout is a small text element — negligible impact on bundle or render
- Shake animation uses CSS `transform` (GPU-accelerated) — no layout thrashing
- The `@formkit/auto-animate` library handles list animations; error callouts are inside list items so they don't create separate animation entries
- No new dependencies needed

### Project Structure Notes

- `error-callout.tsx` + `error-callout.test.tsx` go in `packages/frontend/src/components/` (flat directory pattern)
- Named exports only
- Use `@/` import alias for project-relative imports
- Co-located test files with source

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — component structure, pending state pattern, error handling layers
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns] — mutation flow (4-step), error handling layers table, enforcement rules
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#ErrorCallout] — copy banks, fade-in after shake, aria-describedby, role="alert"
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns] — error animation sequence (shake → flash → callout), success animation patterns
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Journey 4] — all error types, retry mechanisms, text recovery
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2] — acceptance criteria, BDD scenarios
- [Source: _bmad-output/implementation-artifacts/3-1-loading-state-skeleton-loader.md] — cancelled story context, ADR on loading.tsx rejection
- [Source: project-context.md#Definition of Done] — lint, build, test, e2e, lighthouse gates, 100% coverage
- [Source: project-context.md#Code Quality Rules] — no CSS class assertions in tests, no suppressHydrationWarning, POM pattern for E2E
- [Source: project-context.md#ADR] — React Suspense streaming rejected, SkeletonLoader not implemented

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking (2026-03-20)

### Debug Log References

### Completion Notes List

- Implemented ErrorCallout as a pure presentational component with personality-driven copy banks, `role="alert"`, and CSS `error-callout-fade-in` animation (no useEffect needed — avoids project lint rule `react-hooks/set-state-in-effect`)
- Used CSS-driven shake animation (`data-error-animate` attribute derived directly from error prop) rather than useState/useEffect, which also avoids the lint rule and simplifies the component
- Next.js App Router injects a `role="alert"` element (`__next-route-announcer__`) — E2E POM uses stable `id`-based locators (`error-callout-create`, `error-callout-{todoId}`) to avoid strict-mode violations
- Extended `TodoWithMeta` with `errorType?: "toggle" | "delete"` set in catch blocks — cleanest way to derive error type after `pendingAction` is cleared
- Text restore for failed creates is handled internally by `TodoInput` using `cachedCreateText` prop with `() => setText(cachedCreateText)` passed as `onRestore` to ErrorCallout
- All 186 unit tests pass, 100% coverage maintained; 21 E2E tests pass; Lighthouse desktop 93, mobile 100

### File List

- packages/frontend/src/components/error-callout.tsx (created)
- packages/frontend/src/components/error-callout.test.tsx (created)
- packages/frontend/src/app/globals.css (modified — added fade-in and error-shake keyframes)
- packages/frontend/src/hooks/use-todos.ts (modified — clearCreateError, errorType on TodoWithMeta)
- packages/frontend/src/components/todo-input.tsx (modified — createError, cachedCreateText, onClearError props)
- packages/frontend/src/components/todo-item.tsx (modified — error, errorType props, ErrorCallout)
- packages/frontend/src/components/todo-list.tsx (modified — pass error/errorType to TodoItem)
- packages/frontend/src/components/todo-page.tsx (modified — pass createError/cachedCreateText/clearCreateError to TodoInput)
- packages/frontend/src/components/todo-input.test.tsx (modified — error callout tests)
- packages/frontend/src/components/todo-item.test.tsx (modified — error callout tests)
- packages/frontend/src/components/todo-list.test.tsx (modified — error/errorType forwarding tests)
- packages/frontend/src/components/todo-page.test.tsx (modified — error callout integration tests)
- packages/frontend/src/hooks/use-todos.test.ts (modified — clearCreateError, errorType tests)
- e2e/journey-4-error-recovery.spec.ts (created)
- e2e/pages/todo-page.ts (modified — createErrorCallout, getItemErrorCallout, restoreText, isCardShaking)

### Change Log

- 2026-03-20: Implemented story 3-2 — error handling for mutations (all 10 tasks)
