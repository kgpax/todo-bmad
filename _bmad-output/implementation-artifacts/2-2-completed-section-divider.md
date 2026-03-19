# Story 2.2: Completed Section Divider

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want completed and active todos clearly separated,
So that I can instantly see what's done versus what's pending at a glance.

## Acceptance Criteria

1. **Given** the TodoList component **When** both active and completed todos exist **Then** a labeled "Completed" divider (horizontal rule with small uppercase label) is displayed between the two sections

2. **Given** no completed todos exist **When** the TodoList renders **Then** the divider is not displayed

3. **Given** all todos are completed **When** the TodoList renders **Then** the divider appears at the top with all items in the completed section

4. **Given** the active items section **When** rendered **Then** items are ordered by creation time newest-first

5. **Given** the completed items section **When** rendered **Then** items are ordered by most-recently-completed-first (by `completedAt` descending)

6. **Given** the divider element **When** inspected **Then** it has `role="separator"` for accessibility

7. **Given** a todo being completed **When** the migration animation plays **Then** the item smoothly migrates down past the divider to join the completed section (ease-in-out, ~400ms)

8. **Given** a todo being uncompleted **When** the migration animation plays **Then** the item smoothly migrates up past the divider to rejoin the active section (ease-in-out, ~400ms)

9. **Given** a user with `prefers-reduced-motion` enabled **When** items move between sections **Then** the position change is instant with no migration animation

10. **Given** the TodoList component **When** unit tests are run **Then** tests pass for divider show/hide logic, section ordering, and migration behavior

11. **Given** E2E test for divider appearance **When** a user completes a todo **Then** the "Completed" divider appears and the item is below it

12. **Given** E2E test for divider removal **When** a user uncompletes all completed todos **Then** the divider disappears

13. **Given** E2E test for ordering **When** multiple todos exist in each section **Then** active items are newest-first and completed items are most-recently-completed-first

## Tasks / Subtasks

- [x] Task 1: Install `@formkit/auto-animate` for FLIP migration animation (AC: #7, #8, #9)
  - [x] 1.1 Install `@formkit/auto-animate` in frontend workspace: `npm install @formkit/auto-animate -w packages/frontend`
  - [x] 1.2 Verify bundle size impact is minimal (~3KB gzipped)

- [x] Task 2: Refactor TodoList to split items into active/completed sections with divider (AC: #1, #2, #3, #4, #5, #6)
  - [x] 2.1 Derive `activeTodos` and `completedTodos` from the `todos` prop inside TodoList
  - [x] 2.2 Active items: filter `!todo.completed`, keep server ordering (already newest-first by `createdAt`)
  - [x] 2.3 Completed items: filter `todo.completed`, sort by `completedAt` descending (most recently completed first)
  - [x] 2.4 Render flat DOM structure: active items → divider → completed items, all as direct children of one animated parent (required for auto-animate FLIP)
  - [x] 2.5 Add divider element: `<div role="separator">` with "Completed" uppercase label, only rendered when `completedTodos.length > 0`
  - [x] 2.6 Style divider: horizontal rule + small uppercase "COMPLETED" label, `text-text-secondary` color, `text-xs tracking-widest uppercase`, centered with lines extending left and right

- [x] Task 3: Integrate `auto-animate` for migration animation (AC: #7, #8, #9)
  - [x] 3.1 Use `useAutoAnimate` hook on the list parent container
  - [x] 3.2 Configure duration to `400` (matching `--duration-slow`) and easing to `ease-in-out`
  - [x] 3.3 Verify `prefers-reduced-motion` is respected automatically (auto-animate default behavior, `disrespectUserMotionPreference` defaults to `false`)
  - [x] 3.4 Ensure all items use stable `key={todo.id}` for auto-animate to track them correctly
  - [x] 3.5 Use a stable key for divider element: `key="completed-divider"`

- [x] Task 4: Update unit tests for TodoList (AC: #10)
  - [x] 4.1 Test: divider renders when both active and completed todos exist
  - [x] 4.2 Test: divider has `role="separator"`
  - [x] 4.3 Test: divider does NOT render when no completed todos exist
  - [x] 4.4 Test: divider renders when ALL todos are completed
  - [x] 4.5 Test: active items ordered newest-first by createdAt
  - [x] 4.6 Test: completed items ordered most-recently-completed-first by completedAt
  - [x] 4.7 Test: existing tests still pass (onToggle passthrough, aria-live, listitem rendering)
  - [x] 4.8 Mock `useAutoAnimate` in tests to avoid JSDOM animation issues (return a simple ref callback)
  - [x] 4.9 Maintain 100% coverage

- [x] Task 5: Update E2E tests — Journey 3 (AC: #11, #12, #13)
  - [x] 5.1 Update POM: add `divider()` locator for `[role="separator"]` element
  - [x] 5.2 Update POM: add `orderedTodoTexts()`, `isTodoAboveDivider()`, `isTodoBelowDivider()` locators to identify items relative to the divider
  - [x] 5.3 E2E test: complete a todo → divider appears → completed item is below divider
  - [x] 5.4 E2E test: uncomplete all completed todos → divider disappears
  - [x] 5.5 E2E test: seed multiple active + completed todos → verify active ordering (newest-first) and completed ordering (most-recently-completed-first)

- [x] Task 6: Verify Definition of Done
  - [x] 6.1 `npm run lint` — 0 errors
  - [x] 6.2 `npm run build` — production build clean
  - [x] 6.3 `npm run test` — all Jest tests pass with 100% coverage across all packages
  - [x] 6.4 `npm run test:e2e` — all E2E tests pass (existing + new Journey 3 tests)
  - [x] 6.5 `npm run test:lighthouse` — Desktop & Mobile: Accessibility: 100, Best Practices: 100, SEO: 100

## Dev Notes

### Architecture Compliance

This is the **second story in Epic 2**. It adds sectioned display and migration animation to the TodoList. Story 2.1 already added the `completedAt` field and toggle flow. This story depends entirely on `completedAt` for completed-section ordering.

**Critical architectural patterns:**

1. **`prefers-reduced-motion`** (Enforcement Rule #8) — auto-animate respects this by default. Verify items reorder instantly with no animation when reduced-motion is active.

2. **ARIA and keyboard** (Enforcement Rule #9) — the divider must have `role="separator"`. The list must retain `role="list"` with `aria-live="polite"`.

3. **Named exports only** (Enforcement Rule #2). Only `page.tsx` and `layout.tsx` use default exports.

4. **`@/` import alias** (Enforcement Rule #10) for all project-relative imports.

5. **Co-located tests** (Enforcement Rule #3) — `todo-list.test.tsx` stays next to `todo-list.tsx`.

6. **No CSS class assertions in tests** — per `project-context.md`, use `data-*` attributes and `role` attributes, never `toHaveClass()` or `className` checks.

[Source: architecture.md#Enforcement Rules, project-context.md#Code Quality Rules]

### Critical: Flat DOM Structure for Auto-Animate

`@formkit/auto-animate` animates direct children of the parent element it's attached to. All items AND the divider MUST be direct children of the single animated `<div role="list">` parent. If items are nested inside `<section>` wrappers, auto-animate cannot track their position changes.

**Required structure:**
```jsx
<div ref={animationParent} role="list" aria-live="polite" aria-label="Todo list" className="flex flex-col gap-3">
  {activeTodos.map(todo => (
    <div key={todo.id} role="listitem">
      <TodoItem ... />
    </div>
  ))}
  {completedTodos.length > 0 && (
    <div key="completed-divider" role="separator" className="...">
      COMPLETED
    </div>
  )}
  {completedTodos.map(todo => (
    <div key={todo.id} role="listitem">
      <TodoItem ... />
    </div>
  ))}
</div>
```

Every `<div key={todo.id}>` uses the todo's stable `id` as key. When a todo is toggled, React re-renders it in a different position (from active group to completed group or vice versa). Auto-animate detects the position change and animates it smoothly.

**The divider also needs a stable key** (`key="completed-divider"`) so auto-animate can animate its appearance/disappearance.

[Source: @formkit/auto-animate documentation, architecture.md#Frontend Architecture]

### Auto-Animate Library Details

**Package:** `@formkit/auto-animate` — ~3KB gzipped, zero dependencies, 200K+ weekly npm downloads.

**React hook:**
```typescript
import { useAutoAnimate } from "@formkit/auto-animate/react";

const [animationParent] = useAutoAnimate({
  duration: 400,   // matches --duration-slow
  easing: "ease-in-out",
});
```

**How it works:** Uses `MutationObserver` to detect DOM changes (additions, removals, reorders) on direct children of the ref'd element, then uses the Web Animations API to perform FLIP transitions.

**`prefers-reduced-motion`:** Respected by default (`disrespectUserMotionPreference` defaults to `false`). When the user has reduced motion enabled, auto-animate skips all animations. No additional code needed.

**Testing:** In Jest/JSDOM, `MutationObserver` and Web Animations API may not be fully available. Mock `useAutoAnimate` to return a simple ref callback:
```typescript
jest.mock("@formkit/auto-animate/react", () => ({
  useAutoAnimate: () => [jest.fn()],
}));
```

[Source: https://auto-animate.formkit.com/, npm @formkit/auto-animate]

### Sorting Logic

**Active items:** Filter `todos.filter(t => !t.completed)`. These arrive from the server already sorted by `createdAt` descending (newest first). No re-sort needed — preserve server order.

**Completed items:** Filter `todos.filter(t => t.completed)`, then sort by `completedAt` descending:
```typescript
const completedTodos = todos
  .filter(t => t.completed)
  .sort((a, b) => {
    const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return bTime - aTime;
  });
```

**Important edge case:** If `completedAt` is `null` for a completed todo (should not happen in practice, since Story 2.1 always sets it), treat it as epoch 0 (sorted to the end).

**Where to sort:** Inside the `TodoList` component. This is a display concern. The `useTodos` hook provides a flat list; `TodoList` decides how to present sections.

[Source: epics.md#Story 2.2, architecture.md#Frontend Architecture]

### Divider Design

The divider follows UX-DR7: "horizontal rule with small uppercase label."

**Visual spec:**
```
────────── COMPLETED ──────────
```

- Horizontal lines extending left and right of the label
- Label: uppercase, small (`text-xs`), `tracking-widest`, `text-text-secondary` color
- Lines: `border-t` with a subtle color (e.g., `border-text-placeholder/30`)
- Vertical margin: use `my-2` for breathing room (16px total)
- The divider is NOT a card — no shadow, no background

**CSS pattern (using Tailwind's flexbox approach):**
```jsx
<div
  key="completed-divider"
  role="separator"
  className="flex items-center gap-3 my-2 px-1"
>
  <div className="flex-1 border-t border-text-placeholder/30" />
  <span className="text-xs tracking-widest uppercase text-text-secondary select-none">
    Completed
  </span>
  <div className="flex-1 border-t border-text-placeholder/30" />
</div>
```

[Source: ux-design-specification.md#TodoList, ux-design-specification.md#Design Direction Decision, epics.md#Story 2.2]

### Divider Visibility Rules

| Condition | Divider Visible | Layout |
|-----------|----------------|--------|
| Only active todos | No | Active items only |
| Both active and completed | Yes | Active items → Divider → Completed items |
| Only completed todos | Yes | Divider at top → Completed items |
| No todos at all | N/A | EmptyState renders (TodoList not shown) |

The divider renders whenever `completedTodos.length > 0`, regardless of whether active todos exist.

[Source: epics.md#Story 2.2 Acceptance Criteria]

### POM Updates for E2E

Add to `e2e/pages/todo-page.ts`:

```typescript
divider() {
  return this.todoList.locator('[role="separator"]');
}
```

For ordering verification, use position-based queries on the list items relative to the divider:

```typescript
async todoTextAboveDivider(): Promise<string[]> {
  // Get all listitem texts that appear before the separator in DOM order
}

async todoTextBelowDivider(): Promise<string[]> {
  // Get all listitem texts that appear after the separator in DOM order
}
```

Alternatively, use `nth` locators on the list items and verify their text matches expected order.

**Seeding completed todos with controlled timestamps:** To test ordering, seed multiple completed todos with staggered completion times. Use the existing `seedCompletedTodos` helper, but note that sequential API calls will have different `completedAt` timestamps (the server sets `completedAt = new Date().toISOString()` on each PATCH). Add a small delay between seeds if timestamps are too close, or seed in a specific order and verify the reverse.

[Source: e2e/pages/todo-page.ts, e2e/helpers.ts, project-context.md#E2E tests must use Page Object Models]

### Previous Story Intelligence

**From Story 2.1 (done):**
- `TodoWithMeta` interface exists in `hooks/use-todos.ts` with `pendingAction` and `error` metadata
- `completedAt` field is on all `Todo` objects (`string | null`)
- TodoItem has `data-completed` attribute — use for E2E assertions
- Shadow tokens use inline `style={{ boxShadow: 'var(--shadow-resting)' }}` — NOT Tailwind classes
- Motion tokens (`--duration-slow: 400ms`, `--ease-in-out`) are defined in `globals.css` and set to `0ms` under `prefers-reduced-motion: reduce`
- Tests mock `@/lib/api` and `@/lib/actions` — same pattern needed
- CORS was fixed to allow PATCH/DELETE methods
- All test mocks include `completedAt: null` (or ISO string for completed todos)
- 100% coverage is enforced — `npm run test` fails if any package drops below 100% on any metric

**From Story 2.1 debug log:**
- E2E `isCompleted` POM method checks `data-completed` attribute, NOT CSS classes (respects project-context.md rule)

**Git branch pattern:** `feat/2-2-completed-section-divider`

[Source: 2-1-complete-uncomplete-todos.md#Dev Notes, 2-1-complete-uncomplete-todos.md#Completion Notes List]

### Test Coverage: 100% Gate

**Updated test file:** `packages/frontend/src/components/todo-list.test.tsx`

New tests needed:
- Divider renders with `role="separator"` when both active and completed todos exist
- Divider text is "Completed" (case-insensitive, as it may be uppercase-styled)
- Divider NOT rendered when all todos are active
- Divider rendered when ALL todos are completed
- Active section items ordered by createdAt descending (newest first)
- Completed section items ordered by completedAt descending (most recently completed first)
- Existing tests continue to pass (onToggle, aria-live, listitem count)

**Mock `useAutoAnimate`:** Auto-animate uses browser APIs not available in JSDOM. Add a module mock:
```typescript
jest.mock("@formkit/auto-animate/react", () => ({
  useAutoAnimate: () => [jest.fn()],
}));
```

Place this at the top of the test file (or in a `jest.setup.ts` if used globally).

**Test mock data should include controlled timestamps:**
```typescript
const activeTodo1 = { id: "a1", text: "Newer active", completed: false, createdAt: "2026-03-19T10:00:00.000Z", completedAt: null };
const activeTodo2 = { id: "a2", text: "Older active", completed: false, createdAt: "2026-03-19T09:00:00.000Z", completedAt: null };
const completedTodo1 = { id: "c1", text: "Recently completed", completed: true, createdAt: "2026-03-19T08:00:00.000Z", completedAt: "2026-03-19T10:30:00.000Z" };
const completedTodo2 = { id: "c2", text: "Earlier completed", completed: true, createdAt: "2026-03-19T07:00:00.000Z", completedAt: "2026-03-19T09:30:00.000Z" };
```

**Ordering assertion approach:** Query all `listitem` elements, extract text content, verify sequence matches expected order. Do NOT assert on CSS classes.

[Source: project-context.md#Definition of Done, project-context.md#Never assert on CSS class names]

### What This Story Does NOT Include

- No delete button (Story 2.3)
- No ErrorCallout component rendering (Story 3.2)
- No entrance/exit animations for adding/removing items (Story 4.3) — auto-animate will handle add/remove animations as a side effect; this is acceptable but not the focus of this story
- No focus management after toggle (Story 4.1) — focus naturally stays on the checkbox
- No skip link (Story 4.1)
- No loading/skeleton state changes (Story 3.1)
- No shake/flash error animation (Story 3.2)

### Anti-Patterns to Avoid

- **Do NOT nest items inside `<section>` wrappers** — all items and the divider MUST be direct children of the auto-animated parent for FLIP to work
- **Do NOT sort active items** — they arrive from the server already sorted by `createdAt` desc; re-sorting is unnecessary and could introduce bugs
- **Do NOT move sorting logic into `useTodos` hook** — section splitting is a display concern that belongs in `TodoList`
- **Do NOT use `framer-motion`** — at ~32KB gzipped it's too heavy for this app's Lighthouse targets; `@formkit/auto-animate` at ~3KB achieves the same FLIP result
- **Do NOT use CSS class assertions in tests** — use `role`, `data-*` attributes, and text content per `project-context.md`
- **Do NOT add `default` exports** — named exports only (Enforcement Rule #2)
- **Do NOT forget to mock `useAutoAnimate`** in Jest tests — JSDOM lacks Web Animations API
- **Do NOT use `suppressHydrationWarning`** — forbidden per `project-context.md`
- **Do NOT install `@formkit/auto-animate` globally** — install in `packages/frontend` only (`-w packages/frontend`)
- **Do NOT add entrance/exit animations as separate acceptance criteria** — auto-animate handles add/remove as a side effect, which is fine, but the tested behavior for this story is section migration only
- **Do NOT forget `required_permissions: ["all"]` for E2E and Lighthouse commands**

### Naming Conventions (Enforced)

| Context | Convention | Example |
|---------|-----------|---------|
| TypeScript files | kebab-case | `todo-list.tsx` |
| React components | PascalCase named export | `export function TodoList()` |
| Functions | camelCase | `activeTodos`, `completedTodos` |
| Imports | `@/` alias | `import { TodoList } from "@/components/todo-list"` |
| Test files | co-located, `.test.tsx` | `todo-list.test.tsx` |
| CSS custom properties | kebab-case with prefix | `--color-text-secondary`, `--duration-slow` |

### Project Structure Notes

**Files CREATED:**
```
(none — this story modifies existing files only)
```

**Files MODIFIED:**
```
packages/frontend/
├── src/components/todo-list.tsx        (refactor: active/completed sections, divider, auto-animate)
├── src/components/todo-list.test.tsx   (add section/divider/ordering tests, mock auto-animate)
├── package.json                        (add @formkit/auto-animate dependency)
e2e/
├── pages/todo-page.ts                  (add divider locator, section query methods)
├── journey-3-review-tidy.test.ts       (add divider appearance/removal/ordering tests)
```

**Files UNCHANGED:**
```
packages/frontend/src/hooks/use-todos.ts          (no changes — sorting is in TodoList)
packages/frontend/src/components/todo-item.tsx     (no changes)
packages/frontend/src/components/todo-page.tsx     (no changes)
packages/frontend/src/components/todo-input.tsx    (no changes)
packages/frontend/src/components/empty-state.tsx   (no changes)
packages/frontend/src/app/page.tsx                 (no changes)
packages/frontend/src/app/globals.css              (no changes — tokens already defined)
packages/backend/                                  (no backend changes)
packages/shared/                                   (no shared changes)
```

### References

- [Source: epics.md#Story 2.2] — acceptance criteria, section ordering, divider behavior
- [Source: architecture.md#Enforcement Rules] — named exports, co-located tests, ARIA, reduced-motion
- [Source: architecture.md#Frontend Architecture] — component structure, useTodos hook
- [Source: architecture.md#Project Structure & Boundaries] — file locations
- [Source: ux-design-specification.md#TodoList] — active/completed sections, divider design
- [Source: ux-design-specification.md#UX-DR7] — labeled divider with role="separator"
- [Source: ux-design-specification.md#Animation Consistency] — duration-slow 400ms, ease-in-out, reduced-motion
- [Source: ux-design-specification.md#Design Direction Decision] — Warm Depth direction, section divider from Direction 6
- [Source: project-context.md] — git branching, definition of done, 100% coverage, no CSS assertions, no suppressHydrationWarning
- [Source: 2-1-complete-uncomplete-todos.md] — completedAt field, TodoWithMeta, testing patterns, debug learnings

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Debug Log References

- auto-animate creates exit-animation clones when elements move across the DOM (e.g. past the divider). These clones are temporarily in the DOM during the 400ms FLIP animation. POM `checkbox()` and `isCompleted()` needed updates to exclude `[data-disabled]` clones to avoid Playwright strict-mode violations.
- `@formkit/auto-animate/react` ships as ESM (`.mjs`) and cannot be parsed by Jest/ts-jest without transformation. Solution: add `jest.mock("@formkit/auto-animate/react", ...)` globally in `jest.setup.ts`.
- Branch coverage for `todo-list.tsx` sort comparator required two tests (null as `a` and null as `b`) to cover both sides of each ternary.

### Completion Notes List

- Installed `@formkit/auto-animate@^0.9.0` in `packages/frontend` (hoisted to root `node_modules`, ~3KB gzipped).
- Refactored `TodoList` to split `todos` into `activeTodos` (filter `!completed`, preserving server order) and `completedTodos` (filter `completed`, sorted by `completedAt` desc). Rendered as flat DOM children of a single `useAutoAnimate`-ref'd parent for FLIP.
- Divider: `<div role="separator">` with Tailwind flex layout, "COMPLETED" uppercase label, only rendered when `completedTodos.length > 0`.
- Auto-animate configured with `duration: 400, easing: "ease-in-out"`. `prefers-reduced-motion` respected by default (no extra code needed).
- Unit tests: 114 passing, 100% coverage on all metrics. Global `jest.mock` for `@formkit/auto-animate/react` added to `jest.setup.ts`. Added 9 new tests for divider visibility, section ordering, and null-`completedAt` edge cases.
- E2E: 15 passing. Added `divider()`, `orderedTodoTexts()`, `isTodoAboveDivider()`, `isTodoBelowDivider()` methods to POM. Updated `checkbox()` to exclude `[data-disabled]` clones. Updated `isCompleted()` to check enabled checkbox state. Added 3 new Journey 3 tests for divider appearance, disappearance, and ordering.
- All DoD gates pass: lint (0 errors), build (clean), test (100% coverage), test:e2e (15 passed), test:lighthouse (Desktop & Mobile: Accessibility 100, Best Practices 100, SEO 100).

### File List

packages/frontend/src/components/todo-list.tsx (modified)
packages/frontend/src/components/todo-list.test.tsx (modified)
packages/frontend/package.json (modified — added @formkit/auto-animate)
packages/frontend/jest.setup.ts (modified — global mock for @formkit/auto-animate/react)
e2e/pages/todo-page.ts (modified — divider locators, clone-safe checkbox/isCompleted)
e2e/journey-3-review-tidy.test.ts (modified — 3 new Journey 3 divider tests)
package-lock.json (modified — lockfile updated by @formkit/auto-animate install)

### Change Log

- 2026-03-19: Implemented story 2-2: active/completed section divider with FLIP animation via @formkit/auto-animate. Updated unit tests (100% coverage) and E2E tests (15 passed).
- 2026-03-19: Code review — removed redundant jest.mock from todo-list.test.tsx (already global in jest.setup.ts), added package-lock.json to File List. 0 HIGH, 0 MEDIUM, 2 LOW issues found and fixed.
