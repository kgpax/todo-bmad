# Story 2.3: Delete Todos

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to delete todos I no longer need,
So that I can keep my list clean and focused on what matters.

## Acceptance Criteria

1. **Given** a TodoItem **When** rendered **Then** a delete button is visible at low opacity (~0.3-0.4)

2. **Given** the delete button on desktop **When** the user hovers over it or focuses it via keyboard **Then** it increases to full opacity and shifts to warm error color

3. **Given** the delete button on mobile **When** rendered without hover **Then** it remains at its resting low-opacity state

4. **Given** the user clicks the delete button **When** the useTodos hook processes the delete **Then** a pending state is set on the item (dim indicator) and a DELETE request is sent

5. **Given** a successful delete **When** the server returns 204 **Then** the item is removed from the list and remaining items close the gap (auto-animate handles this)

6. **Given** a user with `prefers-reduced-motion` enabled **When** a todo is deleted **Then** the item is removed instantly with no slide animation

7. **Given** a successful delete **When** state is updated **Then** `revalidatePath('/')` is triggered via Server Action

8. **Given** all delete-related code **When** unit tests are run **Then** tests pass for delete button rendering, useTodos delete logic, and pending state behavior

9. **Given** E2E test for deleting an active todo **When** a user clicks the delete button on an active item **Then** the item is removed from the list and the gap closes

10. **Given** E2E test for deleting a completed todo **When** a user clicks the delete button on a completed item **Then** the item is removed from the completed section

11. **Given** Journey 3 (Review and Tidy) full E2E test **When** a user completes two items, uncompletes one, and deletes another **Then** the list correctly reflects all state changes with proper section placement

## Tasks / Subtasks

- [x] Task 1: Add `deleteTodo` to API client (AC: #5, #7)
  - [x] 1.1 Add `deleteTodo(id: string): Promise<void>` to `packages/frontend/src/lib/api.ts`
  - [x] 1.2 Uses `CLIENT_API_URL`, method DELETE, returns void on 204
  - [x] 1.3 Throws typed `ApiError` on non-2xx responses (same pattern as `createTodo` / `toggleTodo`)
  - [x] 1.4 Add unit tests to `packages/frontend/src/lib/api.test.ts`

- [x] Task 2: Add `deleteTodo` to `useTodos` hook (AC: #4, #5, #7)
  - [x] 2.1 Add `deleteTodo(id: string)` method to the hook following the 4-step pending state mutation flow
  - [x] 2.2 Step 1: Set `pendingAction: "deleting"` on the item, clear any existing error
  - [x] 2.3 Step 2: Call `deleteTodo(id)` from API client
  - [x] 2.4 Step 3 (success): Remove the item from state, call `revalidateHome()`
  - [x] 2.5 Step 4 (failure): Clear `pendingAction`, set `error` on the item
  - [x] 2.6 Skip if item not found or already has a `pendingAction`
  - [x] 2.7 Return `deleteTodo` from the hook
  - [x] 2.8 Add unit tests to `packages/frontend/src/hooks/use-todos.test.ts`

- [x] Task 3: Add delete button to TodoItem component (AC: #1, #2, #3, #4)
  - [x] 3.1 Add `onDelete: (id: string) => void` prop to `TodoItemProps`
  - [x] 3.2 Render a delete button with an X icon (`lucide-react` X icon) — NOT a trash icon, keep it minimal
  - [x] 3.3 Button always visible at low opacity (~0.3-0.4), styled with `opacity-40` at rest
  - [x] 3.4 Hover/focus: full opacity, shifts to `text-error` color (`hover:opacity-100 hover:text-error focus:opacity-100 focus:text-error`)
  - [x] 3.5 Accessible: `aria-label="Delete: {todo.text}"` (includes todo text per UX-DR6/architecture)
  - [x] 3.6 Disable button when `pendingAction` is set (any pendingAction, not just "deleting")
  - [x] 3.7 When `pendingAction === "deleting"`: dim the entire card (e.g., `opacity-50`)
  - [x] 3.8 Add unit tests to `packages/frontend/src/components/todo-item.test.tsx`

- [x] Task 4: Wire delete through TodoList and TodoPage (AC: #5)
  - [x] 4.1 Add `onDelete: (id: string) => void` prop to `TodoListProps`
  - [x] 4.2 Pass `onDelete` to each `TodoItem`
  - [x] 4.3 In `TodoPage`: destructure `deleteTodo` from `useTodos`, pass as `onDelete` to `TodoList`
  - [x] 4.4 Update unit tests for `TodoList` and `TodoPage` to pass the new prop

- [x] Task 5: Update E2E tests — Journey 3 (AC: #9, #10, #11)
  - [x] 5.1 Update POM: add `deleteButton(todoText: string)` locator — targets the delete button within a listitem containing the text
  - [x] 5.2 Update POM: add `deleteTodo(todoText: string)` action method
  - [x] 5.3 E2E test: delete an active todo → item removed from list
  - [x] 5.4 E2E test: delete a completed todo → item removed from completed section
  - [x] 5.5 E2E test: Journey 3 full flow — complete two items, uncomplete one, delete another → verify list state

- [x] Task 6: Verify Definition of Done
  - [x] 6.1 `npm run lint` — 0 errors
  - [x] 6.2 `npm run build` — production build clean
  - [x] 6.3 `npm run test` — all Jest tests pass with 100% coverage across all packages
  - [x] 6.4 `npm run test:e2e` — all E2E tests pass (existing + new Journey 3 tests)
  - [x] 6.5 `npm run test:lighthouse` — Desktop & Mobile: Accessibility: 100, Best Practices: 100, SEO: 100

## Dev Notes

### Architecture Compliance

This is the **third story in Epic 2**. It adds delete functionality to the frontend. The backend DELETE endpoint already exists and is tested (`packages/backend/src/routes/todos.ts` lines 81-93). This story is frontend-only — no backend changes needed.

**Critical architectural patterns:**

1. **4-step pending state mutation flow** (Architecture: Process Conventions) — every mutation follows: set pendingAction → fire API → success (update state, clear pending, revalidate) / failure (clear pending, set error). The delete flow removes the item from state on success rather than updating it.

2. **`prefers-reduced-motion`** (Enforcement Rule #8) — auto-animate handles exit animations automatically and respects reduced-motion by default. The CSS transition on the delete button's opacity/color change also uses `--duration-fast` which is set to `0ms` under reduced-motion in `globals.css`.

3. **ARIA** (Enforcement Rule #9) — delete button must have `aria-label="Delete: {todo.text}"` per UX-DR6 and architecture doc. Button must be keyboard-accessible (Enter/Space).

4. **Named exports only** (Enforcement Rule #2). No default exports.

5. **`@/` import alias** (Enforcement Rule #10) for all project-relative imports.

6. **Co-located tests** (Enforcement Rule #3).

7. **No CSS class assertions in tests** — per `project-context.md`, use `data-*` attributes and `role` attributes.

[Source: architecture.md#Enforcement Rules, architecture.md#Process Conventions, project-context.md#Code Quality Rules]

### Delete API Function

Add to `packages/frontend/src/lib/api.ts`:

```typescript
export async function deleteTodo(id: string): Promise<void> {
  const response = await fetch(`${CLIENT_API_URL}/api/todos/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      error: "INTERNAL_ERROR",
      message: "Failed to delete todo",
    }));
    throw errorData;
  }
}
```

**Key difference:** Returns `void` (not a Todo), because the backend returns 204 No Content on success. No JSON body to parse on success — only parse on error.

[Source: architecture.md#API & Communication Patterns — DELETE /api/todos/:id → 204 no content]

### useTodos Hook — deleteTodo Method

Add `deleteTodo` to the hook. Import `deleteTodo as apiDeleteTodo` from the API client (alias to avoid name collision with the hook method).

```typescript
import { createTodo, toggleTodo as apiToggleTodo, deleteTodo as apiDeleteTodo } from "@/lib/api";

// Inside useTodos:
async function deleteTodo(id: string) {
  const target = todos.find((t) => t.id === id);
  if (!target || target.pendingAction) return;

  setTodos((prev) =>
    prev.map((t) =>
      t.id === id ? { ...t, pendingAction: "deleting" as const, error: undefined } : t
    )
  );

  try {
    await apiDeleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await revalidateHome();
  } catch (err) {
    const apiError = err as ApiError;
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, pendingAction: undefined, error: apiError?.message || "Failed to delete todo" }
          : t
      )
    );
  }
}

// Return: add deleteTodo to the return object
return { todos, addTodo, toggleTodo, deleteTodo, isCreating, justAdded, placeholderContext, createError, cachedCreateText };
```

**Key differences from toggleTodo:**
- On success: **removes** the item from state (`filter`) instead of updating it (`map`)
- No server response to merge — just remove the item

[Source: architecture.md#Frontend Architecture — useTodos hook, architecture.md#Process Conventions — mutation flow]

### Delete Button in TodoItem

**Visual design (UX-DR6, UX-DR18):**
- Always visible at low opacity (~0.3-0.4)
- On hover/focus: full opacity + warm error color
- Mobile: stays at resting opacity (no hover available)
- Uses `lucide-react` `X` icon (small, minimal — matches the app's clean aesthetic)
- Button styled as "destructive" per UX-DR18 hierarchy

**Implementation:**
```tsx
import { X } from "lucide-react";

// Inside TodoItem, after the text/timestamp area:
<button
  type="button"
  onClick={() => onDelete(todo.id)}
  disabled={!!pendingAction}
  aria-label={`Delete: ${todo.text}`}
  className={[
    "shrink-0 p-1.5 rounded-md transition-[opacity,color] duration-(--duration-fast)",
    "opacity-40 hover:opacity-100 hover:text-error focus:opacity-100 focus:text-error",
    "focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]",
    "disabled:pointer-events-none",
  ].join(" ")}
>
  <X size={16} aria-hidden="true" />
</button>
```

**Deleting pending state:** When `pendingAction === "deleting"`, dim the entire card. Apply `opacity-50` to the card container when deleting. This is different from toggle pending (which only shows checkbox pending indicator).

**Card opacity logic:**
- `todo.completed && pendingAction !== "deleting"` → `opacity-70` (completed styling)
- `pendingAction === "deleting"` → `opacity-50` (deleting dim)
- Default → full opacity

[Source: ux-design-specification.md#TodoItem, ux-design-specification.md#Button Hierarchy, epics.md#Story 2.3]

### TodoList and TodoPage Wiring

**TodoList:** Add `onDelete` prop, pass it to each `TodoItem`:

```tsx
interface TodoListProps {
  todos: TodoWithMeta[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

// In each TodoItem render:
<TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} pendingAction={todo.pendingAction} />
```

**TodoPage:** Destructure `deleteTodo` from `useTodos`, pass to `TodoList`:

```tsx
const { todos, addTodo, toggleTodo, deleteTodo, isCreating, placeholderContext } = useTodos(initialTodos);

<TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
```

[Source: architecture.md#Frontend Architecture — component structure]

### Auto-Animate Exit Animation

Auto-animate (already installed and configured in Story 2.2) automatically handles exit animations when a child element is removed from the DOM. When `deleteTodo` removes an item from state, React removes the `<div key={todo.id}>` from the auto-animated parent, and auto-animate plays a smooth exit animation plus closes the gap.

**Current config:** `duration: 400, easing: "ease-in-out"` (matches `--duration-slow`).

**UX spec says:** delete should be `ease-in, ~250ms`. However, auto-animate applies the same duration/easing to all animation types (add, remove, reorder). Changing it would affect the migration animation from Story 2.2. The 400ms ease-in-out is acceptable as a compromise — the exit still looks smooth and the gap closes gracefully. Do NOT attempt to configure per-animation-type durations.

**`prefers-reduced-motion`:** auto-animate respects this by default — items disappear instantly with no animation.

[Source: 2-2-completed-section-divider.md#Auto-Animate Library Details, ux-design-specification.md#Animation Consistency]

### POM Updates for E2E

Add to `e2e/pages/todo-page.ts`:

```typescript
deleteButton(todoText: string) {
  return this.todoList
    .locator('[role="listitem"]')
    .filter({ hasText: todoText })
    .getByRole("button", { name: new RegExp(`Delete:.*${todoText}`, "i") });
}

async deleteTodo(todoText: string) {
  await this.deleteButton(todoText).click();
}
```

**Note:** The `deleteButton` locator finds the button by accessible name (`aria-label="Delete: {text}"`) within the listitem containing the todo text. This avoids matching auto-animate clones (which have `[data-disabled]`).

**Verification after delete:** Assert the item is no longer in the list:
```typescript
await expect(todo.todoByText("deleted item")).not.toBeVisible();
```

Also verify item count decreases and remaining items are unaffected.

[Source: e2e/pages/todo-page.ts, project-context.md#E2E tests must use Page Object Models]

### Previous Story Intelligence

**From Story 2.2 (done):**
- `@formkit/auto-animate` is installed and configured in `TodoList` with `duration: 400, easing: "ease-in-out"`
- Auto-animate creates exit-animation clones with `[data-disabled]` attribute during FLIP transitions. POM `checkbox()` already excludes these. The new `deleteButton()` POM method should also handle this if needed (use `:not([data-disabled])` or match by accessible name).
- `TodoWithMeta` interface already includes `pendingAction?: "creating" | "toggling" | "deleting"` — the `"deleting"` value is already defined but not yet used
- `TodoList` passes `pendingAction={todo.pendingAction}` to each `TodoItem`
- Mock pattern: `jest.mock("@/lib/api")` and `jest.mock("@/lib/actions")` in hook tests
- `jest.mock("@formkit/auto-animate/react")` is in global `jest.setup.ts`
- 100% coverage enforced — every new branch/function/line must be tested

**From Story 2.1 (done):**
- Shadow tokens use inline `style={{ boxShadow: 'var(--shadow-resting)' }}` — do NOT use Tailwind shadow classes
- `TodoItem` already uses `data-completed` attribute for testing
- Button focus ring pattern: `focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]`

**Git branch pattern:** `feat/2-3-delete-todos`

[Source: 2-2-completed-section-divider.md#Previous Story Intelligence, 2-2-completed-section-divider.md#Completion Notes List]

### Test Coverage: 100% Gate

**Files modified that need test updates:**

| File | Test File | New Tests |
|------|-----------|-----------|
| `lib/api.ts` | `lib/api.test.ts` | `deleteTodo` success (204), error (404, network) |
| `hooks/use-todos.ts` | `hooks/use-todos.test.ts` | `deleteTodo` success flow, error flow, skip if pending, skip if not found |
| `components/todo-item.tsx` | `components/todo-item.test.tsx` | Delete button render, aria-label, opacity, hover state via data-attr, click calls onDelete, disabled when pending, deleting state dims card |
| `components/todo-list.tsx` | `components/todo-list.test.tsx` | onDelete prop passed through |
| `components/todo-page.tsx` | `components/todo-page.test.tsx` | deleteTodo from hook passed to TodoList |

**Testing patterns to follow:**
- Mock `@/lib/api` with `jest.mock("@/lib/api")` in hook/component tests
- Mock `@/lib/actions` with `jest.mock("@/lib/actions")` for `revalidateHome`
- Use `userEvent.setup()` for click interactions
- Assert on `aria-label`, `disabled` attribute, `data-*` attributes — NEVER on CSS classes
- For the delete button: query by role `button` with accessible name matching `Delete: {text}`

**Coverage gap rule:** Gaps must be closed in this story — never deferred.

[Source: project-context.md#Definition of Done, project-context.md#Never assert on CSS class names]

### What This Story Does NOT Include

- No ErrorCallout component rendering on delete failure (Story 3.2) — the `error` state is set on the item but no visible error UI is rendered yet
- No shake/flash error animation on failure (Story 3.2)
- No focus management after delete (Story 4.1) — focus naturally returns to body
- No confirmation dialog — per UX anti-patterns, delete is single-action with no "are you sure?"
- No undo/restore — MVP does not include undo for delete

### Anti-Patterns to Avoid

- **Do NOT add a confirmation dialog** — per UX anti-patterns, no "are you sure?" modals
- **Do NOT parse JSON response body on 204** — DELETE returns no content; only parse on error
- **Do NOT use a trash icon** — keep it minimal with an X icon from lucide-react
- **Do NOT change auto-animate config** — current duration/easing works for all animation types; per-type config is not supported
- **Do NOT use CSS class assertions in tests** — query by role, aria-label, data attributes
- **Do NOT use `suppressHydrationWarning`** — forbidden per project-context.md
- **Do NOT add default exports** — named exports only (Enforcement Rule #2)
- **Do NOT forget `required_permissions: ["all"]` for E2E and Lighthouse commands**
- **Do NOT attempt to test hover visual states in Jest** — JSDOM doesn't support `:hover`. Test the button presence, aria-label, and click behavior only
- **Do NOT add backend changes** — DELETE endpoint already exists and is tested

### Naming Conventions (Enforced)

| Context | Convention | Example |
|---------|-----------|---------|
| TypeScript files | kebab-case | `todo-item.tsx` |
| React components | PascalCase named export | `export function TodoItem()` |
| Functions | camelCase | `deleteTodo`, `onDelete` |
| Props | camelCase | `onDelete` |
| Imports | `@/` alias | `import { deleteTodo } from "@/lib/api"` |
| Test files | co-located, `.test.tsx` | `todo-item.test.tsx` |
| aria-labels | descriptive with context | `Delete: {todo.text}` |

### Project Structure Notes

**Files CREATED:**
```
(none — this story modifies existing files only)
```

**Files MODIFIED:**
```
packages/frontend/
├── src/lib/api.ts                    (add deleteTodo function)
├── src/lib/api.test.ts               (add deleteTodo tests)
├── src/hooks/use-todos.ts            (add deleteTodo method, return it)
├── src/hooks/use-todos.test.ts       (add deleteTodo tests)
├── src/components/todo-item.tsx      (add delete button with X icon, onDelete prop)
├── src/components/todo-item.test.tsx (add delete button tests)
├── src/components/todo-list.tsx      (add onDelete prop, pass to TodoItem)
├── src/components/todo-list.test.tsx (update to pass onDelete prop)
├── src/components/todo-page.tsx      (wire deleteTodo from hook to TodoList)
├── src/components/todo-page.test.tsx (update to verify deleteTodo wiring)
e2e/
├── pages/todo-page.ts               (add deleteButton locator, deleteTodo action)
├── journey-3-review-tidy.test.ts    (add delete E2E tests, full Journey 3 flow)
```

**Files UNCHANGED:**
```
packages/backend/                     (DELETE endpoint already exists)
packages/shared/                      (no shared changes)
packages/frontend/src/app/page.tsx    (no changes)
packages/frontend/src/app/layout.tsx  (no changes)
packages/frontend/src/app/globals.css (no changes — tokens already defined)
packages/frontend/src/components/empty-state.tsx   (no changes)
packages/frontend/src/components/todo-input.tsx    (no changes)
packages/frontend/src/lib/actions.ts  (no changes — revalidateHome already exists)
packages/frontend/src/lib/utils.ts    (no changes)
packages/frontend/jest.setup.ts       (no changes — auto-animate mock already global)
```

### References

- [Source: epics.md#Story 2.3] — acceptance criteria, delete button UX, animation, E2E requirements
- [Source: architecture.md#Enforcement Rules] — named exports, co-located tests, ARIA, reduced-motion, pending state flow
- [Source: architecture.md#Process Conventions] — 4-step mutation flow, loading states
- [Source: architecture.md#API & Communication Patterns] — DELETE /api/todos/:id → 204 no content
- [Source: architecture.md#Frontend Architecture] — useTodos hook, component structure, API client
- [Source: architecture.md#Project Structure & Boundaries] — file locations
- [Source: ux-design-specification.md#TodoItem] — delete button always visible at low opacity, hover/focus behavior
- [Source: ux-design-specification.md#Button Hierarchy] — destructive button style (subtle, low opacity rest, error color hover)
- [Source: ux-design-specification.md#UX-DR6] — delete button visibility and color behavior
- [Source: ux-design-specification.md#UX-DR12] — deletion slide-out + gap close animation
- [Source: ux-design-specification.md#UX-DR18] — button hierarchy (destructive style)
- [Source: ux-design-specification.md#UX-DR20] — pending state UX: deleting = item dim
- [Source: ux-design-specification.md#Animation Consistency] — duration-normal 250ms, ease-in for exits
- [Source: project-context.md] — git branching, definition of done, 100% coverage, no CSS assertions, no suppressHydrationWarning
- [Source: 2-2-completed-section-divider.md] — auto-animate setup, testing patterns, POM clone handling, debug learnings
- [Source: 2-1-complete-uncomplete-todos.md] — TodoWithMeta, pending state pattern, toggle flow, shadow tokens

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking (2026-03-19)

### Debug Log References

No debug issues encountered. Implementation was straightforward following the story's Dev Notes exactly.

### Completion Notes List

- Added `deleteTodo(id: string): Promise<void>` to `api.ts` — returns void on 204, throws `ApiError` on non-2xx (same pattern as `toggleTodo`)
- Added `deleteTodo` method to `useTodos` hook following the 4-step pending state mutation flow: set `pendingAction: "deleting"` → call API → on success filter item from state + revalidate → on failure clear pending + set error
- Added `onDelete` prop to `TodoItem`, rendered X icon button (lucide-react) at `opacity-40` rest state with `hover:opacity-100 hover:text-error` and `focus` equivalents; `aria-label="Delete: {todo.text}"`; disabled when any `pendingAction` is set
- Added `data-pending-deleting="true"` attribute to card when deleting for testability (avoids CSS class assertions)
- Card opacity logic: `opacity-50` when deleting, `opacity-70` when completed (non-deleting), full opacity otherwise
- Wired `onDelete` through `TodoList` and `TodoPage` — both active and completed sections pass `onDelete` to each `TodoItem`
- Added POM methods `deleteButton(todoText)` and `deleteTodo(todoText)` to `e2e/pages/todo-page.ts`
- Added 3 new E2E tests: delete active todo, delete completed todo, Journey 3 full flow (complete two, uncomplete one, delete another)
- All tests pass: 139 Jest unit tests (100% coverage across all packages), 18 E2E tests, Lighthouse Desktop & Mobile: Accessibility 100, Best Practices 100, SEO 100
- Lint: 0 errors; Production build: clean

### File List

packages/frontend/src/lib/api.ts
packages/frontend/src/lib/api.test.ts
packages/frontend/src/hooks/use-todos.ts
packages/frontend/src/hooks/use-todos.test.ts
packages/frontend/src/components/todo-item.tsx
packages/frontend/src/components/todo-item.test.tsx
packages/frontend/src/components/todo-list.tsx
packages/frontend/src/components/todo-list.test.tsx
packages/frontend/src/components/todo-page.tsx
packages/frontend/src/components/todo-page.test.tsx
e2e/pages/todo-page.ts
e2e/journey-3-review-tidy.test.ts

### Change Log

- 2026-03-19: Implemented Story 2.3 — Delete Todos. Added `deleteTodo` to API client, `useTodos` hook, `TodoItem` component (X icon button, opacity states, ARIA), wired through `TodoList`/`TodoPage`, updated POM with `deleteButton`/`deleteTodo` methods, added Journey 3 E2E delete tests (delete active, delete completed, full Journey 3 flow).
- 2026-03-19: **Code Review (AI)** — All 11 ACs verified as implemented. All 30 subtasks confirmed genuinely done. Git reality matches story File List exactly. 0 HIGH, 0 MEDIUM, 1 LOW issue found and fixed: POM `deleteButton()` regex now escapes special characters in `todoText` via `escapeRegExp()` helper. Architecture compliance verified (named exports, co-located tests, 4-step mutation flow, ARIA, reduced-motion, no CSS assertions). Status → done.
