# Story 2.1: Complete & Uncomplete Todos

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to mark todos as complete or restore them to active,
So that I can track my progress and see what's done versus what's pending.

## Acceptance Criteria

1. **Given** an active todo **When** the user clicks the checkbox **Then** the useTodos hook sends a PATCH request with `{ completed: true }` and sets a pending state on the item

2. **Given** a successful completion toggle **When** the server confirms **Then** the TodoItem displays completed styling: strikethrough text, reduced opacity (0.7), lighter text color, and `revalidatePath('/')` is triggered

3. **Given** the checkbox on a completed todo **When** the user clicks it **Then** the todo is restored to active with strikethrough removed, full opacity, and original text color

4. **Given** a completion toggle **When** the animation plays **Then** a strikethrough animates across the text (~400ms, ease-in-out) on complete, and reverses on uncomplete

5. **Given** the checkbox **When** a todo is completed **Then** the checkbox fills with warm amber color with a check animation

6. **Given** a user with `prefers-reduced-motion` enabled **When** completing or uncompleting a todo **Then** state changes are instant (no strikethrough animation, no migration motion) — communicated through opacity and color only

7. **Given** the toggle pending state **When** the API call is in flight **Then** the checkbox shows a pending indicator (pulse/dim)

8. **Given** all updated components and hook **When** unit tests are run **Then** tests pass for TodoItem completed states, checkbox behavior, and useTodos toggle logic

9. **Given** E2E test for complete **When** a user clicks an active todo's checkbox **Then** the todo transitions to completed styling and moves below active items

10. **Given** E2E test for uncomplete **When** a user clicks a completed todo's checkbox **Then** the todo restores to active styling and moves back above completed items

## Tasks / Subtasks

- [x] Task 1: Add `completedAt` column to database (AC: #1, #2, #3)
  - [x] 1.1 Update `packages/backend/src/db/schema.ts` — add `completedAt: text("completed_at")` (nullable)
  - [x] 1.2 Generate migration via `npx drizzle-kit generate` from `packages/backend/`
  - [x] 1.3 Verify migration SQL adds the column correctly (e.g. `ALTER TABLE todos ADD COLUMN completed_at text;`)
  - [x] 1.4 Update PATCH handler in `packages/backend/src/routes/todos.ts` — set `completedAt` to ISO 8601 timestamp when `completed: true`, set to `null` when `completed: false`
  - [x] 1.5 Update PATCH handler response to include `completedAt` in the returned todo
  - [x] 1.6 Update POST handler response to explicitly include `completedAt: null`
  - [x] 1.7 Verify GET handler already returns all columns (Drizzle `select()` returns all fields by default)

- [x] Task 2: Update shared types and schemas (AC: #1)
  - [x] 2.1 Update `packages/shared/src/schemas.ts` — add `completedAt: z.string().datetime().nullable()` to `todoSchema`
  - [x] 2.2 Verify `Todo` type in `packages/shared/src/types.ts` auto-updates from `z.infer` (should now include `completedAt: string | null`)

- [x] Task 3: Add `toggleTodo` to API client (`lib/api.ts`) (AC: #1)
  - [x] 3.1 Add `toggleTodo(id: string, completed: boolean): Promise<Todo>` to `packages/frontend/src/lib/api.ts`
  - [x] 3.2 Use `CLIENT_API_URL` (client-side env var), PATCH to `/api/todos/:id` with `{ completed }` body
  - [x] 3.3 On success (200): return `data.todo` (typed as `Todo`)
  - [x] 3.4 On failure: throw `ApiError` (same pattern as `createTodo`)

- [x] Task 4: Refactor `useTodos` hook for per-item pending state (AC: #1, #2, #3, #7)
  - [x] 4.1 Add per-item metadata: `pendingAction?: 'creating' | 'toggling' | 'deleting'` and `error?: string` per todo item
  - [x] 4.2 Define `TodoWithMeta` type extending `Todo` with pending/error metadata
  - [x] 4.3 Implement `toggleTodo(id: string)` method following 4-step mutation flow
  - [x] 4.4 On toggle: set `pendingAction: 'toggling'` on the item, fire PATCH, on success → update `completed` and `completedAt` in local state + trigger `revalidateHome()`, on failure → clear pending + set error
  - [x] 4.5 Expose `toggleTodo` from the hook return value
  - [x] 4.6 Refactor `addTodo` to use per-item creating state (set `pendingAction: 'creating'` on the new item)

- [x] Task 5: Install Radix Checkbox and hand-build component (AC: #5)
  - [x] 5.1 Install `@radix-ui/react-checkbox` in frontend workspace: `npm install @radix-ui/react-checkbox -w packages/frontend`
  - [x] 5.2 Create `packages/frontend/src/components/ui/checkbox.tsx` — hand-build using `Checkbox.Root` + `Checkbox.Indicator` from Radix, `Check` icon from `lucide-react`, custom Warm Depth styling
  - [x] 5.3 Checked state: warm amber (`var(--color-accent)`) background, white check icon
  - [x] 5.4 Unchecked state: border only, transparent background
  - [x] 5.5 Accessibility: `aria-checked` managed by Radix (built-in), keyboard Space toggles (built-in), accept `aria-label` prop for descriptive labelling

- [x] Task 6: Update TodoItem with checkbox and completed styling (AC: #1, #2, #3, #4, #5, #6, #7)
  - [x] 6.1 Add checkbox (left-aligned) using the custom Checkbox component
  - [x] 6.2 Add `onToggle: (id: string) => void` prop
  - [x] 6.3 Add `pendingAction?: string` prop for pending state visual
  - [x] 6.4 Completed styling: strikethrough text (`line-through`), reduced opacity (0.7), `text-text-secondary` color
  - [x] 6.5 Strikethrough animation: CSS transition on `text-decoration-color` (~400ms, ease-in-out) — animate from transparent to text color
  - [x] 6.6 Pending toggle state: checkbox shows pulse/dim indicator (reduced opacity + pulse animation)
  - [x] 6.7 `prefers-reduced-motion`: instant state changes — no strikethrough animation, just immediate visual switch via opacity and color
  - [x] 6.8 Structure todo item layout: checkbox (left) → text + timestamp (center) → [space for delete button in Story 2.3] (right)

- [x] Task 7: Update TodoList to pass toggle handler (AC: #1)
  - [x] 7.1 Add `onToggle: (id: string) => void` prop to TodoList
  - [x] 7.2 Pass `onToggle` and per-item `pendingAction` to each TodoItem

- [x] Task 8: Update TodoPage to wire toggle through (AC: #1, #2, #3)
  - [x] 8.1 Destructure `toggleTodo` from `useTodos` hook
  - [x] 8.2 Pass `toggleTodo` as `onToggle` to TodoList
  - [x] 8.3 Update TodoList/TodoItem props to include per-item metadata

- [x] Task 9: Update existing unit tests and add new tests (AC: #8)
  - [x] 9.1 Update ALL existing test mocks that create `Todo` objects to include `completedAt: null` (or appropriate value)
  - [x] 9.2 Update `packages/frontend/src/components/todo-item.test.tsx` — test completed styling (strikethrough, reduced opacity), test active styling, test checkbox rendering and toggle callback
  - [x] 9.3 Update `packages/frontend/src/components/todo-list.test.tsx` — test onToggle propagation
  - [x] 9.4 Add tests to `packages/frontend/src/hooks/use-todos.test.ts` — test toggleTodo success flow, toggleTodo failure flow, pending state during toggle, per-item error on toggle failure
  - [x] 9.5 Update `packages/frontend/src/lib/api.test.ts` — add tests for `toggleTodo` (success, error paths)
  - [x] 9.6 Update `packages/frontend/src/components/todo-page.test.tsx` — test toggle handler is wired through
  - [x] 9.7 Update `packages/backend/src/routes/todos.test.ts` — test PATCH returns `completedAt` timestamp when completing, returns `completedAt: null` when uncompleting, test POST returns `completedAt: null`
  - [x] 9.8 Update `packages/shared/` tests if any reference the `todoSchema` shape
  - [x] 9.9 Create `packages/frontend/src/components/ui/checkbox.test.tsx` — test checked/unchecked rendering, toggle callback, aria-checked state
  - [x] 9.10 Ensure 100% coverage across all packages

- [x] Task 10: Write E2E tests (AC: #9, #10)
  - [x] 10.1 Update `e2e/pages/todo-page.ts` POM — add `checkbox(todoText)` locator, `toggleTodo(text)` action, `isCompleted(text)` query
  - [x] 10.2 Create E2E test: complete a todo — seed todo → click checkbox → verify completed styling (strikethrough, reduced opacity)
  - [x] 10.3 Create E2E test: uncomplete a todo — seed completed todo → click checkbox → verify active styling restored
  - [x] 10.4 Add these tests to `e2e/journey-3-review-tidy.test.ts` (the E2E file for Journey 3)

- [x] Task 11: Verify Definition of Done
  - [x] 11.1 `npm run lint` — 0 errors
  - [x] 11.2 `npm run build` — production build clean
  - [x] 11.3 `npm run test` — all Jest tests pass with 100% coverage across all packages
  - [x] 11.4 `npm run test:e2e` — all E2E tests pass (existing Journey 1 + 2 + smoke + new Journey 3 tests)
  - [x] 11.5 `npm run test:lighthouse` — Desktop & Mobile: Accessibility: 100, Best Practices: 100, SEO: 100

## Dev Notes

### Architecture Compliance

This is the **first story in Epic 2** and the first story that modifies the backend since Epic 1. It introduces the complete/uncomplete toggle flow, which is the second of the three CRUD mutation types (create was Story 1.9, delete is Story 2.3). This story establishes per-item pending state in the frontend, replacing the global `isCreating` boolean approach.

**Critical architectural patterns to follow:**

1. **4-step pending state mutation flow** (Enforcement Rule #5 — every mutation must follow this sequence):
   - Step 1: Set `pendingAction: 'toggling'` on the specific todo item in local state
   - Step 2: Fire API call (`toggleTodo(id, !completed)`)
   - Step 3: On success: update the todo's `completed` and `completedAt` in local state, clear `pendingAction`, trigger `revalidateHome()` via Server Action
   - Step 4: On failure: clear `pendingAction`, set `error` on the specific todo item. ErrorCallout rendering is deferred to Story 3.2 — store the error state but do not render a callout UI.

2. **Per-item metadata pattern**: The current hook uses a global `isCreating` boolean. This story must refactor to per-item metadata. Each todo in the local state carries:
   ```typescript
   interface TodoWithMeta extends Todo {
     pendingAction?: 'creating' | 'toggling' | 'deleting';
     error?: string;
   }
   ```
   This approach allows multiple items to have pending states simultaneously (though in practice only one at a time for toggle/delete). The `addTodo` flow should also be updated to use `pendingAction: 'creating'` on the newly created item instead of a global boolean, though the existing global `isCreating` may be kept for input disabling since there's no "item" to attach metadata to during creation.

3. **Server/Client boundary** (same as Story 1.9): `page.tsx` is a server component. All interactive logic lives in the `"use client"` tree below `TodoPage`. Do NOT add `"use client"` to `page.tsx`.

4. **Client-side API URL**: `toggleTodo` runs client-side — use `NEXT_PUBLIC_API_URL` (same `CLIENT_API_URL` constant as `createTodo`).

5. **Named exports only** (Enforcement Rule #2). Only `page.tsx` and `layout.tsx` use default exports.

6. **`@/` import alias** (Enforcement Rule #10) for all project-relative imports.

7. **Shared Zod schemas** (Enforcement Rule #4) — the `updateTodoSchema` from `@todo-bmad/shared` is used by the backend for PATCH validation. The frontend sends `{ completed: boolean }` directly — no client-side Zod validation needed for this toggle (the boolean is deterministic, not user-input).

8. **`prefers-reduced-motion`** (Enforcement Rule #8) — all animations MUST have reduced-motion alternatives.

9. **ARIA attributes and keyboard** (Enforcement Rule #9) — the Radix Checkbox primitive handles `aria-checked`, Space key toggle, and focus management. Ensure the checkbox has a descriptive `aria-label`.

[Source: architecture.md#Enforcement Rules, architecture.md#Process Conventions, architecture.md#Frontend Architecture]

### Critical: `completedAt` Database Field

**The Epic 1 retrospective identified this as a critical risk:** the current `todos` table has no `completedAt` column, but Story 2.2 requires "completed items ordered by most-recently-completed-first." Without a `completedAt` field, there's no way to know when a todo was completed.

**This story MUST add the `completedAt` column** because:
- This is the story that implements the toggle
- The PATCH handler needs to set `completedAt` when completing and clear it when uncompleting
- Story 2.2 depends on this field for ordering

**Implementation:**
- **Schema**: Add `completedAt: text("completed_at")` to the Drizzle schema (nullable, no `.notNull()`)
- **Migration**: Run `npx drizzle-kit generate` from `packages/backend/` to generate the ALTER TABLE migration
- **PATCH handler**: When `completed: true` → set `completedAt = new Date().toISOString()`. When `completed: false` → set `completedAt = null`
- **POST handler**: Set `completedAt: null` explicitly in the creation response
- **Shared schema**: Add `completedAt: z.string().datetime().nullable()` to `todoSchema`
- **Type impact**: `Todo.completedAt` becomes `string | null`. All existing test mocks must be updated.

**Test mocks update required**: Every test file that creates a `Todo` mock object (`todo-item.test.tsx`, `todo-list.test.tsx`, `todo-page.test.tsx`, `use-todos.test.ts`, `api.test.ts`) must add `completedAt: null` (or an ISO string for completed todos). This is a widespread but mechanical change.

[Source: epic-1-retro-2026-03-19.md#Epic 2 Risks And Dependencies, architecture.md#Data Architecture]

### Checkbox Component Design

**No shadcn/ui components exist yet** in `components/ui/`. The existing codebase pattern (TodoInput, EmptyState, TodoItem) is hand-built components with custom styling — not scaffolded via `npx shadcn add`. This story follows the same pattern: install `@radix-ui/react-checkbox` directly and hand-build the component.

**Install the Radix primitive:**
```bash
npm install @radix-ui/react-checkbox -w packages/frontend
```

Create `packages/frontend/src/components/ui/checkbox.tsx` using `@radix-ui/react-checkbox` (`Checkbox.Root`, `Checkbox.Indicator`) with `Check` icon from `lucide-react`. The Radix primitive provides `aria-checked`, `role="checkbox"`, Space key toggle, and focus management out of the box. The visual styling is entirely custom to match the Warm Depth direction.

**Decision rationale:** `npx shadcn add checkbox` was considered but rejected — shadcn is initialized in the project but no components have been added through the CLI. Every existing component is hand-built. Using the CLI now would introduce an inconsistent pattern and potentially generate default styling that conflicts with the Warm Depth design, requiring more rework than building from scratch.

**Custom checkbox visual spec:**
- Size: ~20px × 20px (generous padding around it for 44px+ touch target on the parent card)
- Border radius: `var(--radius-checkbox)` (8px, rounded square)
- Unchecked: `border-2` with `border-text-placeholder` color, transparent background
- Checked: `bg-accent` (warm amber `#b08628`) background, white check icon (use `Check` from `lucide-react`)
- Check animation: scale-in or fade-in of the check icon (~150ms ease-out)
- Pending/toggling state: reduced opacity (0.5) + CSS pulse animation
- Focus: accent-colored ring handled at the card level (not on the checkbox itself — per UX-DR15)
- `prefers-reduced-motion`: check icon appears instantly (no scale/fade animation)

**Accessibility (handled by Radix):**
- `role="checkbox"` (built-in)
- `aria-checked` toggles with state (built-in)
- Space key toggles (built-in)
- Add descriptive `aria-label`: `"Mark [todo text] as complete"` or `"Mark [todo text] as active"`

[Source: ux-design-specification.md#Checkbox, architecture.md#Design System Choice, ux-design-specification.md#Design Direction Decision]

### TodoItem Updated Design

**Current state**: TodoItem renders text + timestamp in a card. No checkbox, no delete button, no completed state.

**After this story**: TodoItem renders checkbox (left) + text + timestamp (center area). Completed state applies visual changes. Delete button is NOT added yet (Story 2.3).

**Layout structure:**
```
┌─────────────────────────────────────────────────┐
│ [☐] Todo text                        DD/MM/YYYY │
│     (checkbox)  (text-text-primary)  (timestamp) │
└─────────────────────────────────────────────────┘
```

**Completed styling (UX-DR6, UX-DR7):**
- Text: `line-through` decoration + `text-text-secondary` color
- Card: `opacity: 0.7`
- Checkbox: warm amber fill with check icon

**Strikethrough animation:**
The simplest approach that works with `prefers-reduced-motion`: use `text-decoration-color` transition.
- Active state: `text-decoration: line-through; text-decoration-color: transparent;`
- Completed state: `text-decoration: line-through; text-decoration-color: currentColor;`
- Transition: `text-decoration-color var(--duration-slow) var(--ease-in-out)` (~400ms)
- When reduced-motion: `--duration-slow` is `0ms` (already set in globals.css), so transition is instant

Alternative approach: CSS clip-path animation from left to right on a `::after` pseudo-element. The `text-decoration-color` approach is simpler and sufficient.

**Pending toggle visual:**
- When `pendingAction === 'toggling'`: apply `opacity-50` and `pointer-events-none` to the checkbox to show it's processing
- Optionally add a CSS pulse animation on the checkbox

**Props update:**
```typescript
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  pendingAction?: 'creating' | 'toggling' | 'deleting';
}
```

[Source: ux-design-specification.md#TodoItem, ux-design-specification.md#Animation Consistency]

### useTodos Hook Refactoring

The most significant code change in this story is refactoring the `useTodos` hook to support per-item pending/error state AND the toggle mutation.

**Current hook state shape:**
```typescript
todos: Todo[]
isCreating: boolean
cachedCreateText: string
justAdded: boolean
createError: string | null
```

**Target hook state shape after this story:**
```typescript
todos: TodoWithMeta[]  // each item has optional pendingAction and error
isCreating: boolean     // KEEP for input disabling (no item to attach to during create)
cachedCreateText: string
justAdded: boolean
createError: string | null
```

Where `TodoWithMeta` is:
```typescript
interface TodoWithMeta extends Todo {
  pendingAction?: 'creating' | 'toggling' | 'deleting';
  error?: string;
}
```

**New `toggleTodo` method:**
```typescript
async function toggleTodo(id: string) {
  const target = todos.find(t => t.id === id);
  if (!target || target.pendingAction) return;

  // Step 1: Set pending
  setTodos(prev => prev.map(t =>
    t.id === id ? { ...t, pendingAction: 'toggling', error: undefined } : t
  ));

  try {
    // Step 2: Fire API
    const updated = await apiToggleTodo(id, !target.completed);

    // Step 3: Success — update local state
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...updated, pendingAction: undefined, error: undefined } : t
    ));
    await revalidateHome();
  } catch (err) {
    // Step 4: Failure — clear pending, set error
    const apiError = err as ApiError;
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...t, pendingAction: undefined, error: apiError?.message || "Failed to update todo" } : t
    ));
  }
}
```

**Important:** The hook should guard against toggling an item that already has a pending action. If `target.pendingAction` is set, silently ignore the toggle.

**Return value update:**
```typescript
return { todos, addTodo, toggleTodo, isCreating, justAdded, placeholderContext, createError, cachedCreateText };
```

[Source: architecture.md#Frontend Architecture, architecture.md#Process Conventions]

### API Client Addition

Add to `packages/frontend/src/lib/api.ts`:

```typescript
export async function toggleTodo(id: string, completed: boolean): Promise<Todo> {
  const response = await fetch(`${CLIENT_API_URL}/api/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      error: "INTERNAL_ERROR",
      message: "Failed to update todo",
    }));
    throw errorData;
  }

  const data = await response.json();
  return data.todo;
}
```

Same error-handling pattern as `createTodo`. Export as named export.

[Source: architecture.md#API & Communication Patterns]

### Backend PATCH Handler Update

The current PATCH handler in `packages/backend/src/routes/todos.ts` (lines 51–78) needs two changes:

1. **Set/clear `completedAt`** based on the toggle value:
   ```typescript
   const completedAt = parsed.completed ? new Date().toISOString() : null;
   app.db.update(todos).set({ completed: parsed.completed, completedAt }).where(eq(todos.id, request.params.id)).run();
   ```

2. **Include `completedAt` in response:**
   ```typescript
   return reply.status(200).send({
     todo: { ...existing, completed: parsed.completed, completedAt },
   });
   ```

3. **POST handler** — add `completedAt: null` to the response:
   ```typescript
   return reply.status(201).send({
     todo: { id, text, completed: false, createdAt, completedAt: null },
   });
   ```

**Migration generation:**
```bash
cd packages/backend
npx drizzle-kit generate
```
This generates a new SQL migration file in `drizzle/`. Verify it contains `ALTER TABLE todos ADD COLUMN completed_at text;`. The migration is applied automatically on backend startup via `runMigrations`.

[Source: architecture.md#Data Architecture, packages/backend/src/routes/todos.ts]

### E2E Test Strategy

Story 2.1 creates the first tests in Journey 3 (Review and Tidy). These tests verify complete/uncomplete toggle behavior. Delete tests are added by Story 2.3.

**POM updates** (`e2e/pages/todo-page.ts`):
- Add `checkbox(todoText: string)` locator — finds the checkbox within the list item containing the given text
- Add `toggleTodo(text: string)` action — clicks the checkbox for the given todo
- Add `isCompleted(text: string)` query — checks whether the todo has completed styling (opacity-70 CSS class)

**Test file**: `e2e/journey-3-review-tidy.test.ts`

Test cases:
1. **Complete a todo**: Seed an active todo → navigate → click checkbox → assert completed styling applied (strikethrough, opacity 0.7)
2. **Uncomplete a todo**: Seed a completed todo via API (POST + PATCH) → navigate → click checkbox → assert active styling restored (no strikethrough, full opacity)
3. **Toggle preserves other items**: Seed 3 todos → complete one → assert the other 2 remain active and unchanged

**How to seed a completed todo for E2E:**
```typescript
const created = await request.post(`${API_URL}/api/todos`, { data: { text: "Done task" } });
const { todo } = await created.json();
await request.patch(`${API_URL}/api/todos/${todo.id}`, { data: { completed: true } });
```

**E2E tests require `required_permissions: ["all"]`.**

[Source: project-context.md#Definition of Done, architecture.md#Structure Conventions]

### Test Coverage: 100% Gate

Every test mock that references the `Todo` type must be updated to include `completedAt`. This affects:

| File | Change |
|------|--------|
| `packages/frontend/src/components/todo-item.test.tsx` | Add `completedAt: null` to mock, add completed state tests |
| `packages/frontend/src/components/todo-list.test.tsx` | Add `completedAt: null` to mocks, add onToggle tests |
| `packages/frontend/src/components/todo-page.test.tsx` | Add `completedAt: null` to mocks, add toggle wiring test |
| `packages/frontend/src/hooks/use-todos.test.ts` | Add `completedAt: null` to mocks, add toggleTodo tests |
| `packages/frontend/src/lib/api.test.ts` | Add `completedAt: null` to mocks, add toggleTodo tests |
| `packages/backend/src/routes/todos.test.ts` | Update PATCH tests to verify `completedAt`, update POST test to verify `completedAt: null` |
| `packages/shared/src/schemas.test.ts` | Update todoSchema tests if they exist |

The `coverageThreshold` in all `jest.config.js` files is set to 100%. `npm run test` will fail if any new code is uncovered.

[Source: project-context.md#Definition of Done]

### Drizzle Migration Notes

**Current migration:** `drizzle/0000_talented_king_bedlam.sql` creates the `todos` table with `id`, `text`, `completed`, `created_at`.

**New migration:** Will be generated by `npx drizzle-kit generate` after updating `schema.ts`. The output SQL should be:
```sql
ALTER TABLE `todos` ADD COLUMN `completed_at` text;
```

The column is nullable (no `NOT NULL` constraint) because existing todos have no completion timestamp, and active todos should have `completedAt = null`.

**Migration auto-apply:** The `runMigrations` function in `src/db/migrate.ts` runs on backend startup. It uses the `drizzle/meta/_journal.json` to track applied migrations.

**In-memory test databases:** The `todos.test.ts` file creates `:memory:` SQLite databases and runs migrations in `beforeEach`. The new migration will automatically apply when tests run — no changes needed to test setup.

[Source: architecture.md#Data Architecture, packages/backend/drizzle.config.ts]

### Previous Story Intelligence

**From Story 1.9 (done):**
- Shadow tokens (`--shadow-resting`, `--shadow-hover`, `--shadow-focus`) are NOT in `@theme inline` — use inline `style={{ boxShadow: 'var(--shadow-resting)' }}` for card shadows
- `pickRandom` utility exists in `lib/utils.ts` — reuse if needed
- `revalidateHome()` Server Action is at `lib/actions.ts` — import and call after successful toggle
- TodoItem currently has hover lift effect via CSS transition — preserve this behavior, don't break it when adding checkbox
- TodoPage destructures from `useTodos` — update destructuring to include `toggleTodo`

**From Story 1.10 (done):**
- 100% coverage is enforced — `npm run test` fails if any package drops below 100% on any metric
- `/* istanbul ignore next */` is only for structurally unreachable branches, documented in `project-context.md`
- `jest.config.js` files have `coverageThreshold.global` set to 100 for all metrics

**From Epic 1 Retro:**
- DoD must be explicitly verified before marking story as done
- Lighthouse is mandatory for frontend stories
- `completedAt` field was identified as a critical prerequisite for Epic 2

**Git branch pattern:** `feat/2-1-complete-uncomplete-todos`

[Source: 1-9-todo-creation-list-display.md, 1-10-100-percent-unit-test-coverage.md, epic-1-retro-2026-03-19.md]

### Project Structure Notes

**Files CREATED:**
```
packages/frontend/src/components/ui/
└── checkbox.tsx                    (NEW — custom Radix checkbox)
└── checkbox.test.tsx               (NEW — checkbox unit tests)
e2e/
└── journey-3-review-tidy.test.ts   (NEW — E2E tests for complete/uncomplete)
packages/backend/drizzle/
└── 0001_simple_gorgon.sql          (NEW — generated migration for completedAt)
```

**Files MODIFIED:**
```
packages/shared/src/
├── schemas.ts                      (add completedAt to todoSchema)
packages/backend/src/
├── db/schema.ts                    (add completedAt column)
├── routes/todos.ts                 (update PATCH + POST handlers)
├── routes/todos.test.ts            (update tests for completedAt)
├── plugins/cors.ts                 (add PATCH/DELETE/PUT to allowed methods)
├── app.test.ts                     (add CORS preflight test for PATCH)
packages/frontend/src/
├── lib/api.ts                      (add toggleTodo function)
├── lib/api.test.ts                 (add toggleTodo tests, update mocks)
├── hooks/use-todos.ts              (add toggleTodo, per-item metadata)
├── hooks/use-todos.test.ts         (add toggle tests, update mocks)
├── components/todo-item.tsx        (add checkbox, completed styling)
├── components/todo-item.test.tsx   (add completed state tests, update mocks)
├── components/todo-list.tsx        (add onToggle prop passthrough)
├── components/todo-list.test.tsx   (add onToggle tests, update mocks)
├── components/todo-page.tsx        (wire toggleTodo through)
├── components/todo-page.test.tsx   (add toggle integration tests, update mocks)
e2e/
├── pages/todo-page.ts              (add checkbox locator and toggle methods)
```

**Files UNCHANGED:**
```
packages/frontend/src/app/page.tsx         (no changes)
packages/frontend/src/app/layout.tsx       (no changes)
packages/frontend/src/app/globals.css      (no changes — motion tokens already defined)
packages/frontend/src/lib/actions.ts       (no changes)
packages/frontend/src/lib/utils.ts         (no changes)
packages/frontend/src/components/empty-state.tsx (no changes)
packages/frontend/src/components/todo-input.tsx  (no changes)
packages/frontend/src/config/placeholders.ts     (no changes)
```

### Git Intelligence

Branch to create: `feat/2-1-complete-uncomplete-todos`

Recent commit pattern: `Feat/1 9 todo creation list display (#9)` — each story merged via PR from `feat/{story-key}` branch.

**CRITICAL:** Create and checkout the feature branch BEFORE writing any code:
```bash
git checkout main && git pull
git checkout -b feat/2-1-complete-uncomplete-todos
```

### Anti-Patterns to Avoid

- **Do NOT use optimistic updates** — the architecture specifies pending state with server-confirmed updates, NOT optimistic UI with rollback
- **Do NOT add the completed section divider** — that's Story 2.2
- **Do NOT add delete button** — that's Story 2.3
- **Do NOT add migration animations** — items moving between sections is Story 2.2
- **Do NOT render ErrorCallout UI** — that's Story 3.2; just store error state in the hook
- **Do NOT add entrance/exit animations** — that's Story 4.3
- **Do NOT forget to update ALL test mocks** with `completedAt` — the `Todo` type change is widespread
- **Do NOT use `API_URL` for client-side calls** — use `NEXT_PUBLIC_API_URL` (`CLIENT_API_URL`)
- **Do NOT skip the Lighthouse audit** — required per project-context.md for frontend stories
- **Do NOT forget `required_permissions: ["all"]` for E2E tests**
- **Do NOT write ad-hoc validation** — use schemas from `@todo-bmad/shared`
- **Do NOT add default exports** except where Next.js requires them
- **Do NOT use `npx shadcn add checkbox`** — hand-build from `@radix-ui/react-checkbox` to match the codebase pattern (see Checkbox Component Design)
- **Do NOT install `@radix-ui/react-checkbox` globally** — install in `packages/frontend` only (`npm install @radix-ui/react-checkbox -w packages/frontend`)
- **Do NOT use a Tailwind config file** — Tailwind v4 uses CSS-based configuration

### What This Story Does NOT Include

- No completed section divider (Story 2.2) — all todos remain in a single unsectioned list
- No delete button (Story 2.3)
- No ErrorCallout component rendering (Story 3.2) — error state stored in hook metadata but not rendered as visible UI
- No migration/reorder animation between sections (Story 2.2)
- No entrance/exit animations (Story 4.3)
- No shake/flash error animation (Story 3.2)
- No focus management after toggle (Story 4.1) — focus naturally stays on the checkbox
- No skip link (Story 4.1)
- No ordering change — all items remain ordered by `createdAt` descending in a single list. Section ordering (active above completed) is Story 2.2.

### Naming Conventions (Enforced)

| Context | Convention | Example |
|---------|-----------|---------|
| TypeScript files | kebab-case | `checkbox.tsx`, `todo-item.tsx` |
| React components | PascalCase named export | `export function Checkbox()`, `export function TodoItem()` |
| Hooks | camelCase with use prefix | `export function useTodos()` |
| Functions | camelCase | `toggleTodo`, `addTodo` |
| Types/interfaces | PascalCase | `TodoWithMeta`, `TodoItemProps` |
| Imports | `@/` alias | `import { Checkbox } from "@/components/ui/checkbox"` |
| Test files | co-located, `.test.tsx` | `checkbox.test.tsx`, `todo-item.test.tsx` |
| CSS custom properties | kebab-case with prefix | `--color-accent`, `--radius-checkbox` |

### References

- [Source: architecture.md#Frontend Architecture] — server/client boundary, component structure, useTodos hook, ISR strategy
- [Source: architecture.md#API & Communication Patterns] — PATCH endpoint contract, error format
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — naming, enforcement rules, 4-step mutation flow
- [Source: architecture.md#Data Architecture] — todos table schema, completedAt field need
- [Source: architecture.md#Project Structure & Boundaries] — file locations, component boundaries
- [Source: ux-design-specification.md#TodoItem] — card design, completed styling, checkbox spec
- [Source: ux-design-specification.md#Checkbox] — rounded square, warm amber, check animation
- [Source: ux-design-specification.md#Animation Consistency] — motion tokens, prefers-reduced-motion
- [Source: ux-design-specification.md#UX Consistency Patterns] — feedback patterns for toggle
- [Source: epics.md#Story 2.1] — acceptance criteria, E2E tests
- [Source: epics.md#Story 2.2] — completedAt ordering dependency
- [Source: project-context.md] — git branching, definition of done, 100% coverage, Lighthouse requirements
- [Source: epic-1-retro-2026-03-19.md] — completedAt risk, DoD enforcement, verification discipline

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking (2026-03-19)

### Debug Log References

- CORS fix: `@fastify/cors` was configured without explicit `methods`, defaulting to GET/HEAD/POST only. PATCH requests from the browser were silently rejected after the OPTIONS preflight. Fixed by adding `methods: ["GET", "HEAD", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]` to the cors plugin config.
- `isCompleted` POM method: initial implementation used computed `opacity` style which was mid-CSS-transition (150ms fade). Fixed to check for the `opacity-70` Tailwind class directly.

### Completion Notes List

- Added `completedAt: text("completed_at")` (nullable) to Drizzle schema and generated migration `drizzle/0001_simple_gorgon.sql`
- Updated PATCH handler to set/clear `completedAt` and include it in response; updated POST handler to include `completedAt: null`
- Added `completedAt: z.string().datetime().nullable()` to `todoSchema` in shared package
- Added `toggleTodo(id, completed)` to `api.ts` (same error-handling pattern as `createTodo`)
- Refactored `useTodos` hook: introduced `TodoWithMeta` interface, added `toggleTodo` method with 4-step mutation flow, per-item pending/error state
- Installed `@radix-ui/react-checkbox` and `@testing-library/user-event` in frontend workspace
- Created hand-built `Checkbox` component using Radix primitives with Warm Depth styling (amber accent, rounded square)
- Updated `TodoItem` with checkbox (left), completed styling (line-through text-decoration-color transition, opacity-70 card), pending state (pulse/dim)
- Updated `TodoList` to accept `TodoWithMeta[]` and `onToggle` prop
- Updated `TodoPage` to wire `toggleTodo` through from hook to list
- Updated all test mocks with `completedAt: null/value`; added 42 new backend tests + 108 frontend tests; all at 100% coverage
- Added Journey 3 E2E tests (3 tests for complete/uncomplete/isolation) with POM updates
- Fixed CORS to allow PATCH/DELETE/PUT methods
- All DoD gates pass: lint (0 errors), build (clean), tests (108 pass, 100% coverage), e2e (12 pass), Lighthouse (100/100/100 desktop+mobile)

### File List

**Created:**
- `packages/frontend/src/components/ui/checkbox.tsx`
- `packages/frontend/src/components/ui/checkbox.test.tsx`
- `e2e/journey-3-review-tidy.test.ts`
- `packages/backend/drizzle/0001_simple_gorgon.sql`

**Modified:**
- `packages/shared/src/schemas.ts`
- `packages/shared/src/schemas.test.ts`
- `packages/backend/src/db/schema.ts`
- `packages/backend/src/routes/todos.ts`
- `packages/backend/src/routes/todos.test.ts`
- `packages/backend/src/plugins/cors.ts`
- `packages/backend/src/app.test.ts`
- `packages/frontend/src/lib/api.ts`
- `packages/frontend/src/lib/api.test.ts`
- `packages/frontend/src/hooks/use-todos.ts`
- `packages/frontend/src/hooks/use-todos.test.ts`
- `packages/frontend/src/components/todo-item.tsx`
- `packages/frontend/src/components/todo-item.test.tsx`
- `packages/frontend/src/components/todo-list.tsx`
- `packages/frontend/src/components/todo-list.test.tsx`
- `packages/frontend/src/components/todo-page.tsx`
- `packages/frontend/src/components/todo-page.test.tsx`
- `e2e/pages/todo-page.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/epics.md`
- `project-context.md`
- `packages/frontend/package.json`

### Change Log

- 2026-03-19: Implemented Story 2.1 — complete/uncomplete todos with checkbox UI, completedAt field, per-item pending state, CORS fix for PATCH method
- 2026-03-19: Code review fixes — added forceMount to Checkbox Indicator for check-in animation (M1), documented missing files in File List (M2), removed redundant inline style on Checkbox (L1), fixed E2E seedCompletedTodo typing and return value (L2)
