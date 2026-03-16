# bmad help request
_Exported on 16/03/2026 at 17:35:50 GMT from Cursor (2.6.19)_

---

**User**

/bmad-help 

---

**Cursor**

Now let me check what artifacts already exist to determine your current progress.

Let me quickly check the architecture doc to ground in project context.

Here's where you stand with your **todo-bmad** project, Kevin.

---

## Current Progress (BMM Module)

| Phase | Workflow | Status |
|---|---|---|
| **2-planning** | Create PRD | Done |
| **2-planning** | Validate PRD | Done |
| **2-planning** | Create UX Design | Done |
| **3-solutioning** | Create Architecture | Done |
| **3-solutioning** | Create Epics and Stories | **Not started** |
| **3-solutioning** | Check Implementation Readiness | Not started |

---

## Next Steps

### **Required Next: Create Epics and Stories**

`bmad-bmm-create-epics-and-stories`
**Agent:** John, the Product Manager
**Description:** Break down the PRD, UX design, and architecture into an organized list of epics and user stories that will drive implementation. This feeds directly into sprint planning.

### Then Required: Check Implementation Readiness

`bmad-bmm-check-implementation-readiness`
**Agent:** Winston, the Architect
**Description:** Validate that the PRD, UX, Architecture, and Epics/Stories are all aligned and cohesive before moving into implementation. **Recommendation:** Run this with a different high-quality LLM if available for an independent validation perspective.

### After That: Sprint Planning & Implementation

Once readiness is confirmed, you'll move to Phase 4 where Bob the Scrum Master kicks off sprint planning, then the story cycle begins (Create Story -> Dev Story -> Code Review -> repeat).

---

## Reminders

- Run each workflow in a **fresh context window** for best results
- Your planning artifacts are in `_bmad-output/planning-artifacts/`
- No `docs/` folder or project knowledge files exist yet (that's fine for greenfield)

Would you like to proceed with creating the epics and stories?

---

**User**

/bmad-create-epics-and-stories 

---

**Cursor**

Let me read the template and all input documents now.

Welcome to the Epic and Story Creation workflow, Kevin! This is where we transform your PRD, UX spec, and architecture into implementable stories.

## Document Discovery

I've located all three input documents in `_bmad-output/planning-artifacts/`:

| Document | Status | Path |
|---|---|---|
| **PRD** | Found | `prd.md` |
| **Architecture** | Found | `architecture.md` |
| **UX Design Specification** | Found | `ux-design-specification.md` |

All three are complete (their frontmatter confirms full step completion). This is a solid foundation -- the PRD covers 19 FRs and 20 NFRs, the architecture defines the full technical stack (Next.js + Fastify + SQLite monorepo), and the UX spec details every component, animation, and interaction pattern.

Before I begin extracting requirements from these documents, are there any **other documents** you'd like included in the analysis, or any of the three above that should be **excluded**?

---

**User**

No other documents

---

**Cursor**

Good. I'll now extract all requirements from the three documents and populate the epics output file.

Here's the extraction summary, Kevin.

---

## Requirements Extraction Summary

**Functional Requirements: 19 FRs** across 5 categories:
- **Task Management** (FR1-FR6): Create, view, complete, uncomplete, delete todos; display text/status/timestamp
- **Task Visualization** (FR7-FR9): Completed distinction, empty state, loading state
- **Data Persistence** (FR10-FR12): Cross-session persistence, storage schema, CRUD API
- **Error Handling** (FR13-FR15): Error messages, retry without data loss, app shell renders without API
- **Responsive Experience** (FR16-FR19): Mobile, desktop, keyboard-only, screen reader operability

**Non-Functional Requirements: 20 NFRs** across 4 categories:
- **Performance** (NFR1-NFR5): Sub-1s interactions, Lighthouse 90+, FCP <1s, LCP <1.5s, CLS <0.1, asset caching
- **Accessibility** (NFR6-NFR12): WCAG 2.1 AA, keyboard navigation, screen readers, contrast, focus indicators
- **Security** (NFR13-NFR17): Input validation, XSS prevention, no internal details in errors, HTTPS, size limits (128 char / 10KB)
- **Testing** (NFR18-NFR20): 80% coverage, zero flaky tests, E2E on all 4 journeys

**Additional Requirements from Architecture: 20 items** including:
- Monorepo with npm workspaces (frontend/backend/shared)
- Shared Zod schemas as validation single source of truth
- Specific data model, API contract, and error format
- ISR rendering with Server Action revalidation
- Co-located tests, named exports, ESLint import ordering
- 10 enforcement rules for AI agent consistency

**UX Design Requirements: 22 UX-DRs** including:
- Outfit typeface with Latin subset (UX-DR1)
- Full design token system: colors, shadows, spacing, motion (UX-DR2-DR4)
- 7 custom components with detailed states and behavior (UX-DR5-DR11)
- 6 animation types + anticipation animation + reduced-motion support (UX-DR12-DR14)
- Focus management, keyboard interactions, complete ARIA pattern (UX-DR15-DR17)
- Button hierarchy, responsive layout, pending state UX, no-title design, personality-driven copy (UX-DR18-DR22)

---

Do these extracted requirements accurately represent what needs to be built? Any additions or corrections?

**Confirm the Requirements are complete and correct to [C] continue:**

---

**User**

c

---

**Cursor**

Requirements saved. Now let's design the epic structure together.

## Epic Design Principles

Before proposing a structure, here's how I'm thinking about this:

1. **User-Value First** — Each epic enables users to accomplish something meaningful, not just "set up infrastructure"
2. **Vertical Slices** — Each epic cuts through the full stack (shared types → backend → frontend) rather than building in horizontal layers
3. **Standalone & Incremental** — Each epic delivers a working, testable increment. Epic 2 builds on Epic 1 but Epic 1 works on its own.
4. **Cross-Cutting Quality** — The architecture mandates that accessibility and responsive design are baked into every component as it's built. But a dedicated final epic ensures comprehensive compliance across the full surface.

## Proposed Epic Structure

Given that todo-bmad has a deliberately narrow feature set (4 CRUD operations), I'm proposing **4 epics** organized around the user journeys from the PRD:

---

### Epic 1: Project Foundation & Todo Creation
**User outcome:** A user can open the app, see an inviting empty state, create a todo, and see it appear in a persistent list. Returning users see their existing todos immediately on page load.

**Delivers:** Journey 1 (First Visit) + Journey 2 (Quick Capture)

**Scope:** Full-stack monorepo setup (shared types/schemas, Fastify backend with all CRUD endpoints + database, Next.js frontend with ISR), design token system, TodoInput with contextual placeholders, TodoItem, TodoList, EmptyState, useTodos hook (create operation with pending state), API client, responsive layout, basic accessibility baked into every component.

**FRs covered:** FR1, FR2, FR6, FR8, FR10, FR11, FR12

---

### Epic 2: Complete Todo Lifecycle
**User outcome:** A user can complete, uncomplete, and delete todos. Active and completed items are visually distinct, separated by a labeled divider, with smooth migration animations as items move between sections.

**Delivers:** Journey 3 (Review and Tidy)

**Scope:** Toggle complete/uncomplete and delete operations in useTodos hook, TodoItem completed state styling (opacity, strikethrough), TodoList completed section with "Completed" divider, completion-migration and deletion animations, pending states for toggle and delete.

**FRs covered:** FR3, FR4, FR5, FR7

---

### Epic 3: Resilient Experience
**User outcome:** When things go wrong, the user sees friendly, personality-driven error feedback. Loading states keep the interface composed. Failed creates preserve input. The app shell renders even when the API is unavailable.

**Delivers:** Journey 4 (The Graceful Stumble)

**Scope:** ErrorCallout with per-action copy banks, LoadError with retry CTA, SkeletonLoader with breathing pulse, error animation sequence (shake + flash + callout), text recovery on failed creates (restore action), graceful degradation (app shell without API), pending state error paths.

**FRs covered:** FR9, FR13, FR14, FR15

---

### Epic 4: Accessibility & Polish
**User outcome:** Every user — mobile, desktop, keyboard-only, or using assistive technology — gets a fully functional, polished experience. Purposeful animations bring every interaction to life, with reduced-motion alternatives for those who prefer them.

**Delivers:** Cross-cutting quality bar across all journeys

**Scope:** Full focus management system (focus routing after add/complete/delete), complete ARIA pattern (aria-live regions, aria-describedby linking, skip link), screen reader optimization, prefers-reduced-motion support across all animations, entrance and anticipation animation refinement, mobile-specific tuning (no auto-focus, touch target verification).

**FRs covered:** FR16, FR17, FR18, FR19

---

### FR Coverage Map

| FR | Epic | Description |
|---|---|---|
| FR1 | Epic 1 | Create a new todo by entering text |
| FR2 | Epic 1 | View all existing todos in a single list |
| FR6 | Epic 1 | Display text, completion status, and timestamp |
| FR8 | Epic 1 | Empty state when no todos exist |
| FR10 | Epic 1 | Todos persist across sessions and refreshes |
| FR11 | Epic 1 | Store text, completion status, and timestamp |
| FR12 | Epic 1 | CRUD API for todo operations |
| FR3 | Epic 2 | Mark a todo as complete |
| FR4 | Epic 2 | Unmark a completed todo to restore it |
| FR5 | Epic 2 | Delete a todo permanently |
| FR7 | Epic 2 | Distinguish completed from active at a glance |
| FR9 | Epic 3 | Loading state while data is being fetched |
| FR13 | Epic 3 | Clear error message when operation fails |
| FR14 | Epic 3 | Retry failed operation without losing input |
| FR15 | Epic 3 | App shell renders without API |
| FR16 | Epic 4 | All operations on mobile devices |
| FR17 | Epic 4 | All operations on desktop devices |
| FR18 | Epic 4 | All operations using keyboard only |
| FR19 | Epic 4 | Interaction via assistive technologies |

**All 19 FRs covered. No gaps.**

---

A note on the Epic 1 / Epic 4 boundary: Epics 1-3 build every component with responsive layout and basic accessibility (semantic HTML, ARIA attributes, keyboard handlers) per the architecture's enforcement rules. Epic 4 then does the comprehensive pass — full focus management routing, aria-live regions, skip links, screen reader validation, and the animation polish layer. This avoids retrofitting while giving accessibility its own dedicated focus.

Does this epic structure align with your product vision? Should we adjust any groupings or dependencies?

---

**User**

I'd like to ensure that unit tests and e2e tests are written alongside each epic and story rather than having a dedicated epic to implement all testing.  I want to be able to run and verify tests at every step for newly introduced code and features.

---

**Cursor**

That's the right call. Testing alongside implementation is much more aligned with the architecture's co-located test strategy and the NFRs around coverage. Here's the revised structure:

---

## Revised Epic Structure (Testing Integrated)

The key change: **each epic includes unit tests for all new code and E2E tests for the user journeys it delivers.** Coverage builds incrementally. No testing backlog.

### Epic 1: Project Foundation & Todo Creation
**User outcome:** A user can open the app, see an inviting empty state, create a todo, and see it appear in a persistent list. Returning users see their existing todos immediately on page load.

**Delivers:** Journey 1 (First Visit) + Journey 2 (Quick Capture)

**Scope:** Full-stack monorepo setup, shared types/schemas, Fastify backend with all CRUD endpoints + database, Next.js frontend with ISR, design token system, TodoInput, TodoItem, TodoList, EmptyState, useTodos hook (create with pending state), API client, responsive layout, basic accessibility. **Unit/integration tests for all backend routes (via Fastify .inject()), all frontend components, hooks, and API client. E2E tests for Journey 1 and Journey 2.**

**FRs covered:** FR1, FR2, FR6, FR8, FR10, FR11, FR12

---

### Epic 2: Complete Todo Lifecycle
**User outcome:** A user can complete, uncomplete, and delete todos. Active and completed items are visually distinct, separated by a labeled divider, with smooth migration animations.

**Delivers:** Journey 3 (Review and Tidy)

**Scope:** Toggle complete/uncomplete and delete in useTodos hook, TodoItem completed styling, TodoList completed section with divider, completion-migration and deletion animations, pending states for toggle and delete. **Unit tests for new/updated components and hook behavior. E2E test for Journey 3.**

**FRs covered:** FR3, FR4, FR5, FR7

---

### Epic 3: Resilient Experience
**User outcome:** Friendly, personality-driven error feedback when things go wrong. Loading states keep the interface composed. Failed creates preserve input. The app shell renders without the API.

**Delivers:** Journey 4 (The Graceful Stumble)

**Scope:** ErrorCallout, LoadError, SkeletonLoader, error animation sequence, text recovery on failed creates, graceful degradation, pending state error paths. **Unit tests for all error/loading components. E2E test for Journey 4 (all error types). Integration tests for API error responses.**

**FRs covered:** FR9, FR13, FR14, FR15

---

### Epic 4: Accessibility & Polish
**User outcome:** Every user — mobile, desktop, keyboard-only, or assistive technology — gets a fully functional, polished experience. Purposeful animations bring every interaction to life.

**Delivers:** Cross-cutting quality bar across all journeys

**Scope:** Full focus management system, complete ARIA pattern (aria-live, aria-describedby, skip link), screen reader optimization, prefers-reduced-motion support, entrance/anticipation animation refinement, mobile tuning. **Accessibility-focused E2E tests (keyboard-only full flow, ARIA state verification across all journeys). Final coverage verification against NFR18 (80% target).**

**FRs covered:** FR16, FR17, FR18, FR19

---

### Updated FR Coverage Map

| FR | Epic | Description |
|---|---|---|
| FR1 | Epic 1 | Create a new todo by entering text |
| FR2 | Epic 1 | View all existing todos in a single list |
| FR6 | Epic 1 | Display text, completion status, and timestamp |
| FR8 | Epic 1 | Empty state when no todos exist |
| FR10 | Epic 1 | Todos persist across sessions and refreshes |
| FR11 | Epic 1 | Store text, completion status, and timestamp |
| FR12 | Epic 1 | CRUD API for todo operations |
| FR3 | Epic 2 | Mark a todo as complete |
| FR4 | Epic 2 | Unmark a completed todo to restore it |
| FR5 | Epic 2 | Delete a todo permanently |
| FR7 | Epic 2 | Distinguish completed from active at a glance |
| FR9 | Epic 3 | Loading state while data is being fetched |
| FR13 | Epic 3 | Clear error message when operation fails |
| FR14 | Epic 3 | Retry failed operation without losing input |
| FR15 | Epic 3 | App shell renders without API |
| FR16 | Epic 4 | All operations on mobile devices |
| FR17 | Epic 4 | All operations on desktop devices |
| FR18 | Epic 4 | All operations using keyboard only |
| FR19 | Epic 4 | Interaction via assistive technologies |

**All 19 FRs covered. Testing woven into every epic.**

---

### Testing progression across epics:

| Epic | Unit/Integration Tests | E2E Tests | Coverage Target |
|---|---|---|---|
| Epic 1 | Backend routes, shared schemas, frontend components, hook, API client | Journey 1 + Journey 2 | Foundation established |
| Epic 2 | Updated hook, updated components | Journey 3 | Growing incrementally |
| Epic 3 | Error/loading components, error paths | Journey 4 | All journeys covered |
| Epic 4 | Accessibility-specific tests | Keyboard + ARIA verification across all journeys | NFR18 80% verified |

Does this revised structure work for you? Should we adjust anything else?

---

**User**

That looks to be good

---

**Cursor**

Let me save the approved epic structure to the output file.

Epic structure and FR coverage map saved to `epics.md`.

**Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Continue

---

**User**

c

---

**Cursor**

Now let's build out the stories for each epic, starting with Epic 1. I'll present each epic's stories for your review before moving on.

---

## Epic 1: Project Foundation & Todo Creation

**Goal:** User can open the app, see an inviting empty state, create a todo, and see it appear in a persistent list. Returning users see their existing todos immediately.

**FRs covered:** FR1, FR2, FR6, FR8, FR10, FR11, FR12
**Journeys:** Journey 1 (First Visit), Journey 2 (Quick Capture)

**Relevant NFRs:** NFR1-5 (performance), NFR13-17 (security/validation), NFR18-20 (testing)
**Relevant UX-DRs:** UX-DR1 (Outfit font), UX-DR2-4 (design tokens, colors, shadows), UX-DR5 (TodoInput), UX-DR6 (TodoItem), UX-DR7 (TodoList basics), UX-DR8 (EmptyState), UX-DR19 (responsive layout), UX-DR21 (no-title design)

This is the largest epic because it includes all foundation work. I'm proposing **3 stories** that build sequentially:

1. **Story 1.1: Project Setup & Backend API** — Monorepo scaffolding, shared types/schemas, full backend with CRUD endpoints, database, tests. The architecture explicitly calls for this as the first implementation step. Developer-facing but necessary foundation.

2. **Story 1.2: Frontend Foundation & Empty State** — Next.js with ISR, design token system, Outfit font, responsive layout, EmptyState component. This is the first user-facing story — when someone opens the app with no todos, they see a warm, inviting page.

3. **Story 1.3: Todo Creation & List Display** — TodoInput, TodoItem, TodoList, useTodos hook (create with pending state), API client, revalidation. The core interaction loop. E2E tests for Journeys 1 & 2.

Does this breakdown feel right, or would you prefer to split/merge differently before I write out the full stories with acceptance criteria?

---

**User**

Please split the project setup and backend API creation into separate stories.  I'd like to see each backend API endpoint be its own story as well.  I want to avoid having PRs which are very large (with the possible exception of the project setup one)

---

**Cursor**

Good call — smaller PRs are easier to review and less risky. Here's the revised Epic 1 breakdown with **7 stories**:

---

### Revised Epic 1 Story Breakdown

**Story 1.1: Project Scaffolding & Shared API Contract**
Monorepo with npm workspaces, all 3 package scaffolds, shared Zod schemas/types/constants, TypeScript configs, .env.example files, .gitignore. The one story that's allowed to be large. Unit tests for shared schemas.

**Story 1.2: Backend Server Foundation & List Todos**
Fastify server setup, Drizzle schema, SQLite database, migrations (auto-applied on startup), CORS plugin, error handler plugin, Pino logging, environment config. GET /api/todos endpoint returning all todos. Integration tests via `.inject()`.

**Story 1.3: Create Todo Endpoint**
POST /api/todos with Zod validation (1-128 chars, non-empty, trimmed), server-side UUID generation, HTML sanitization, 10KB body limit. Returns created todo. Integration tests for success, validation errors, and edge cases.

**Story 1.4: Update Todo Endpoint**
PATCH /api/todos/:id for toggling completion status. Returns updated todo. 404 for missing IDs. Integration tests.

**Story 1.5: Delete Todo Endpoint**
DELETE /api/todos/:id returning 204. 404 for missing IDs. Integration tests.

**Story 1.6: Frontend Foundation & Empty State**
Next.js with ISR, Tailwind CSS, shadcn/ui init, Outfit font with Latin subset, full design token system (CSS custom properties for colors, shadows, spacing, motion, radii), root layout, page.tsx server component, responsive centered column layout, EmptyState component with personality-driven copy. Unit tests for EmptyState.

**Story 1.7: Todo Creation & List Display**
TodoInput (card-style, contextual placeholder rotation, focus ring), TodoItem (card with text, relative timestamp), TodoList (active items newest-first), useTodos hook (create with pending state), API client (typed fetch wrapper), Server Actions (revalidatePath). Unit tests for all components and hook. E2E tests for Journey 1 and Journey 2.

---

This gives you 5 focused backend PRs (one foundation + one per endpoint) and 2 frontend PRs. Each backend endpoint story is tightly scoped. Does this split work?

---

**User**

For 1.2 and 1.6, is it possible to split the "foundation" work from the introduction of the endpoints/components?  Again, I'd like to focus on small single concern PRs, and I feel that mixing to introduction of endpoints or UI components with the work to scaffold those services would lead to large PRs which introduce different concerns

---

**Cursor**

Absolutely — separating scaffolding from features keeps each PR single-concern. Here's the revised breakdown with **9 stories**:

---

### Revised Epic 1 Story Breakdown

**Story 1.1: Project Scaffolding & Shared API Contract**
Monorepo with npm workspaces, all 3 package scaffolds, shared Zod schemas/types/constants, TypeScript configs, .env.example files, .gitignore. Unit tests for shared schemas.

**Story 1.2: Backend Server Foundation**
Fastify server setup, Drizzle schema definition, SQLite database connection, migration runner (auto-applied on startup), CORS plugin, error handler plugin, Pino logging, environment config loader. Server starts and runs with no feature endpoints.

**Story 1.3: List Todos Endpoint**
GET /api/todos returning `{ todos: Todo[] }`. Integration tests via `.inject()`.

**Story 1.4: Create Todo Endpoint**
POST /api/todos with Zod validation (1-128 chars, non-empty, trimmed), server-side UUID generation, HTML sanitization, 10KB body limit. Returns `{ todo: Todo }`. Integration tests for success, validation errors, edge cases.

**Story 1.5: Update Todo Endpoint**
PATCH /api/todos/:id for toggling completion status. Returns `{ todo: Todo }`. 404 for missing IDs. Integration tests.

**Story 1.6: Delete Todo Endpoint**
DELETE /api/todos/:id returning 204. 404 for missing IDs. Integration tests.

**Story 1.7: Frontend Foundation & Design System**
Next.js project with Tailwind CSS, shadcn/ui init, Outfit font with Latin subset, full CSS custom properties design token system (colors, shadows, spacing, motion, radii), root layout, responsive centered column layout, globals.css. No custom components — just the styled shell.

**Story 1.8: Empty State & ISR Page**
page.tsx as server component fetching todos from backend API via ISR. EmptyState component with personality-driven copy. When no todos exist, user sees the warm empty state. Unit tests for EmptyState.

**Story 1.9: Todo Creation & List Display**
TodoInput (card-style, contextual placeholder rotation, focus ring), TodoItem (card with text, relative timestamp), TodoList (active items newest-first), useTodos hook (create with pending state), API client (typed fetch wrapper), Server Actions (revalidatePath). Unit tests for all components and hook. E2E tests for Journey 1 and Journey 2.

---

Each PR now has a clear single concern: scaffolding, server foundation, individual endpoint, design system, component introduction, or feature integration. Does this work?

---

**User**

For 1.7, I'd like to ensure that we remove any "default starter template" UI and have the page render a simple "Hello world" message, ready to be replaced in story 1.8 and 1.9

---

**Cursor**

Good detail — that makes Story 1.7 crisply testable too. A clean "Hello World" confirms the full frontend stack works end-to-end (Tailwind, Outfit font, design tokens, responsive layout) before any custom components are introduced. Story 1.8 then replaces it with the EmptyState.

Here's the updated story:

**Story 1.7: Frontend Foundation & Design System**
Next.js project with Tailwind CSS, shadcn/ui init, Outfit font with Latin subset, full CSS custom properties design token system (colors, shadows, spacing, motion, radii), root layout, responsive centered column layout, globals.css. Remove all default create-next-app starter template UI and replace with a simple "Hello World" message rendered within the design system's layout — confirming the font, tokens, and responsive column are working. No custom components.

---

With that, the full revised Epic 1 breakdown is:

| Story | Concern | Scope |
|---|---|---|
| 1.1 | Monorepo scaffolding | Workspaces, shared schemas/types, TS configs |
| 1.2 | Backend scaffolding | Fastify server, Drizzle/SQLite, plugins, logging |
| 1.3 | GET endpoint | List todos |
| 1.4 | POST endpoint | Create todo with validation |
| 1.5 | PATCH endpoint | Toggle completion |
| 1.6 | DELETE endpoint | Remove todo |
| 1.7 | Frontend scaffolding | Next.js, design tokens, Outfit font, "Hello World" |
| 1.8 | First user-facing page | EmptyState component, ISR page integration |
| 1.9 | Core interaction | TodoInput, TodoItem, TodoList, create flow, E2E |

Ready for me to write out the full stories with acceptance criteria? Or any other adjustments to the breakdown?

---

**User**

That breakdown looks good

---

**Cursor**

Here are the full stories with acceptance criteria for Epic 1.

---

## Epic 1: Project Foundation & Todo Creation

User can open the app, see an inviting empty state, create a todo, and see it appear in a persistent list. Returning users see their existing todos immediately on page load.

---

### Story 1.1: Project Scaffolding & Shared API Contract

As a developer,
I want the monorepo scaffolded with shared types and validation schemas,
So that all packages have a consistent foundation and API contract.

**Acceptance Criteria:**

**Given** a fresh clone of the repository
**When** `npm install` is run at the root
**Then** all 3 workspace packages (shared, backend, frontend) install successfully

**Given** the shared package
**When** schemas are imported
**Then** `createTodoSchema`, `updateTodoSchema`, and `todoSchema` are available with correct Zod validation rules

**Given** the shared package
**When** types are imported
**Then** `Todo`, `CreateTodoRequest`, `UpdateTodoRequest`, and `ApiError` TypeScript types are available

**Given** the shared package
**When** constants are imported
**Then** `MAX_TEXT_LENGTH` (128) and error code constants (`VALIDATION_ERROR`, `NOT_FOUND`, `INTERNAL_ERROR`) are available

**Given** TypeScript strict mode enabled
**When** any package is built
**Then** it compiles with zero errors

**Given** the `createTodoSchema`
**When** text of 0 characters, only whitespace, or exceeding 128 characters is validated
**Then** validation fails with a descriptive error

**Given** the `createTodoSchema`
**When** valid text between 1-128 characters is validated
**Then** validation succeeds and the text is trimmed

---

### Story 1.2: Backend Server Foundation

As a developer,
I want a Fastify server with database and core plugins configured,
So that API endpoints can be added incrementally on a solid foundation.

**Acceptance Criteria:**

**Given** the backend package
**When** the dev command is run
**Then** the Fastify server starts on the configured port (default 3001)

**Given** server startup
**When** the SQLite database file does not exist
**Then** it is created and migrations are applied automatically

**Given** server startup
**When** migrations have already been applied
**Then** the server starts without re-running them

**Given** CORS configuration
**When** a request arrives from the configured frontend origin
**Then** it is allowed through

**Given** CORS configuration
**When** a request arrives from an unknown origin
**Then** it is rejected

**Given** any unhandled server error
**When** the error handler processes it
**Then** the response follows `{ error, message }` format without exposing internal details (NFR15)

**Given** the Pino logger
**When** any request is processed
**Then** it is logged with a request ID in structured JSON format

**Given** environment variables (PORT, DATABASE_PATH, CORS_ORIGIN)
**When** set via `.env`
**Then** they are used by the server configuration

---

### Story 1.3: List Todos Endpoint

As a user,
I want the system to provide my todo list when requested,
So that I can see all my existing tasks.

**Acceptance Criteria:**

**Given** the backend is running with no todos in the database
**When** GET `/api/todos` is called
**Then** it returns 200 with `{ todos: [] }`

**Given** todos exist in the database
**When** GET `/api/todos` is called
**Then** it returns 200 with `{ todos: Todo[] }` containing all todos

**Given** todos are returned
**When** the response is inspected
**Then** each todo includes `id`, `text`, `completed`, and `createdAt` fields with camelCase JSON keys

**Given** multiple todos exist
**When** GET `/api/todos` is called
**Then** todos are ordered by `createdAt` descending (newest first)

---

### Story 1.4: Create Todo Endpoint

As a user,
I want to create a new todo via the API,
So that my task is persisted and available across sessions.

**Acceptance Criteria:**

**Given** valid todo text (1-128 characters)
**When** POST `/api/todos` is called
**Then** it returns 201 with `{ todo: Todo }` including a server-generated UUID v4 `id`

**Given** valid todo text with leading/trailing whitespace
**When** POST `/api/todos` is called
**Then** the text is trimmed before storage

**Given** todo text containing HTML tags
**When** POST `/api/todos` is called
**Then** HTML is stripped/sanitized before storage (NFR14)

**Given** empty text or whitespace-only text
**When** POST `/api/todos` is called
**Then** it returns 400 with `{ error: "VALIDATION_ERROR", message: "..." }`

**Given** text exceeding 128 characters
**When** POST `/api/todos` is called
**Then** it returns 400 with `VALIDATION_ERROR` (NFR17)

**Given** a request body exceeding 10KB
**When** POST `/api/todos` is called
**Then** the request is rejected (NFR17)

**Given** a malformed JSON body
**When** POST `/api/todos` is called
**Then** it returns 400 with `VALIDATION_ERROR`

**Given** a successfully created todo
**When** the response is inspected
**Then** `completed` is `false` and `createdAt` is a valid ISO 8601 timestamp

---

### Story 1.5: Update Todo Endpoint

As a user,
I want to update a todo's completion status via the API,
So that I can track which tasks are done.

**Acceptance Criteria:**

**Given** an existing active todo
**When** PATCH `/api/todos/:id` is called with `{ completed: true }`
**Then** it returns 200 with the updated todo showing `completed: true`

**Given** an existing completed todo
**When** PATCH `/api/todos/:id` is called with `{ completed: false }`
**Then** it returns 200 with the updated todo showing `completed: false`

**Given** a non-existent todo ID
**When** PATCH `/api/todos/:id` is called
**Then** it returns 404 with `{ error: "NOT_FOUND", message: "..." }`

**Given** an invalid request body (missing or non-boolean `completed` field)
**When** PATCH `/api/todos/:id` is called
**Then** it returns 400 with `VALIDATION_ERROR`

---

### Story 1.6: Delete Todo Endpoint

As a user,
I want to delete a todo via the API,
So that I can remove tasks I no longer need.

**Acceptance Criteria:**

**Given** an existing todo
**When** DELETE `/api/todos/:id` is called
**Then** it returns 204 with no content

**Given** a todo has been deleted
**When** GET `/api/todos` is called
**Then** the deleted todo is no longer in the list

**Given** a non-existent todo ID
**When** DELETE `/api/todos/:id` is called
**Then** it returns 404 with `{ error: "NOT_FOUND", message: "..." }`

---

### Story 1.7: Frontend Foundation & Design System

As a user,
I want to see a polished, responsive page when I open the app,
So that I know the application is working and well-crafted.

**Acceptance Criteria:**

**Given** a fresh Next.js project
**When** the default create-next-app starter template UI is removed
**Then** the page renders a simple "Hello World" message within the styled layout

**Given** the page renders
**When** viewed in a browser
**Then** the Outfit font is loaded and applied from Google Fonts (Latin subset only)

**Given** the globals.css file
**When** inspected
**Then** CSS custom properties are defined for: colors (background, surface, text primary/secondary/placeholder, accent, error, success), shadows (resting, hover, focus), spacing (8px base multiples), border radii, and motion tokens (durations: fast 150ms, normal 250ms, slow 400ms, shake 300ms; easings: ease-out, ease-in, ease-in-out)

**Given** the responsive layout
**When** viewed at mobile (320px), tablet (768px), and desktop (1024px) widths
**Then** a centered narrow column (max-width ~600-640px) is displayed with appropriate padding at each breakpoint

**Given** the root layout
**When** the page loads
**Then** proper HTML metadata (title, description, viewport) and semantic landmarks (`<main>`) are present

**Given** Tailwind CSS and shadcn/ui
**When** the project builds
**Then** both are correctly configured with zero build errors

**Given** the no-title design principle
**When** the page loads
**Then** no app heading or title is rendered — just the "Hello World" within the responsive column

---

### Story 1.8: Empty State & ISR Page

As a user,
I want to see a warm, inviting message when I have no todos,
So that I understand the app's purpose and feel invited to start.

**Acceptance Criteria:**

**Given** the page.tsx server component
**When** it fetches from the backend API and receives an empty todo list
**Then** the EmptyState component is rendered

**Given** the EmptyState component
**When** displayed
**Then** it shows personality-driven copy (warm, inviting message) inside a centered card matching the Warm Depth visual direction

**Given** ISR is configured
**When** the page is requested
**Then** it is server-rendered with todo data fetched from the backend API at request time

**Given** the "Hello World" placeholder from Story 1.7
**When** this story is complete
**Then** it is fully replaced by the ISR page rendering the EmptyState within the responsive layout

**Given** the EmptyState component
**When** inspected by a screen reader
**Then** it has `role="status"` for proper announcement

**Given** the EmptyState component
**When** unit tests are run
**Then** all tests pass verifying render output and accessibility attributes

---

### Story 1.9: Todo Creation & List Display

As a user,
I want to type a thought and hit enter to create a todo that appears in my list,
So that I can capture tasks effortlessly and see them persisted.

**Acceptance Criteria:**

**Given** the TodoInput component
**When** displayed
**Then** it renders as a card with shadow depth and accent-colored focus ring on focus

**Given** an empty todo list
**When** the TodoInput placeholder is shown
**Then** it displays a random message from the "empty list" bank (~5 variations like "What's first...?")

**Given** todos exist in the list
**When** the TodoInput placeholder is shown
**Then** it displays from the "has items" bank (~5 variations like "What's next...?")

**Given** a todo was just successfully added
**When** the TodoInput placeholder updates
**Then** it displays from the "just added" bank (~5 variations like "Anything else...?")

**Given** the user types text and presses Enter
**When** the API call succeeds
**Then** the input clears and a new TodoItem appears in the list

**Given** a TodoItem is displayed
**When** inspected
**Then** it renders as a card with the todo text and a relative timestamp ("just now")

**Given** multiple todos exist
**When** the TodoList renders
**Then** active todos are displayed newest-first

**Given** a create operation is in flight
**When** the useTodos hook is managing state
**Then** a pending state is set for the creating item

**Given** a create operation succeeds
**When** state is updated
**Then** local state reflects the server response and `revalidatePath('/')` is triggered via Server Action

**Given** the user submits empty or whitespace-only text
**When** Enter is pressed
**Then** the submission is silently ignored (no error, no API call)

**Given** the no-title design
**When** the page loads with the TodoInput
**Then** it is the most prominent element on the page with no app heading above it

**Given** all components and hook
**When** unit tests are run
**Then** tests pass for TodoInput, TodoItem, TodoList, and useTodos hook

**Given** Journey 1 (First Visit) E2E test
**When** a user opens the app, sees empty state, creates their first todo
**Then** the todo appears in the list

**Given** Journey 2 (Quick Capture) E2E test
**When** a returning user with existing todos adds a new todo
**Then** the new todo appears at the top of the active list

---

That's all 9 stories for Epic 1. Do these acceptance criteria capture the requirements correctly? Is the scope of each story appropriate? Any adjustments before I save and move to Epic 2?

---

**User**

That looks good

---

**Cursor**

Let me save Epic 1 to the document, then move on to Epic 2.

Epic 1 saved — 9 stories, all 7 FRs covered (FR1, FR2, FR6, FR8, FR10, FR11, FR12). Now let's move to Epic 2.

---

## Epic 2: Complete Todo Lifecycle

**Goal:** User can complete, uncomplete, and delete todos. Active and completed items are visually distinct, separated by a labeled divider, with smooth migration animations.

**FRs covered:** FR3, FR4, FR5, FR7
**Journey:** Journey 3 (Review and Tidy)

**Relevant NFRs:** NFR1 (sub-1s interactions), NFR6-12 (accessibility basics baked in)
**Relevant UX-DRs:** UX-DR6 (TodoItem completed states), UX-DR7 (completed section divider), UX-DR12 (completion-migration, uncomplete-migration, deletion animations), UX-DR14 (reduced-motion for these animations), UX-DR18 (delete button hierarchy), UX-DR20 (pending states for toggle/delete)

Since the backend endpoints already exist from Epic 1 (Stories 1.5 and 1.6), this epic is **purely frontend**. Following your preference for single-concern PRs, I'm proposing **4 stories**:

1. **Story 2.1: Complete & Uncomplete Todos** — Toggle completion in useTodos hook, TodoItem completed styling (strikethrough, reduced opacity), checkbox amber fill on checked. Unit tests.

2. **Story 2.2: Completed Section Divider** — TodoList updated with active/completed sections, labeled "Completed" divider, ordering within each section (active newest-first, completed most-recently-completed-first). Unit tests.

3. **Story 2.3: Delete Todos** — Delete operation in useTodos hook, delete button on TodoItem (subtle at rest, visible on hover/focus), pending state for delete. Unit tests.

4. **Story 2.4: Lifecycle Animations & E2E** — Completion-migration animation (item migrates down past divider), uncomplete-migration (item migrates up), deletion slide-out with gap close, prefers-reduced-motion variants for all. E2E test for Journey 3.

Does this breakdown work, or would you adjust?

---

**User**

Please incorporate the relevant lifecycle animations, unit tests and e2e tests into the individual stories that they are associated with, rather than having a dedicated story for those

---

**Cursor**

Good call. That eliminates the dedicated animation/test story. Here's the revised **3-story** breakdown with everything folded into its associated feature:

---

### Revised Epic 2 Story Breakdown

**Story 2.1: Complete & Uncomplete Todos**
Toggle completion in useTodos hook with pending state for toggle. TodoItem completed styling (strikethrough, reduced opacity, lighter text color). Checkbox warm amber fill on checked with custom check animation. Strikethrough animation on complete (~400ms), reversal on uncomplete. prefers-reduced-motion variants. Unit tests for updated hook and component states.

**Story 2.2: Completed Section Divider**
TodoList restructured with active/completed sections. Labeled "Completed" divider (horizontal rule + uppercase label, `role="separator"`). Active items newest-first, completed items most-recently-completed-first. Divider appears/disappears based on completed item existence. Migration animations — items smoothly move down past divider on complete, back up on uncomplete (ease-in-out, ~400ms). prefers-reduced-motion variants for migrations. Unit tests for divider logic and list ordering.

**Story 2.3: Delete Todos**
Delete operation in useTodos hook with pending state. Delete button on TodoItem (low opacity ~0.3-0.4 at rest, full opacity on hover/focus, warm error color on hover/focus). Deletion slide-out animation with smooth gap close (ease-in, ~250ms). prefers-reduced-motion variant. Unit tests for delete behavior. E2E test for Journey 3 (Review and Tidy — complete, uncomplete, and delete across the full flow).

---

Each feature ships with its own animations, reduced-motion support, and tests. Journey 3 E2E lands in Story 2.3 since that's when the full lifecycle is testable. Does this work?

---

**User**

I'd like for 2.1, 2.2 and 2.3 to all incorporate their respective E2E tests rather than doing them all at once at the end.  I want to be able to run tests for each story as part of considering it complete

---

**Cursor**

That makes sense — each story should be independently verifiable. Here's the updated breakdown:

**Story 2.1: Complete & Uncomplete Todos**
Toggle completion in useTodos hook with pending state. TodoItem completed styling (strikethrough, reduced opacity, lighter text). Checkbox warm amber fill on checked with check animation. Strikethrough animation on complete, reversal on uncomplete. prefers-reduced-motion variants. Unit tests. **E2E tests: user completes a todo (strikethrough appears, item moves to completed area), user uncompletes a todo (strikethrough reverses, item restores to active area).**

**Story 2.2: Completed Section Divider**
TodoList restructured with active/completed sections. Labeled "Completed" divider with `role="separator"`. Active newest-first, completed most-recently-completed-first. Divider appears/disappears based on completed items. Migration animations past divider on complete/uncomplete. prefers-reduced-motion variants. Unit tests. **E2E tests: divider appears after completing an item, divider disappears when all items are uncompleted, items are correctly ordered within each section.**

**Story 2.3: Delete Todos**
Delete in useTodos hook with pending state. Delete button on TodoItem (low opacity at rest, full on hover/focus, warm error color). Deletion slide-out animation with gap close. prefers-reduced-motion variant. Unit tests. **E2E tests: user deletes an active todo (item removed, list closes gap), user deletes a completed todo. Full Journey 3 (Review and Tidy) E2E covering the complete → uncomplete → delete flow end-to-end.**

---

Each story ships with its own E2E coverage, runnable and verifiable at completion. Story 2.3 adds the full Journey 3 integration test on top since all pieces are in place. Ready for me to write out the full acceptance criteria?

---

**User**

c

---

**Cursor**

Here are the full stories with acceptance criteria for Epic 2.

---

## Epic 2: Complete Todo Lifecycle

User can complete, uncomplete, and delete todos. Active and completed items are visually distinct, separated by a labeled divider, with smooth migration animations as items move between sections.

---

### Story 2.1: Complete & Uncomplete Todos

As a user,
I want to mark todos as complete or restore them to active,
So that I can track my progress and see what's done versus what's pending.

**Acceptance Criteria:**

**Given** an active todo
**When** the user clicks the checkbox
**Then** the useTodos hook sends a PATCH request with `{ completed: true }` and sets a pending state on the item

**Given** a successful completion toggle
**When** the server confirms
**Then** the TodoItem displays completed styling: strikethrough text, reduced opacity (0.7), lighter text color, and `revalidatePath('/')` is triggered

**Given** the checkbox on a completed todo
**When** the user clicks it
**Then** the todo is restored to active with strikethrough removed, full opacity, and original text color

**Given** a completion toggle
**When** the animation plays
**Then** a strikethrough animates across the text (~400ms, ease-in-out) on complete, and reverses on uncomplete

**Given** the checkbox
**When** a todo is completed
**Then** the checkbox fills with warm amber color with a check animation

**Given** a user with `prefers-reduced-motion` enabled
**When** completing or uncompleting a todo
**Then** state changes are instant (no strikethrough animation, no migration motion) — communicated through opacity and color only

**Given** the toggle pending state
**When** the API call is in flight
**Then** the checkbox shows a pending indicator (pulse/dim)

**Given** all updated components and hook
**When** unit tests are run
**Then** tests pass for TodoItem completed states, checkbox behavior, and useTodos toggle logic

**Given** E2E test for complete
**When** a user clicks an active todo's checkbox
**Then** the todo transitions to completed styling and moves below active items

**Given** E2E test for uncomplete
**When** a user clicks a completed todo's checkbox
**Then** the todo restores to active styling and moves back above completed items

---

### Story 2.2: Completed Section Divider

As a user,
I want completed and active todos clearly separated,
So that I can instantly see what's done versus what's pending at a glance.

**Acceptance Criteria:**

**Given** the TodoList component
**When** both active and completed todos exist
**Then** a labeled "Completed" divider (horizontal rule with small uppercase label) is displayed between the two sections

**Given** no completed todos exist
**When** the TodoList renders
**Then** the divider is not displayed

**Given** all todos are completed
**When** the TodoList renders
**Then** the divider appears at the top with all items in the completed section

**Given** the active items section
**When** rendered
**Then** items are ordered by creation time newest-first

**Given** the completed items section
**When** rendered
**Then** items are ordered by most-recently-completed-first

**Given** the divider element
**When** inspected
**Then** it has `role="separator"` for accessibility

**Given** a todo being completed
**When** the migration animation plays
**Then** the item smoothly migrates down past the divider to join the completed section (ease-in-out, ~400ms)

**Given** a todo being uncompleted
**When** the migration animation plays
**Then** the item smoothly migrates up past the divider to rejoin the active section (ease-in-out, ~400ms)

**Given** a user with `prefers-reduced-motion` enabled
**When** items move between sections
**Then** the position change is instant with no migration animation

**Given** the TodoList component
**When** unit tests are run
**Then** tests pass for divider show/hide logic, section ordering, and migration behavior

**Given** E2E test for divider appearance
**When** a user completes a todo
**Then** the "Completed" divider appears and the item is below it

**Given** E2E test for divider removal
**When** a user uncompletes all completed todos
**Then** the divider disappears

**Given** E2E test for ordering
**When** multiple todos exist in each section
**Then** active items are newest-first and completed items are most-recently-completed-first

---

### Story 2.3: Delete Todos

As a user,
I want to delete todos I no longer need,
So that I can keep my list clean and focused on what matters.

**Acceptance Criteria:**

**Given** a TodoItem
**When** rendered
**Then** a delete button is visible at low opacity (~0.3-0.4)

**Given** the delete button on desktop
**When** the user hovers over it or focuses it via keyboard
**Then** it increases to full opacity and shifts to warm error color

**Given** the delete button on mobile
**When** rendered without hover
**Then** it remains at its resting low-opacity state

**Given** the user clicks the delete button
**When** the useTodos hook processes the delete
**Then** a pending state is set on the item (dim indicator) and a DELETE request is sent

**Given** a successful delete
**When** the server returns 204
**Then** the item slides out with a clean exit animation (ease-in, ~250ms) and remaining items close the gap smoothly

**Given** a user with `prefers-reduced-motion` enabled
**When** a todo is deleted
**Then** the item is removed instantly with no slide animation

**Given** a successful delete
**When** state is updated
**Then** `revalidatePath('/')` is triggered via Server Action

**Given** all delete-related code
**When** unit tests are run
**Then** tests pass for delete button rendering, useTodos delete logic, and pending state behavior

**Given** E2E test for deleting an active todo
**When** a user clicks the delete button on an active item
**Then** the item is removed from the list and the gap closes

**Given** E2E test for deleting a completed todo
**When** a user clicks the delete button on a completed item
**Then** the item is removed from the completed section

**Given** Journey 3 (Review and Tidy) full E2E test
**When** a user completes two items, uncompletes one, and deletes another
**Then** the list correctly reflects all state changes with proper section placement

---

That's all 3 stories for Epic 2. All 4 FRs covered (FR3, FR4, FR5, FR7), each story with its own unit and E2E tests. Does this look right, or any adjustments before I save and move to Epic 3?

---

**User**

Continue

---

**Cursor**

Epic 2 saved — 3 stories, all 4 FRs covered (FR3, FR4, FR5, FR7). Now Epic 3.

---

## Epic 3: Resilient Experience

**Goal:** User receives friendly, personality-driven error feedback when things go wrong. Loading states keep the interface composed. Failed creates preserve input. The app shell renders without the API.

**FRs covered:** FR9, FR13, FR14, FR15
**Journey:** Journey 4 (The Graceful Stumble)

**Relevant NFRs:** NFR13-15 (security/validation error handling), NFR1 (sub-1s feedback)
**Relevant UX-DRs:** UX-DR9 (SkeletonLoader), UX-DR10 (ErrorCallout), UX-DR11 (LoadError), UX-DR12 (skeleton pulse, error shake/flash sequence), UX-DR13 (anticipation animation), UX-DR14 (reduced-motion), UX-DR20 (text caching/restore on failed create), UX-DR22 (personality-driven error copy)

Proposing **4 stories**, each with its own tests:

1. **Story 3.1: Loading State & Skeleton Loader** — SkeletonLoader component with breathing pulse, appears after ~200-300ms delay, `aria-busy` on list container, reduced-motion variant. Unit tests. E2E test: slow API response shows skeleton, then real content replaces it.

2. **Story 3.2: Error Handling for Mutations** — ErrorCallout component with per-action personality-driven copy banks. Error animation sequence (shake + flash + callout fade-in). Text caching and restore action on failed creates. Pending state error paths for all mutations (create, toggle, delete). Reduced-motion variant. Unit tests. E2E tests: create fails (input shakes, callout appears, text recoverable), toggle fails (item shakes, callout), delete fails (item shakes, callout).

3. **Story 3.3: Initial Load Error** — LoadError component with friendly copy and explicit retry CTA button. Replaces skeleton on fetch failure/timeout. Retry triggers new fetch attempt (returns to skeleton). Reduced-motion variant. Unit tests. E2E test: backend unavailable during page load shows LoadError, retry succeeds and content appears.

4. **Story 3.4: Graceful Degradation** — App shell renders when backend API is unavailable during ISR server render. Static layout (input, responsive column, design tokens) always loads. Appropriate error state shown in list area. Unit tests. E2E test: full Journey 4 covering all error types and recovery paths.

Does this breakdown work?

---

**User**

Yes

---

**Cursor**

Here are the full stories with acceptance criteria for Epic 3.

---

## Epic 3: Resilient Experience

User receives friendly, personality-driven error feedback when things go wrong. Loading states keep the interface composed. Failed creates preserve input. The app shell renders even when the API is unavailable.

---

### Story 3.1: Loading State & Skeleton Loader

As a user,
I want to see a calm, composed loading state while my todos are being fetched,
So that I know my data is on its way and the app feels alive rather than frozen.

**Acceptance Criteria:**

**Given** the initial page load
**When** the API fetch takes longer than ~200-300ms
**Then** a SkeletonLoader component is displayed in the list area

**Given** the SkeletonLoader
**When** displayed
**Then** it shows 3-4 placeholder rows mimicking TodoItem layout (rounded rectangle for checkbox + wider rectangle for text)

**Given** the SkeletonLoader
**When** animating
**Then** it displays a slow breathing pulse animation (~2.5s opacity oscillation cycle)

**Given** a user with `prefers-reduced-motion` enabled
**When** the SkeletonLoader is displayed
**Then** it shows a static low-opacity state instead of the breathing pulse

**Given** the list container
**When** the SkeletonLoader is active
**Then** `aria-busy="true"` is set on the list container with an `aria-label` indicating loading state

**Given** the API fetch completes successfully
**When** data arrives
**Then** the SkeletonLoader transitions smoothly to the real todo list content

**Given** the SkeletonLoader component
**When** unit tests are run
**Then** tests pass for render output, pulse animation class, reduced-motion variant, and ARIA attributes

**Given** E2E test for loading state
**When** the API response is delayed
**Then** the skeleton loader appears, and once data arrives, real content replaces it

---

### Story 3.2: Error Handling for Mutations

As a user,
I want friendly, helpful feedback when creating, completing, or deleting a todo fails,
So that I know what happened and can easily try again without losing my work.

**Acceptance Criteria:**

**Given** the ErrorCallout component
**When** rendered for a failed create
**Then** it displays personality-driven copy from the create error bank ("That one didn't stick. Give it another go?")

**Given** the ErrorCallout component
**When** rendered for a failed toggle
**Then** it displays copy from the toggle error bank ("Hmm, couldn't update that one. Try again?")

**Given** the ErrorCallout component
**When** rendered for a failed delete
**Then** it displays copy from the delete error bank ("Wouldn't let go of that one. One more try?")

**Given** a mutation failure
**When** the error animation sequence plays
**Then** the affected element shakes (~300ms, 2-3 oscillations), flashes error color (~200ms), then the callout fades in (~150ms after shake completes)

**Given** a user with `prefers-reduced-motion` enabled
**When** a mutation fails
**Then** the error callout appears immediately with no shake or flash animation

**Given** the ErrorCallout
**When** inspected
**Then** it has `role="alert"` and is linked to its triggering element via `aria-describedby`

**Given** a failed create operation
**When** the error occurs
**Then** the user's typed text is cached internally and the error callout includes a restore action that puts the text back in the input

**Given** a failed create with text restored
**When** the user presses Enter again
**Then** the create is retried with the restored text

**Given** a failed toggle
**When** the user taps the checkbox again
**Then** the toggle is retried and the error callout clears on success

**Given** a failed delete
**When** the user taps the delete button again
**Then** the delete is retried and the error callout clears on success

**Given** a successful retry after any error
**When** the operation succeeds
**Then** the error callout fades out and the normal success animation plays

**Given** all error handling code
**When** unit tests are run
**Then** tests pass for ErrorCallout rendering (all 3 copy banks), error state management in useTodos, text cache/restore logic, and ARIA attributes

**Given** E2E test for failed create
**When** the API rejects a create request
**Then** the input shakes, error callout appears, and the user can recover their text and retry

**Given** E2E test for failed toggle
**When** the API rejects a toggle request
**Then** the item shakes, error callout appears near the item, and retry succeeds

**Given** E2E test for failed delete
**When** the API rejects a delete request
**Then** the item shakes, error callout appears near the item, and retry succeeds

---

### Story 3.3: Initial Load Error

As a user,
I want a friendly message with a retry option when my todo list can't be loaded,
So that I'm not left staring at a broken page and can easily try again.

**Acceptance Criteria:**

**Given** the initial API fetch fails or times out
**When** the SkeletonLoader has been showing
**Then** it is replaced by the LoadError component in the list area

**Given** the LoadError component
**When** displayed
**Then** it shows a centered friendly message ("Couldn't reach your todos. They're probably fine — want to try again?") with an explicit retry CTA button styled as primary (warm amber filled)

**Given** the LoadError component
**When** inspected
**Then** it has `role="alert"` for screen reader announcement and the retry button is keyboard-accessible

**Given** the retry CTA button
**When** the user clicks it
**Then** the LoadError is replaced by the SkeletonLoader and a new fetch attempt is initiated

**Given** a retry attempt
**When** the fetch succeeds
**Then** the skeleton transitions to the real todo list

**Given** a retry attempt
**When** the fetch fails again
**Then** the LoadError reappears with the same friendly message and retry option

**Given** the LoadError component
**When** unit tests are run
**Then** tests pass for render output, retry button functionality, and ARIA attributes

**Given** E2E test for load error
**When** the backend is unavailable during page load
**Then** the skeleton appears, then LoadError replaces it, retry button triggers a new attempt

**Given** E2E test for successful retry
**When** the backend becomes available and the user clicks retry
**Then** the skeleton reappears and real content loads successfully

---

### Story 3.4: Graceful Degradation

As a user,
I want the app to still render when the backend is down,
So that I see a working page rather than a broken or blank screen.

**Acceptance Criteria:**

**Given** the backend API is unavailable during ISR server render
**When** page.tsx attempts to fetch todos
**Then** the page renders gracefully with the static shell (layout, responsive column, design tokens, input area) intact

**Given** the server render fails to fetch data
**When** the page is delivered to the browser
**Then** the list area shows an appropriate error/empty state rather than a crash or blank page

**Given** the static shell
**When** rendered without API data
**Then** the TodoInput component and all app chrome remain interactive and visually correct

**Given** the client-side hydration
**When** the page loads with a failed server fetch
**Then** the useTodos hook handles the absence of initial data and displays the LoadError state

**Given** the app shell
**When** the backend recovers
**Then** the user can retry loading or create new todos normally

**Given** graceful degradation behavior
**When** unit tests are run
**Then** tests pass for page.tsx error handling during fetch, useTodos initialization without server data

**Given** Journey 4 (The Graceful Stumble) full E2E test
**When** the test exercises all error types: initial load failure with retry, create failure with text recovery, toggle failure with retry, delete failure with retry
**Then** all error states show friendly messages, all retry paths succeed, and no data is lost

---

That's all 4 stories for Epic 3. All 4 FRs covered (FR9, FR13, FR14, FR15), each story independently testable. Ready to save and move to Epic 4, or any adjustments?

---

**User**

Yes, move on

---

**Cursor**

Epic 3 saved — 4 stories, all 4 FRs covered (FR9, FR13, FR14, FR15). Now Epic 4.

---

## Epic 4: Accessibility & Polish

**Goal:** Every user — mobile, desktop, keyboard-only, or using assistive technology — gets a fully functional, polished experience. Purposeful animations bring every interaction to life.

**FRs covered:** FR16, FR17, FR18, FR19
**Delivers:** Cross-cutting quality bar across all journeys

**Relevant NFRs:** NFR6-12 (WCAG 2.1 AA, Lighthouse A11y 90+, keyboard, screen readers, contrast, focus indicators, no color-only info), NFR18 (80% coverage verification)
**Relevant UX-DRs:** UX-DR12 (entrance animation), UX-DR13 (anticipation animation), UX-DR14 (reduced-motion completeness), UX-DR15 (focus management — routing after actions), UX-DR16 (keyboard interactions), UX-DR17 (complete ARIA pattern — aria-live, skip link), UX-DR19 (responsive — mobile no-auto-focus, touch targets)

Epics 1-3 built every component with basic accessibility (semantic HTML, ARIA attributes, keyboard handlers). This epic does the comprehensive pass. Proposing **3 stories**:

1. **Story 4.1: Keyboard Navigation & Focus Management** — Full focus routing after actions (add→input, delete→next item, complete→next active, uncomplete→input), Escape to clear input + blur, skip link to main content, card-level focus ring (entire card shows ring when child focused), auto-focus input on desktop only (not mobile). Unit tests. E2E test: complete keyboard-only flow through all 4 journeys.

2. **Story 4.2: Screen Reader & ARIA Completeness** — `aria-live="polite"` region for dynamic list changes, verify `aria-describedby` linking across all error states, verify `aria-checked` updates on toggle, verify all `role` attributes, ensure no information conveyed by color alone (FR7 uses strikethrough + position + opacity). Unit tests. E2E test: ARIA state verification across add/complete/delete/error flows.

3. **Story 4.3: Responsive Verification & Entrance Animation** — Entrance slide-in animation for new todos (ease-out, ~250ms), anticipation animation for slow-network creates, mobile-specific refinements (no auto-focus, touch target verification at 44px minimum, delete button opacity behavior), responsive E2E across 3 viewports (375px, 768px, 1280px) for all journeys. Final coverage verification against NFR18 80% target.

Does this work?

---

**User**

Yes

---

**Cursor**

Here are the full stories with acceptance criteria for Epic 4.

---

## Epic 4: Accessibility & Polish

Every user — mobile, desktop, keyboard-only, or using assistive technology — gets a fully functional, polished experience. Purposeful animations bring every interaction to life with reduced-motion alternatives.

---

### Story 4.1: Keyboard Navigation & Focus Management

As a user who navigates with a keyboard,
I want to perform all todo operations without a mouse,
So that the app is fully usable with keyboard alone.

**Acceptance Criteria:**

**Given** the page loads on desktop
**When** the input field is rendered
**Then** it receives auto-focus so the user can start typing immediately

**Given** the page loads on mobile
**When** the input field is rendered
**Then** it does not auto-focus (to avoid triggering the on-screen keyboard)

**Given** a skip link
**When** the user presses Tab on page load
**Then** a "Skip to main content" link appears as the first focusable element, and activating it moves focus to the main content area

**Given** any interactive element within a TodoItem (checkbox or delete button)
**When** it receives keyboard focus
**Then** the entire card container displays the accent-colored focus ring (card-level focus, not individual control)

**Given** the user presses Enter in the input
**When** a todo is successfully created
**Then** focus returns to the input field (ready for next entry)

**Given** the user presses Enter/Space on a delete button
**When** the todo is successfully deleted
**Then** focus moves to the next item's checkbox, or the previous item's checkbox if the last item was deleted

**Given** the user presses Space on an active todo's checkbox
**When** the todo is successfully completed
**Then** focus moves to the next active item's checkbox, or to the input field if no active items remain

**Given** the user presses Space on a completed todo's checkbox
**When** the todo is successfully uncompleted
**Then** focus moves to the input field

**Given** the user presses Escape while the input has text
**When** the Escape key is handled
**Then** the input text is cleared and the input is blurred

**Given** the full tab order
**When** the user presses Tab sequentially
**Then** focus moves through: input → first active item checkbox → first active item delete → second active item checkbox → ... → first completed item checkbox → ... → retry CTA (if visible)

**Given** all focus management logic
**When** unit tests are run
**Then** tests pass for auto-focus behavior, focus routing after each action type, Escape handling, and skip link

**Given** E2E test for keyboard-only flow
**When** a user navigates the entire app using only Tab, Shift+Tab, Enter, Space, and Escape
**Then** all operations (create, complete, uncomplete, delete) are achievable and focus lands on the correct element after each action

---

### Story 4.2: Screen Reader & ARIA Completeness

As a user who relies on a screen reader,
I want all state changes and interactive elements properly announced,
So that I can use the app with full confidence about what's happening.

**Acceptance Criteria:**

**Given** the todo list container
**When** items are added, removed, or reordered
**Then** an `aria-live="polite"` region announces the change to screen readers

**Given** all error callouts (ErrorCallout and LoadError)
**When** they appear
**Then** each has `role="alert"` and is announced immediately by screen readers

**Given** all error callouts
**When** linked to their triggering elements
**Then** `aria-describedby` correctly references the callout from the triggering element

**Given** a todo's checkbox
**When** toggled between complete and active
**Then** `aria-checked` updates to reflect the current state and the change is announced

**Given** each delete button
**When** inspected
**Then** it has an accessible name that includes the todo text (e.g., "Delete: pick up dry cleaning")

**Given** the EmptyState component
**When** displayed
**Then** it has `role="status"` and is announced by screen readers

**Given** the completed section divider
**When** displayed
**Then** it has `role="separator"` and is recognizable by assistive technology

**Given** the SkeletonLoader
**When** active
**Then** the list container has `aria-busy="true"` and an appropriate `aria-label`

**Given** completed todos
**When** inspected for information conveyed by color alone
**Then** completed status is communicated through strikethrough text, position below divider, and reduced opacity — not color alone (NFR12)

**Given** all interactive elements
**When** inspected
**Then** each has a descriptive `aria-label` where semantic HTML alone is insufficient

**Given** all ARIA attributes
**When** unit tests are run
**Then** tests pass verifying aria-live region, aria-checked toggling, aria-describedby linking, aria-busy states, and all role attributes

**Given** E2E test for ARIA state verification
**When** the test performs add, complete, uncomplete, delete, and error recovery flows
**Then** all ARIA attributes update correctly at each step, verified through Playwright accessibility assertions

---

### Story 4.3: Responsive Verification & Entrance Animation

As a user on any device,
I want the app to look and work beautifully whether I'm on my phone, tablet, or desktop,
So that I get a polished experience regardless of how I access it.

**Acceptance Criteria:**

**Given** a new todo is created
**When** it appears in the list
**Then** it slides in with an entrance animation (ease-out, ~250ms)

**Given** a create operation on a slow network
**When** the API call is in flight
**Then** an anticipation animation (subtle space-opening or placeholder pulse) plays in the list area where the new item will land

**Given** a user with `prefers-reduced-motion` enabled
**When** a new todo is created
**Then** the item appears immediately with no slide-in or anticipation animation

**Given** the app at mobile viewport (375px)
**When** inspected
**Then** content fills viewport width with 16-24px horizontal padding, no horizontal scrolling, and no auto-focus on input

**Given** the app at mobile viewport
**When** interactive elements are measured
**Then** all touch targets meet the 44px minimum size through generous padding

**Given** the app at mobile viewport
**When** the delete button is rendered
**Then** it displays at its resting low-opacity state (no hover enhancement available)

**Given** the app at tablet viewport (768px)
**When** inspected
**Then** layout matches mobile with wider padding, centered narrow column

**Given** the app at desktop viewport (1280px)
**When** inspected
**Then** content is centered with natural margins, auto-focus is active on the input, and hover effects work on todo items (lift) and delete buttons (opacity increase)

**Given** all four user journeys
**When** E2E tests run at 3 viewports (375px, 768px, 1280px)
**Then** all journeys (first visit, quick capture, review and tidy, error recovery) pass at every viewport size

**Given** the complete test suite
**When** code coverage is measured
**Then** combined unit, integration, and E2E coverage meets or exceeds 80% (NFR18)

**Given** all entrance/anticipation animation code
**When** unit tests are run
**Then** tests pass for animation class application, reduced-motion variant, and timing

---

That's all 3 stories for Epic 4. All 4 FRs covered (FR16, FR17, FR18, FR19). That completes all 4 epics — 19 stories total. Any adjustments before I save and move to final validation?

---

**User**

No more adjustments

---

**Cursor**

Now let me update the frontmatter and verify all requirements are covered before moving to validation.

All 4 epics saved — **19 stories total** across 4 epics, covering all 19 FRs. Here's the final summary:

| Epic | Stories | FRs | Journey |
|---|---|---|---|
| Epic 1: Project Foundation & Todo Creation | 9 stories (1.1–1.9) | FR1, FR2, FR6, FR8, FR10, FR11, FR12 | Journey 1 & 2 |
| Epic 2: Complete Todo Lifecycle | 3 stories (2.1–2.3) | FR3, FR4, FR5, FR7 | Journey 3 |
| Epic 3: Resilient Experience | 4 stories (3.1–3.4) | FR9, FR13, FR14, FR15 | Journey 4 |
| Epic 4: Accessibility & Polish | 3 stories (4.1–4.3) | FR16, FR17, FR18, FR19 | Cross-cutting |

**Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Continue

---

**User**

c

---

**Cursor**

Let me run through the full validation checklist.

---

## Final Validation

### 1. FR Coverage Validation

| FR | Story Coverage | Acceptance Criteria Addresses FR? |
|---|---|---|
| FR1: Create todo | Story 1.9 | Yes — input, Enter submit, API call, item appears |
| FR2: View all todos | Story 1.9 | Yes — TodoList renders all todos newest-first |
| FR3: Mark complete | Story 2.1 | Yes — checkbox toggle, PATCH call, completed styling |
| FR4: Unmark complete | Story 2.1 | Yes — reverse toggle, strikethrough removed |
| FR5: Delete todo | Story 2.3 | Yes — delete button, DELETE call, item removed |
| FR6: Display text/status/timestamp | Story 1.9 | Yes — TodoItem card with text, relative timestamp |
| FR7: Distinguish completed | Story 2.1 + 2.2 | Yes — strikethrough, opacity, divider separation |
| FR8: Empty state | Story 1.8 | Yes — EmptyState with personality-driven copy |
| FR9: Loading state | Story 3.1 | Yes — SkeletonLoader with breathing pulse |
| FR10: Persist across sessions | Stories 1.3, 1.4, 1.8 | Yes — API storage + ISR serves persisted data |
| FR11: Store text/status/timestamp | Stories 1.1, 1.2 | Yes — Zod schemas + Drizzle schema with all fields |
| FR12: CRUD API | Stories 1.3–1.6 | Yes — all 4 endpoints individually |
| FR13: Error messages | Story 3.2 | Yes — ErrorCallout with per-action copy banks |
| FR14: Retry without data loss | Story 3.2 | Yes — text caching, restore action, gesture retry |
| FR15: App shell without API | Story 3.4 | Yes — graceful degradation, static shell renders |
| FR16: Mobile operations | Story 4.3 | Yes — responsive E2E at 375px |
| FR17: Desktop operations | Story 4.3 | Yes — responsive E2E at 1280px |
| FR18: Keyboard operations | Story 4.1 | Yes — full keyboard flow, focus routing |
| FR19: Assistive technologies | Story 4.2 | Yes — complete ARIA pattern, screen reader verification |

**All 19 FRs covered. No gaps.**

### 2. Architecture Implementation Validation

- **Starter template:** Architecture specifies monorepo with npm workspaces + create-next-app + Fastify. Story 1.1 scaffolds the monorepo and shared contract. Story 1.2 scaffolds the backend. Story 1.7 scaffolds the frontend. Each is a separate story per Kevin's request.
- **Database creation:** Todos table created in Story 1.2 alongside the backend foundation — the first story that needs it. Only 1 table in the entire app. No upfront multi-table creation.

### 3. Story Quality Validation

- All 19 stories sized for single dev agent completion
- All stories use Given/When/Then acceptance criteria
- All stories reference their FRs through epic descriptions and coverage map
- No story references features from future stories

### 4. Epic Structure Validation

- Epic 1: Users can create and view todos (user value)
- Epic 2: Users can manage their todo lifecycle (user value)
- Epic 3: Users get friendly error handling (user value)
- Epic 4: Every user gets an accessible, polished experience (user value)
- No epics organized by technical layers

### 5. Dependency Validation

**Epic independence:**
- Epic 1 standalone — full create/view working app
- Epic 2 builds on Epic 1, works without Epic 3 or 4
- Epic 3 builds on Epics 1+2, works without Epic 4
- Epic 4 builds on all, delivers cross-cutting quality

**Within-epic story flow (no forward dependencies):**
- 1.1→1.2→1.3→1.4→1.5→1.6→1.7→1.8→1.9: Each builds only on prior stories
- 2.1→2.2→2.3: Each builds only on prior stories
- 3.1→3.2→3.3→3.4: Each builds only on prior stories
- 4.1→4.2→4.3: Each builds only on prior stories

### 6. UX-DR Coverage

All 22 UX Design Requirements traced to specific stories:
- UX-DR1–4 (font, tokens, colors, shadows) → Story 1.7
- UX-DR5–8 (TodoInput, TodoItem, TodoList, EmptyState) → Stories 1.8, 1.9, 2.1, 2.2, 2.3
- UX-DR9–11 (Skeleton, ErrorCallout, LoadError) → Stories 3.1, 3.2, 3.3
- UX-DR12–14 (animations, anticipation, reduced-motion) → Stories 2.1, 2.2, 2.3, 3.1, 3.2, 4.3
- UX-DR15–17 (focus, keyboard, ARIA) → Stories 4.1, 4.2
- UX-DR18–22 (buttons, responsive, pending states, no-title, personality copy) → Distributed across Epics 1–4

---

**All validations pass. The epics and stories are ready for development.**

**All validations complete!** [C] Complete Workflow

---

**User**

c

---

**Cursor**

Epics and stories workflow complete. Your `epics.md` is saved and ready for development at `_bmad-output/planning-artifacts/epics.md`.

---

## What You Built

**4 epics, 19 stories** covering all 19 FRs, 22 UX-DRs, and 20 NFRs for todo-bmad:

| Epic | Stories | What It Delivers |
|---|---|---|
| Epic 1: Project Foundation & Todo Creation | 9 stories | Full-stack setup, backend API, frontend with ISR, create & view todos |
| Epic 2: Complete Todo Lifecycle | 3 stories | Complete, uncomplete, delete with animations and divider |
| Epic 3: Resilient Experience | 4 stories | Loading states, error handling, graceful degradation |
| Epic 4: Accessibility & Polish | 3 stories | Keyboard nav, screen reader support, responsive verification |

Tests are woven into every story — no deferred testing. Each story is a single-concern PR.

---

## What's Next

Your next required step is **Check Implementation Readiness** (`bmad-bmm-check-implementation-readiness`). This validates that the PRD, UX, Architecture, and Epics/Stories are all aligned before you start building. I'd recommend running it in a **fresh context window**, and if you have access to a different high-quality LLM, using that for an independent perspective.

After readiness is confirmed, you'll move to **Sprint Planning** where Bob the Scrum Master generates the sprint execution plan.

Any questions about the epics and stories?

