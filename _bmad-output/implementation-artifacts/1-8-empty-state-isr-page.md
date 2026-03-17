# Story 1.8: Empty State & ISR Page

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see a warm, inviting message when I have no todos,
So that I understand the app's purpose and feel invited to start.

## Acceptance Criteria

1. **Given** the page.tsx server component **When** it fetches from the backend API and receives an empty todo list **Then** the EmptyState component is rendered

2. **Given** the EmptyState component **When** displayed **Then** it shows personality-driven copy (warm, inviting message) inside a centered card matching the Warm Depth visual direction

3. **Given** ISR is configured **When** the page is requested **Then** it is server-rendered with todo data fetched from the backend API at request time

4. **Given** the "Hello World" placeholder from Story 1.7 **When** this story is complete **Then** it is fully replaced by the ISR page rendering the EmptyState within the responsive layout

5. **Given** the EmptyState component **When** inspected by a screen reader **Then** it has `role="status"` for proper announcement

6. **Given** the EmptyState component **When** unit tests are run **Then** all tests pass verifying render output and accessibility attributes

## Tasks / Subtasks

- [x] Task 1: Create the API client (`lib/api.ts`) (AC: #1, #3)
  - [x] 1.1 Create `packages/frontend/src/lib/api.ts` with a `fetchTodos()` function
  - [x] 1.2 `fetchTodos()` calls `GET ${API_URL}/api/todos` server-side (uses `API_URL` env var, NOT `NEXT_PUBLIC_API_URL`)
  - [x] 1.3 Returns `Todo[]` on success, returns empty array on fetch failure (graceful degradation)
  - [x] 1.4 Import `Todo` type from `@todo-bmad/shared`

- [x] Task 2: Create the Server Action for revalidation (`lib/actions.ts`) (AC: #3)
  - [x] 2.1 Create `packages/frontend/src/lib/actions.ts` with `"use server"` directive
  - [x] 2.2 Export `revalidateHome()` function that calls `revalidatePath("/")`

- [x] Task 3: Create the EmptyState component (`components/empty-state.tsx`) (AC: #2, #5)
  - [x] 3.1 Create `packages/frontend/src/components/empty-state.tsx`
  - [x] 3.2 Render a centered card with `role="status"` using design tokens (surface color, resting shadow, radius-lg)
  - [x] 3.3 Display personality-driven copy — randomly selected from a bank of warm messages
  - [x] 3.4 Style: centered text, secondary text color, warm tone, card with `--shadow-resting` and `--radius-lg`

- [x] Task 4: Create the TodoPage client component (`components/todo-page.tsx`) (AC: #1, #4)
  - [x] 4.1 Create `packages/frontend/src/components/todo-page.tsx` with `"use client"` directive
  - [x] 4.2 Accept `initialTodos: Todo[]` prop from the server component
  - [x] 4.3 If `initialTodos` is empty, render `<EmptyState />`
  - [x] 4.4 If `initialTodos` has items, render a simple list for now (placeholder for Story 1.9)
  - [x] 4.5 Wrap content in the responsive column container (`max-w-[640px] mx-auto px-4 md:px-6`)

- [x] Task 5: Convert `page.tsx` to ISR server component with data fetching (AC: #1, #3, #4)
  - [x] 5.1 Update `packages/frontend/src/app/page.tsx` to be an `async` server component
  - [x] 5.2 Call `fetchTodos()` at the top of the component
  - [x] 5.3 Pass the result to `<TodoPage initialTodos={todos} />`
  - [x] 5.4 Remove "Hello World" text — the page now renders TodoPage
  - [x] 5.5 Keep the `<main>` semantic landmark wrapping content
  - [x] 5.6 Add `export const revalidate = false` to opt into on-demand ISR (no time-based revalidation)

- [x] Task 6: Update E2E test to match new page content (AC: #4)
  - [x] 6.1 Update `e2e/smoke.test.ts` — replace the "Hello World" assertion with an assertion for the EmptyState content (the empty state message text)
  - [x] 6.2 The E2E test should verify the page loads with HTTP 200 and displays the empty state when no todos exist

- [x] Task 7: Write unit tests for EmptyState (AC: #6)
  - [x] 7.1 Create `packages/frontend/src/components/empty-state.test.tsx`
  - [x] 7.2 Test: renders a card with personality-driven copy text
  - [x] 7.3 Test: has `role="status"` attribute
  - [x] 7.4 Test: renders within expected HTML structure

- [x] Task 8: Verify all checks pass
  - [x] 8.1 Run `npm run dev` — dev server starts cleanly
  - [x] 8.2 Run `npm run test` — all tests pass (backend + new frontend tests)
  - [x] 8.3 Run `npm run build` — production build completes without errors
  - [x] 8.4 Run `npm run test:e2e` — updated E2E tests pass (with `required_permissions: ["all"]`)
  - [x] 8.5 Run Lighthouse audit via Chrome DevTools MCP — Accessibility: 100, Best Practices: 100, SEO: 100

## Dev Notes

### Architecture Compliance

This is the **second frontend story** (after 1.7). It introduces the ISR data-fetching pattern, the first React component (`EmptyState`), and the server/client boundary that all subsequent stories will build upon.

**Critical architectural patterns to follow:**

1. **Server/Client boundary:** `page.tsx` is a server component that fetches data. `TodoPage` is a `"use client"` component that receives data as props. This is the foundational pattern for the entire app.

2. **ISR rendering strategy:** The page is server-rendered with real data fetched from the backend at request time. Use `export const revalidate = false` in `page.tsx` to disable time-based revalidation — revalidation is triggered on-demand via `revalidatePath('/')` after mutations (Story 1.9+).

3. **API_URL vs NEXT_PUBLIC_API_URL:** Server components use `API_URL` (server-only, not exposed to browser). Client components use `NEXT_PUBLIC_API_URL`. The `fetchTodos()` in `lib/api.ts` is called from the server component, so use `process.env.API_URL`.

4. **Graceful degradation on fetch failure:** If the backend is unavailable during server render, `fetchTodos()` MUST catch the error and return an empty array (or an error indicator). The page renders the EmptyState or an appropriate fallback — NEVER crash or show a blank page. This aligns with FR15 (app shell renders without API).

5. **Named exports only** (Enforcement Rule #2) — except `page.tsx` which requires `export default` per Next.js convention. `TodoPage`, `EmptyState`, and all lib functions use named exports.

6. **`@/` import alias** (Enforcement Rule #10) — all project-relative imports use `@/components/...`, `@/lib/...` etc.

[Source: architecture.md#Frontend Architecture, architecture.md#Enforcement Rules]

### EmptyState Component Design

**Visual treatment (Warm Depth direction):**
- Centered card with `--shadow-resting` shadow and `--radius-lg` border radius
- `--color-surface` background (white card on warm off-white background)
- Personality-driven copy in `--color-text-secondary` for a warm, understated tone
- `role="status"` for screen reader announcement
- No icon or illustration — the copy does the work

**Copy bank (pick one randomly per render):**
- "Your list is empty. That's either very zen, or you haven't started yet."
- "Nothing here yet. The input above is waiting."
- "A blank slate — the best kind."
- "All clear. Time to think of something new."
- "No todos? Sounds peaceful."

These messages are warm, slightly playful, and avoid instructional language. The input field (Story 1.9) will sit above this component and be the primary action invitation.

**Styling approach:** Use Tailwind utility classes with design token CSS custom properties. Apply the card pattern: surface background, resting shadow, rounded corners.

```
<div role="status" className="bg-surface shadow-resting rounded-lg p-6 text-center">
  <p className="text-text-secondary">{message}</p>
</div>
```

Note: `bg-surface`, `shadow-resting`, `text-text-secondary` should map to the Tailwind theme tokens registered in `@theme inline`. Verify exact utility class names match what was set up in globals.css in Story 1.7.

[Source: ux-design-specification.md#EmptyState component, epics.md#Story 1.8]

### Server Component Data Fetching Pattern

`page.tsx` is an async server component:

```typescript
import { fetchTodos } from "@/lib/api";
import { TodoPage } from "@/components/todo-page";

export const revalidate = false;

export default async function Home() {
  const todos = await fetchTodos();
  return (
    <main className="min-h-screen px-4 md:px-6">
      <div className="max-w-[640px] mx-auto">
        <TodoPage initialTodos={todos} />
      </div>
    </main>
  );
}
```

The `TodoPage` client component receives the server-fetched data as props and initializes its internal state from them (the `useTodos` hook in Story 1.9 will do this).

[Source: architecture.md#Frontend Architecture, architecture.md#Data Flow]

### API Client Pattern

`lib/api.ts` is a typed fetch wrapper. For this story, only `fetchTodos()` is needed:

```typescript
import type { Todo } from "@todo-bmad/shared";

const API_URL = process.env.API_URL || "http://localhost:3001";

export async function fetchTodos(): Promise<Todo[]> {
  try {
    const response = await fetch(`${API_URL}/api/todos`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.todos;
  } catch {
    return [];
  }
}
```

Key decisions:
- `cache: "no-store"` ensures each request gets fresh data (ISR caching is handled at the page level via `revalidate`, not at the fetch level)
- Returns `[]` on any failure — graceful degradation, never throws
- Uses `API_URL` (server-only env var) not `NEXT_PUBLIC_API_URL`

[Source: architecture.md#API & Communication Patterns, architecture.md#Frontend Architecture]

### Server Actions Setup

`lib/actions.ts` sets up the revalidation Server Action. This story creates it but it won't be actively called until Story 1.9 when mutations are implemented:

```typescript
"use server";

import { revalidatePath } from "next/cache";

export async function revalidateHome() {
  revalidatePath("/");
}
```

[Source: architecture.md#Frontend Architecture, architecture.md#Data Flow]

### E2E Test Update

The existing E2E test checks for "Hello World". This text is being removed. Update the smoke test to check for the EmptyState content instead.

The E2E test runs against both frontend AND backend. When the backend has no seeded data, the API returns an empty todo list, so the EmptyState should display.

**Important:** The E2E test runs with `required_permissions: ["all"]` per `project-context.md`. The backend must be running for the E2E test to pass (the frontend fetches from the backend during server render).

[Source: project-context.md#Definition of Done]

### Unit Testing Pattern

Tests are co-located with source files. For the EmptyState:
- File: `packages/frontend/src/components/empty-state.test.tsx`
- Framework: Jest with jsdom environment (configured in `jest.config.js`)
- Uses `@testing-library/react` — **NOTE: `@testing-library/react` and `@testing-library/jest-dom` may need to be installed as dev dependencies.** Check if they exist before installing.

Test coverage:
1. Renders without crashing
2. Contains `role="status"` attribute
3. Displays text content (from the copy bank)
4. Renders as a card with expected structure

[Source: architecture.md#Structure Conventions]

### Environment Configuration

The frontend needs `.env.local` with:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
API_URL=http://localhost:3001
REVALIDATION_SECRET=your-secret-here
```

A `.env.example` already exists at `packages/frontend/.env.example` with these values. Ensure `.env.local` exists (or the dev creates it) before running.

[Source: architecture.md#Infrastructure & Deployment]

### What This Story Does NOT Include

- No `TodoInput`, `TodoItem`, or `TodoList` components — those are Story 1.9
- No `useTodos` hook — Story 1.9
- No mutation logic (create, toggle, delete) — Story 1.9+
- No SkeletonLoader or LoadError — Story 3.1 and 3.3
- No ErrorCallout — Story 3.2
- No animation implementations
- No placeholder banks for the input — Story 1.9
- No displaying todos in a list — Story 1.9 (TodoPage shows EmptyState or a minimal placeholder list)

### Anti-Patterns to Avoid

- **Do NOT use `NEXT_PUBLIC_API_URL` in server components** — use `API_URL` for server-side fetches
- **Do NOT let `fetchTodos()` throw on failure** — always return `[]` on error for graceful degradation
- **Do NOT fetch data in the client component** — `page.tsx` (server component) fetches and passes data as props
- **Do NOT use `useEffect` for initial data loading** — the server component handles this via ISR
- **Do NOT add `"use client"` to `page.tsx`** — it MUST remain a server component
- **Do NOT create a `tailwind.config.ts`** — Tailwind v4 uses CSS-based configuration
- **Do NOT add default exports** except for `page.tsx` (Next.js requirement)
- **Do NOT install packages without checking if they already exist** in `package.json`
- **Do NOT modify backend files** — this is a frontend-only story
- **Do NOT add the `useTodos` hook** — that's Story 1.9
- **Do NOT skip the Lighthouse audit** — required per project-context.md for frontend stories
- **Do NOT forget `required_permissions: ["all"]` for E2E tests** — they fail in sandbox

### Previous Story Intelligence

**From Story 1.7 (done):**
- Frontend foundation is in place: Outfit font, design tokens in globals.css, responsive centered column layout
- Current `page.tsx` renders plain "Hello World" text inside `<main className="min-h-screen px-4 md:px-6"><div className="max-w-[640px] mx-auto">Hello World</div></main>`
- Current `layout.tsx` has Outfit font configured, metadata set, semantic HTML
- Tailwind v4 `@theme inline` registers all design tokens as utility classes: `bg-surface`, `text-text-primary`, `text-text-secondary`, `text-text-placeholder`, `bg-background`, `text-accent`, `text-error`, `text-success`
- Shadow tokens in `:root` but NOT in `@theme inline` — may need `shadow-resting` as a Tailwind class or use inline style `style={{ boxShadow: 'var(--shadow-resting)' }}`
- Accent color corrected to `#b08628` for WCAG compliance
- Secondary text color corrected to `#736e6a` for WCAG compliance
- E2E test file is `e2e/smoke.test.ts` (NOT `e2e/app.spec.ts` as mentioned in the 1.7 story)
- 37 backend tests pass, 2 E2E tests pass, 0 frontend tests exist yet

**From Stories 1.1–1.6 (done):**
- All backend CRUD endpoints implemented and tested (GET, POST, PATCH, DELETE /api/todos)
- Shared package has Zod schemas, TypeScript types, and constants
- Backend response format: `{ todos: Todo[] }` for list, `{ todo: Todo }` for single item
- Backend runs on port 3001 by default

### Git Intelligence

Branch to create: `feat/1-8-empty-state-isr-page`

Recent commit pattern: Each story merged via PR from `feat/{story-key}` branch. Follow the same pattern per `project-context.md`.

### Naming Conventions (Enforced)

| Context | Convention | Example |
|---------|-----------|---------|
| TypeScript files | kebab-case | `empty-state.tsx`, `todo-page.tsx`, `api.ts` |
| React components | PascalCase named export | `export function EmptyState()` |
| Functions | camelCase | `fetchTodos`, `revalidateHome` |
| Imports | `@/` alias | `import { EmptyState } from "@/components/empty-state"` |
| Test files | co-located, `.test.tsx` | `empty-state.test.tsx` |

### Project Structure Notes

**Files to CREATE:**
```
packages/frontend/src/
├── components/
│   ├── empty-state.tsx          (NEW — EmptyState component)
│   ├── empty-state.test.tsx     (NEW — EmptyState unit tests)
│   └── todo-page.tsx            (NEW — client component orchestrator)
├── lib/
│   ├── api.ts                   (NEW — typed fetch wrapper)
│   └── actions.ts               (NEW — Server Actions for revalidation)
```

**Files to MODIFY:**
```
packages/frontend/src/app/
│   └── page.tsx                 (MODIFIED — async server component with data fetching)
e2e/
│   └── smoke.test.ts            (MODIFIED — updated assertions for EmptyState)
```

**Files UNCHANGED:**
```
packages/frontend/src/app/layout.tsx      (no changes)
packages/frontend/src/app/globals.css     (no changes)
packages/frontend/src/lib/utils.ts        (no changes)
```

### References

- [Source: architecture.md#Frontend Architecture] — server/client boundary, component structure, ISR strategy
- [Source: architecture.md#API & Communication Patterns] — endpoint contracts, API client pattern
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — naming, enforcement rules
- [Source: architecture.md#Data Flow] — ISR page load flow, revalidation
- [Source: ux-design-specification.md#EmptyState component] — visual treatment, copy bank, accessibility
- [Source: ux-design-specification.md#Design Direction Decision] — Warm Depth card pattern
- [Source: epics.md#Story 1.8] — acceptance criteria
- [Source: project-context.md] — git branching, definition of done, Lighthouse requirements, E2E sandbox rules

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Debug Log References

- Hydration mismatch: `Math.random()` in `EmptyState` produces different values on SSR vs client. Resolved by moving message selection into the server component (`page.tsx`) using the exported `EMPTY_STATE_MESSAGES` array, then passing the chosen message as a prop through `TodoPage` → `EmptyState`. SSR and hydration now use the identical message; a new random message is picked on each page load or ISR revalidation (e.g., after `revalidateHome()` fires). Lighthouse Best Practices confirmed at 100.
- Build error: `todo.title` used in `TodoPage` placeholder list; the `Todo` type uses `todo.text`. Fixed immediately.
- Jest config used wrong option name `setupFilesAfterFramework` (not a valid Jest option). Corrected to `setupFilesAfterEnv`.

### Completion Notes List

- Created `lib/api.ts`: typed `fetchTodos()` using `API_URL` (server-only env var), `cache: "no-store"`, graceful degradation returning `[]` on any error.
- Created `lib/actions.ts`: `"use server"` `revalidateHome()` using `revalidatePath("/")` — scaffolded for Story 1.9 mutations.
- Created `EmptyState` component: centered card with `role="status"`, `bg-surface`, inline `boxShadow: var(--shadow-resting)` (shadows not in `@theme inline`), `rounded-xl` matching `--radius-lg` (0.75rem). Accepts a `message: string` prop; exports `EMPTY_STATE_MESSAGES` array for use by the server component.
- Created `TodoPage` client component: `"use client"`, accepts `initialTodos: Todo[]` and `emptyMessage: string`, renders `<EmptyState message={emptyMessage} />` when empty or placeholder list for Story 1.9.
- Updated `page.tsx`: async server component, `export const revalidate = false`, fetches todos, selects a random message from `EMPTY_STATE_MESSAGES` server-side, passes both to `TodoPage`.
- Updated `e2e/smoke.test.ts`: replaced "Hello World" assertion with `role="status"` visibility check.
- Installed `@testing-library/react` and `@testing-library/jest-dom` as devDependencies (anticipated in Dev Notes).
- Updated `jest.config.js`: added `setupFilesAfterEnv: ["@testing-library/jest-dom"]`, removed `--passWithNoTests` TODO comment.
- 4 EmptyState unit tests pass; all 58 tests pass total (17 shared + 37 backend + 4 frontend); build clean; 2 E2E tests pass; Lighthouse desktop/mobile: A:100, BP:100, SEO:100.

### File List

packages/frontend/src/lib/api.ts (NEW)
packages/frontend/src/lib/actions.ts (NEW)
packages/frontend/src/lib/utils.ts (MODIFIED — added pickRandom utility)
packages/frontend/src/components/empty-state.tsx (NEW)
packages/frontend/src/components/empty-state.test.tsx (NEW)
packages/frontend/src/components/todo-page.tsx (NEW)
packages/frontend/src/app/page.tsx (MODIFIED)
packages/frontend/jest.config.js (MODIFIED)
packages/frontend/package.json (MODIFIED — added @testing-library/react, @testing-library/jest-dom)
e2e/smoke.test.ts (MODIFIED)
playwright.config.ts (MODIFIED — reuseExistingServer: true)
project-context.md (MODIFIED — added Lighthouse audit DoD steps)
package.json (MODIFIED — added lint script)
_bmad-output/implementation-artifacts/sprint-status.yaml (MODIFIED)

### Change Log

- 2026-03-17: Story 1.8 implemented — Empty State & ISR Page. Created API client, server actions, EmptyState component, TodoPage client component. Converted page.tsx to async ISR server component. Replaced Hello World with EmptyState render. Updated E2E tests. Added 4 unit tests for EmptyState. Random empty-state message selected server-side and passed as prop to avoid SSR/hydration mismatch. Fixed Playwright config to always reuse existing dev server. All validations pass.
- 2026-03-17: Code review fixes applied — (1) Removed duplicate responsive container from TodoPage (double max-w/padding with page.tsx); (2) Added Array.isArray guard on API response in fetchTodos; (3) Added empty-array throw guard to pickRandom; (4) Updated File List with previously undocumented file changes (utils.ts, playwright.config.ts, project-context.md, root package.json).
- 2026-03-17: Code review recommendation — Add unit tests for `lib/api.ts` (fetchTodos has 4 code paths: success, non-ok response, fetch exception, invalid response shape) and `lib/utils.ts` (pickRandom empty-array guard). Deferred to Story 1.9 which will expand the API client with mutation functions, making it a better point to test the full API client cohesively. `lib/actions.ts` is a thin wrapper and does not warrant its own tests.
