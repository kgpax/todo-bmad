---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
status: 'complete'
completedAt: '2026-03-16'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# todo-bmad - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for todo-bmad, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: User can create a new todo by entering a text description
FR2: User can view all existing todos in a single list
FR3: User can mark a todo as complete
FR4: User can unmark a completed todo to restore it to active
FR5: User can delete a todo permanently
FR6: Each todo displays its text description, completion status, and creation timestamp
FR7: User can distinguish completed todos from active todos at a glance
FR8: User can see an appropriate empty state when no todos exist
FR9: User can see a loading state while data is being fetched
FR10: Todos persist across browser sessions and page refreshes
FR11: System stores each todo with its text, completion status, and creation timestamp
FR12: System exposes a CRUD API for todo operations
FR13: User can see a clear error message when an operation fails
FR14: User can retry a failed operation without losing their input
FR15: System renders the application shell even when the API is unavailable
FR16: User can perform all todo operations on mobile devices
FR17: User can perform all todo operations on desktop devices
FR18: User can perform all todo operations using only a keyboard
FR19: User can interact with the application using assistive technologies (screen readers)

### NonFunctional Requirements

NFR1: All user-initiated actions (create, complete, delete) must reflect in the UI within 1 second under normal network conditions
NFR2: Initial page load must achieve a Lighthouse Performance score of 90+
NFR3: First Contentful Paint under 1 second, Largest Contentful Paint under 1.5 seconds
NFR4: Cumulative Layout Shift below 0.1
NFR5: Fingerprinted static assets minified, compressed, served with immutable cache headers; HTML uses short-lived or no-cache headers
NFR6: Application must meet WCAG 2.1 AA compliance
NFR7: Lighthouse Accessibility score of 90+
NFR8: All interactive elements reachable and operable via keyboard alone
NFR9: All core user journeys operable with screen readers (VoiceOver+Safari, NVDA+Chrome)
NFR10: Color contrast ratios minimum 4.5:1 for normal text, 3:1 for large text
NFR11: Focus indicators visible on all interactive elements with at least 3:1 contrast
NFR12: No information conveyed by color alone
NFR13: API inputs validated and sanitized to prevent injection attacks
NFR14: User-supplied text escaped or sanitized before rendering to prevent XSS
NFR15: API responses must not expose internal system details in error messages
NFR16: HTTPS for all client-server communication in all deployed environments
NFR17: API rejects malformed requests, descriptions exceeding 128 characters, bodies exceeding 10KB
NFR18: Minimum 80% code coverage across unit, integration, and E2E tests combined
NFR19: All automated tests pass in three consecutive CI runs with no flaky tests
NFR20: E2E tests cover all four core user journeys

### Additional Requirements

- Starter template: npm workspaces monorepo with 3 packages (frontend: Next.js 16 via create-next-app + shadcn/ui, backend: Fastify + Drizzle ORM + better-sqlite3, shared: Zod schemas + TypeScript types)
- Shared Zod validation schemas in packages/shared/ used by both frontend and backend as single source of truth (createTodoSchema, updateTodoSchema, todoSchema)
- Data model: Single todos table (id TEXT UUID v4, text TEXT max 128 chars, completed INTEGER boolean, created_at TEXT ISO 8601)
- API contract: REST endpoints (GET /api/todos, POST /api/todos, PATCH /api/todos/:id, DELETE /api/todos/:id, POST /api/revalidate)
- Error response format: { error: string, message: string } with machine-readable codes (VALIDATION_ERROR, NOT_FOUND, INTERNAL_ERROR)
- ISR rendering strategy: Server component fetches todos, passes to client TodoPage component; revalidatePath('/') after mutations via Server Action
- Custom useTodos() hook with per-item pending state pattern (pendingAction, error metadata per item)
- Frontend structure: Flat components/ directory with co-located tests, hooks/, lib/, config/
- Environment configuration: .env.local (frontend: NEXT_PUBLIC_API_URL, API_URL, REVALIDATION_SECRET), .env (backend: PORT, DATABASE_PATH, CORS_ORIGIN, REVALIDATION_SECRET)
- CORS: @fastify/cors configured to whitelist frontend origin
- XSS prevention: Server sanitizes todo text on write (strip HTML tags), React JSX escaping on render
- Database migrations: Drizzle Kit versioned SQL files, auto-applied on backend startup
- Logging: Fastify built-in Pino logger with structured JSON and request ID tracking
- Test placement: Co-located unit/integration tests with source files; E2E in root-level e2e/ directory (one file per journey)
- Named exports only (except Next.js required default exports for page.tsx, layout.tsx)
- Import ordering enforced by ESLint (external packages → internal packages → project-relative → side-effects)
- 10 enforcement rules for AI agent consistency defined in architecture
- TypeScript strict mode across all packages with shared tsconfig.base.json
- Drizzle maps snake_case SQL columns to camelCase TypeScript properties
- All API JSON fields use camelCase; error codes use UPPER_SNAKE_CASE

### UX Design Requirements

UX-DR1: Implement Outfit typeface via Google Fonts with Latin subset for font performance (subsetting required for Lighthouse targets)
UX-DR2: Implement CSS custom properties design token system covering: colors (background, surface, text primary/secondary/placeholder, accent, error, success), shadows (resting, hover, focus), spacing (8px base unit multiples: 8, 16, 24, 32, 48, 64), border radii, and motion tokens (durations: fast 150ms, normal 250ms, slow 400ms, shake 300ms; easings: ease-out, ease-in, ease-in-out with defined cubic-bezier values)
UX-DR3: Implement warm color palette: warm off-white background with cream undertone, warm charcoal primary text, medium warm gray secondary text, lighter warm gray placeholder text, warm amber primary accent (checkbox fill, focus ring, submit button), muted warm success tone, warm but noticeable error tone
UX-DR4: Implement card-per-item visual treatment (Warm Depth direction) with shadow depth system: resting shadow (default), hover shadow with lift effect (translateY -1px + deeper shadow, desktop only), focus shadow (accent-colored ring)
UX-DR5: Implement TodoInput component as hero card element with: shadow depth matching item cards, accent-colored focus ring with elevated shadow on focus, contextual placeholder rotation across 3 banks (empty list ~5 variations, has items ~5 variations, just added ~5 variations), optional submit button as secondary affordance for touch/accessibility
UX-DR6: Implement TodoItem component as individual card with: checkbox (rounded square 8px radius, warm amber fill on checked with custom check animation), text content area, relative timestamp display ("just now", "2m ago", "1h ago", "3d ago", date fallback after ~7 days), and delete button (always visible at low opacity ~0.3-0.4, full opacity on hover/focus, shifts to warm error color on hover/focus)
UX-DR7: Implement TodoList component with active items section (newest first) above completed items section (most recently completed first), separated by a labeled "Completed" divider (horizontal rule with small uppercase label, role="separator", appears/disappears based on completed item existence)
UX-DR8: Implement EmptyState component as centered card with personality-driven copy (warm, inviting messages, role="status")
UX-DR9: Implement SkeletonLoader component with 3-4 placeholder rows mimicking TodoItem layout, breathing pulse animation (~2.5s opacity oscillation cycle), appears after ~200-300ms delay threshold, aria-busy="true" on list container
UX-DR10: Implement ErrorCallout component with: warm error color, personality-driven per-action copy bank (add: "That one didn't stick. Give it another go?", complete: "Hmm, couldn't update that one. Try again?", delete: "Wouldn't let go of that one. One more try?"), subtle fade-in after shake completes, linked via aria-describedby, role="alert"
UX-DR11: Implement LoadError component with: centered friendly copy ("Couldn't reach your todos. They're probably fine — want to try again?"), explicit retry CTA button (primary style), replaces skeleton on fetch failure/timeout, role="alert"
UX-DR12: Implement 6 animation types: (1) entrance slide-in for new todos (ease-out, ~250ms), (2) completion-migration with strikethrough + smooth item migration down past divider (ease-in-out, ~400ms), (3) uncomplete-migration with strikethrough reversal + item migration up past divider (ease-in-out, ~400ms), (4) deletion slide-out + smooth gap close (ease-in, ~250ms), (5) skeleton breathing pulse (opacity oscillation, ~2.5s cycle), (6) error sequence: shake (~300ms, 2-3 oscillations) + error color flash (~200ms) + callout fade-in (~150ms)
UX-DR13: Implement anticipation animation for new item creation on slow networks (subtle space-opening or placeholder pulse in list area where new item will land)
UX-DR14: Implement prefers-reduced-motion support: all animations replaced with instant state changes (opacity/color transitions at duration-fast or none), skeleton uses static low-opacity state instead of pulse
UX-DR15: Implement focus management: auto-focus input on desktop page load (not mobile to avoid keyboard auto-open), card-level focus ring (entire card shows accent ring when any child element focused), focus routing after actions (add→input, delete→next item checkbox or previous if last, complete→next active item checkbox or input if none remain, uncomplete→input)
UX-DR16: Implement keyboard interactions: Enter in input (submit todo), Space on checkbox (toggle completion), Enter/Space on delete button (delete item), Tab/Shift+Tab (sequential navigation), Escape in input (clear text and blur)
UX-DR17: Implement complete ARIA pattern: aria-label on all interactive elements, aria-checked on checkboxes, aria-describedby linking errors to triggering elements, aria-busy="true" on list during loading, aria-live="polite" region for dynamic list changes, role="alert" on error callouts and load error, role="status" on empty state, role="separator" on completed divider, role="list"/role="listitem" on list structure, skip link to main content
UX-DR18: Implement button hierarchy: primary (warm amber filled) for submit and retry CTA, destructive (subtle low opacity at rest, full opacity + warm error color on hover/focus) for delete, tertiary (text-style with underline or accent color) for inline retry in callouts
UX-DR19: Implement responsive layout: centered narrow column (max-width ~600-640px), mobile-first breakpoints (base 320px+ full-width with 16-24px horizontal padding, 768px+ wider padding, 1024px+ centered with margins + auto-focus enabled + hover effects active), no layout reflow between breakpoints
UX-DR20: Implement pending state UX per-item: creating (input clears immediately, text cached internally, anticipation animation in list area), toggling (checkbox pending indicator with pulse/dim), deleting (item pending indicator with dim); on create failure, error callout includes restore action to recover cached input text
UX-DR21: Implement no-title design: no app heading/title, input field is the visual anchor and most prominent element on the page, purpose communicated through layout and interaction
UX-DR22: Implement personality-driven error copy with warm, slightly playful tone across all error states. Specific copy banks defined for each error type in ErrorCallout and LoadError components.

### FR Coverage Map

FR1: Epic 1 - Create a new todo by entering text
FR2: Epic 1 - View all existing todos in a single list
FR3: Epic 2 - Mark a todo as complete
FR4: Epic 2 - Unmark a completed todo to restore it to active
FR5: Epic 2 - Delete a todo permanently
FR6: Epic 1 - Display text, completion status, and timestamp
FR7: Epic 2 - Distinguish completed from active at a glance
FR8: Epic 1 - Empty state when no todos exist
FR9: Epic 3 - Loading state while data is being fetched
FR10: Epic 1 - Todos persist across sessions and refreshes
FR11: Epic 1 - Store text, completion status, and timestamp
FR12: Epic 1 - CRUD API for todo operations
FR13: Epic 3 - Clear error message when operation fails
FR14: Epic 3 - Retry failed operation without losing input
FR15: Epic 3 - App shell renders without API
FR16: Epic 4 - All operations on mobile devices
FR17: Epic 4 - All operations on desktop devices
FR18: Epic 4 - All operations using keyboard only
FR19: Epic 4 - Interaction via assistive technologies

## Epic List

### Epic 1: Project Foundation & Todo Creation
User can open the app, see an inviting empty state, create a todo, and see it appear in a persistent list. Returning users see their existing todos immediately on page load.
**FRs covered:** FR1, FR2, FR6, FR8, FR10, FR11, FR12
**Journeys delivered:** Journey 1 (First Visit), Journey 2 (Quick Capture)
**Testing:** Unit/integration tests for all backend routes, shared schemas, frontend components, hooks, and API client. E2E tests for Journey 1 and Journey 2.

### Epic 2: Complete Todo Lifecycle
User can complete, uncomplete, and delete todos. Active and completed items are visually distinct, separated by a labeled divider, with smooth migration animations as items move between sections.
**FRs covered:** FR3, FR4, FR5, FR7
**Journeys delivered:** Journey 3 (Review and Tidy)
**Testing:** Unit tests for updated components and hook behavior. E2E test for Journey 3.

### Epic 3: Resilient Experience
User receives friendly, personality-driven error feedback when things go wrong. Loading states keep the interface composed. Failed creates preserve input. The app shell renders even when the API is unavailable.
**FRs covered:** FR9, FR13, FR14, FR15
**Journeys delivered:** Journey 4 (The Graceful Stumble)
**Testing:** Unit tests for all error/loading components. E2E test for Journey 4. Integration tests for API error responses.

### Epic 4: Accessibility & Polish
Every user — mobile, desktop, keyboard-only, or using assistive technology — gets a fully functional, polished experience. Purposeful animations bring every interaction to life with reduced-motion alternatives.
**FRs covered:** FR16, FR17, FR18, FR19
**Journeys delivered:** Cross-cutting quality bar across all journeys
**Testing:** Accessibility-focused E2E tests (keyboard-only full flow, ARIA state verification). Final coverage verification against NFR18 80% target.

## Epic 1: Project Foundation & Todo Creation

User can open the app, see an inviting empty state, create a todo, and see it appear in a persistent list. Returning users see their existing todos immediately on page load.

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

## Epic 2: Complete Todo Lifecycle

User can complete, uncomplete, and delete todos. Active and completed items are visually distinct, separated by a labeled divider, with smooth migration animations as items move between sections.

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

## Epic 3: Resilient Experience

User receives friendly, personality-driven error feedback when things go wrong. Loading states keep the interface composed. Failed creates preserve input. The app shell renders even when the API is unavailable.

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

## Epic 4: Accessibility & Polish

Every user — mobile, desktop, keyboard-only, or using assistive technology — gets a fully functional, polished experience. Purposeful animations bring every interaction to life with reduced-motion alternatives.

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
