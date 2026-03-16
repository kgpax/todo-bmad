---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-03-16'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/ux-design-directions.html
workflowType: 'architecture'
project_name: 'todo-bmad'
user_name: 'Kevin'
date: '2026-03-16'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
19 FRs across 5 categories. The entire functional surface is CRUD operations on a single `todo` entity (create, read, complete/uncomplete, delete) with supporting visualization states (empty, loading, error). No search, no filtering, no sorting by user — list ordering is fixed (active newest-first above, completed most-recently-completed-first below). The simplicity of the data model means architectural decisions center on execution quality rather than data complexity.

**Non-Functional Requirements:**
20 NFRs form the actual engineering challenge. Performance (Lighthouse 90+, FCP <1s, LCP <1.5s, CLS <0.1), accessibility (WCAG 2.1 AA, keyboard-only operation, screen reader compatibility), security (input validation/sanitization, XSS prevention, HTTPS, request size limits), and testing (80% coverage, zero flaky tests, E2E covering all 4 user journeys) are all hard constraints that must be architected for from the start — not retrofitted.

**Scale & Complexity:**

- Primary domain: Full-stack web (Next.js ISR frontend + backend REST API)
- Complexity level: Low
- Estimated architectural components: ~8-10 (frontend app shell, 6 UI components, API client layer, backend API, data storage)

### Technical Constraints & Dependencies

- Frontend framework must support ISR (Incremental Static Regeneration) with server-side data fetching and client-side hydration for dynamic CRUD operations
- shadcn/ui + Radix UI primitives for accessible component foundations (prescribed by UX spec)
- Tailwind CSS for utility-first styling with design tokens as CSS custom properties
- Outfit typeface via Google Fonts (web font performance implications for Lighthouse targets)
- Single-user, no authentication in MVP — simplifies backend significantly but the API should not be designed in a way that makes auth impossible to add later
- No offline write capability — static shell renders without API, but mutations require connectivity
- HTTPS required in all deployed environments including preview
- Todo description max 128 characters, request body max 10KB — enforced server-side (note: PRD NFR17 references 1024 characters — architecture overrides this to 128 per stakeholder decision)
- Light mode only for MVP, but CSS custom properties must support future dark mode addition

### Cross-Cutting Concerns Identified

- **Pending state UI pattern:** Every mutation (create, complete, uncomplete, delete) shows a pending indicator while waiting for API confirmation. On success, the UI updates and plays the appropriate animation. On failure, the pending state clears and a scoped error callout appears. This pattern must be consistent across all operations and integrated with the animation system.
- **Animation system:** 6 animation types (entrance, completion-migration, deletion, skeleton-pulse, shake/flash-error, anticipation) with shared motion tokens and `prefers-reduced-motion` variants. Animations are tightly coupled to state transitions — the architecture must support triggering animations in response to confirmed state changes and error events.
- **Error handling strategy:** Scoped per-action (not global). Each mutation failure produces a localized shake + callout. Initial load failure has its own full-area treatment. Error copy is personality-driven with a defined bank. The retry mechanism reuses the original gesture (no explicit retry button except for initial load).
- **Accessibility pervasiveness:** WCAG 2.1 AA touches every component — ARIA attributes, focus management after state changes, keyboard tab order, color contrast, `role="alert"` for errors, `aria-busy` for loading, `role="separator"` for divider. This is not a layer — it's woven into every architectural decision.
- **Design token system:** Colors, shadows, spacing (8px base), border radii, and motion tokens defined as CSS custom properties. Shared across all components. Must be structured for future dark mode extension.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack TypeScript web application — Next.js frontend with ISR (server-rendered with on-demand revalidation) and a separate REST API backend (Fastify) with embedded database (SQLite).

### Technical Preferences Discovered

- **Language:** TypeScript (100%, both frontend and backend)
- **User skill level:** Intermediate — strong frontend, less backend experience
- **Frontend framework:** Next.js (user preference, aligns with shadcn/ui requirement)
- **Backend approach:** Separate service (not bundled with frontend)
- **Database requirement:** Portable, standalone, local-first (no cloud dependency)
- **Testing:** Jest for unit/integration, Playwright for E2E (user preferences)
- **Deployment:** No specific preference yet

### Starter Options Considered

**Frontend:**
- **Next.js 16 via create-next-app** — Official scaffolding with TypeScript, Tailwind CSS, App Router, ESLint, and Turbopack. shadcn/ui has a dedicated `init` command for Next.js projects. Selected as the only viable option given UX spec constraints (shadcn/ui + Tailwind + React).

**Backend frameworks evaluated:**
- **Express** — Familiar to user but weakest TypeScript support, requires additional middleware for validation, testing requires Supertest + server lifecycle management. Rejected: heavier than needed, weaker DX.
- **Fastify** — First-class TypeScript, built-in JSON Schema validation, `.inject()` method for server-free testing, ~2-3x Express performance, mature plugin ecosystem. **Selected:** best balance of lightweight design, TypeScript DX, testability, and ecosystem maturity.
- **Hono** — Ultra-lightweight, excellent TypeScript, but newer ecosystem with fewer community resources. Strong candidate but Fastify offers more guardrails for backend-learning context.

**Database options evaluated:**
- **PostgreSQL** — Production-grade but requires a running server or Docker container. Rejected: violates portable/standalone requirement.
- **SQLite via better-sqlite3 + Drizzle ORM** — Single-file database, zero infrastructure, type-safe schema and queries via Drizzle, migration support built in. **Selected:** perfectly matches portable/standalone requirement with excellent TypeScript DX.

### Selected Stack

**Frontend initialization:**

```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --use-npm
cd frontend
npx shadcn@latest init
```

**Backend initialization:**

```bash
mkdir backend && cd backend
npm init -y
npm install fastify @fastify/cors
npm install drizzle-orm better-sqlite3
npm install -D typescript @types/node @types/better-sqlite3 drizzle-kit tsx
npm install -D jest ts-jest @types/jest
```

**Project structure:**

```
todo-bmad/
├── packages/
│   ├── frontend/          (Next.js 16 + shadcn/ui + Tailwind)
│   ├── backend/           (Fastify + Drizzle ORM + SQLite)
│   └── shared/            (TypeScript types — API contract)
├── package.json           (npm workspaces root)
├── playwright.config.ts   (E2E tests)
└── tsconfig.base.json     (shared TypeScript config)
```

### Architectural Decisions Provided by Starter

**Language & Runtime:**
TypeScript (strict mode) across all packages. Shared `tsconfig.base.json` with per-package extensions. Node.js runtime for backend, Next.js runtime for frontend.

**Styling Solution:**
Tailwind CSS v4 via create-next-app defaults. CSS custom properties for design tokens. shadcn/ui components as owned source code (not external dependency).

**Build Tooling:**
Next.js with Turbopack for frontend dev/build. tsx for backend development, tsc for backend production builds. Drizzle Kit for database migrations.

**Testing Framework:**
Jest with ts-jest for unit and integration tests (frontend components, backend routes via Fastify `.inject()`). Playwright for E2E tests covering all 4 user journeys across mobile/tablet/desktop viewports.

**Code Organization:**
npm workspaces monorepo with 3 packages. Shared types package ensures API contract consistency between frontend and backend at compile time.

**Development Experience:**
Turbopack hot reload for frontend. tsx watch mode for backend. SQLite file-based database requires zero setup. All tools run locally with no cloud dependencies.

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data model and schema design (todo entity with UUID, text, completed, createdAt)
- API contract (REST endpoints, request/response shapes, error format)
- Validation strategy (Zod schemas shared between frontend and backend)
- State management approach (custom useTodos hook with pending state pattern)
- Rendering strategy: ISR with server-side data fetching (not pure static export)

**Important Decisions (Shape Architecture):**
- Per-item pending/error state for scoped feedback UX
- API client as typed fetch wrapper (not generated SDK)
- Component file organization (flat components directory)
- On-demand revalidation triggered by frontend after mutations
- Environment configuration pattern

**Deferred Decisions (Post-MVP):**
- Authentication and authorization
- Deployment platform selection
- CI/CD pipeline
- Monitoring and alerting
- API versioning
- Dark mode token set
- Offline capability

### Data Architecture

**Schema: Single `todos` table**

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | Primary key (UUID v4, generated server-side) |
| text | TEXT | NOT NULL, max 128 characters |
| completed | INTEGER (boolean) | NOT NULL, default false |
| created_at | TEXT | NOT NULL, ISO 8601 timestamp |

**Character limit: 128** (architectural override of PRD NFR17 which specifies 1024). This limit reflects the intended use — short, single-line task descriptions — and keeps the UI clean without text wrapping concerns.

**Validation:** Zod schemas in `shared` package. Used by Fastify (via `fastify-type-provider-zod`) for automatic request validation and by the frontend API client for pre-flight validation. Single source of truth for: text length (1-128 chars), text content (non-empty, trimmed), and completed boolean.

**Migrations:** Drizzle Kit generates versioned SQL migration files. Applied automatically on backend startup. Migration files version-controlled in the repository.

**IDs:** UUID v4 generated on the server at creation time via `crypto.randomUUID()`. The server returns the generated ID in the API response. Client does not need to generate IDs since items only appear in the list after server confirmation.

### Authentication & Security

**MVP: No authentication.** Single-user application with no user accounts.

**Future-proofing:** Todo schema excludes userId in MVP but adding a foreign key column is a single migration. API route structure (`/api/todos`) supports prefixing with auth middleware via Fastify plugins without restructuring.

**Security measures:**
- **CORS:** `@fastify/cors` configured to whitelist frontend origin. Rejects cross-origin requests from unknown domains.
- **Input validation:** Zod schemas enforce text length (1-128), reject empty/whitespace-only input, validate request body structure. Fastify rejects requests exceeding 10KB body limit.
- **XSS prevention:** Server sanitizes todo text on write (strip HTML tags). React JSX escaping prevents render-side injection. API error messages never include user-submitted content or internal details.
- **HTTPS:** Enforced at reverse proxy / hosting layer. Application code does not handle TLS directly.

### API & Communication Patterns

**Protocol:** REST over HTTP with JSON bodies. No API versioning in MVP (single consumer).

**Endpoints:**
- `GET /api/todos` → 200 with `{ todos: Todo[] }`
- `POST /api/todos` → 201 with `{ todo: Todo }` | 400 validation error
- `PATCH /api/todos/:id` → 200 with `{ todo: Todo }` | 404 not found | 400 validation error
- `DELETE /api/todos/:id` → 204 no content | 404 not found

**Revalidation endpoint:**
- `POST /api/revalidate` → Called by the frontend after successful mutations to trigger ISR revalidation of the page. Accepts a secret token to prevent unauthorized cache purging.

**Error format:** `{ error: string, message: string }` where `error` is a machine-readable code (VALIDATION_ERROR, NOT_FOUND, INTERNAL_ERROR) and `message` is human-readable without internal details.

**API client (frontend):** Typed fetch wrapper (`lib/api.ts`) with functions mapped to endpoints. Uses `shared` package types for request/response shapes. Throws typed errors for non-2xx responses. After successful mutations, triggers revalidation via Next.js `revalidatePath()`. No retry logic in the client — retry is handled at the UI layer via user gesture.

### Frontend Architecture

**State management:** Custom `useTodos()` React hook using `useState`. No external state library. The hook encapsulates the full todo lifecycle: fetch, create, toggle, delete, with pending states and server-confirmed updates. Initial state is seeded from server-rendered props (ISR), eliminating the loading flash on first visit.

**Pending state pattern:** Each mutation sets a pending indicator on the affected item while the API call is in flight. On success, the hook updates local state with the server response, clears the pending state, and plays the success animation. On failure, the pending state clears and a scoped error is set on the affected item. Each todo carries `error?: string` and `pendingAction?: 'creating' | 'toggling' | 'deleting'` metadata for per-item UI feedback. For create: the input clears immediately for responsiveness, but the text is cached internally — if the API fails, the error callout includes a restore action that puts the text back in the input. On success, a revalidation call ensures the next server render has fresh data.

**Rendering strategy: ISR (Incremental Static Regeneration)**

The page is server-rendered with current todo data fetched from the backend API at request time. Next.js caches the rendered page and serves it statically until revalidation is triggered.

- **Initial page load:** Server fetches todos from the backend API, renders the full page with actual data, and serves it. Users see their real todo list on first paint — no skeleton loader, no empty flash.
- **After mutations:** The frontend calls `revalidatePath('/')` (via a Next.js Server Action or Route Handler) after successful API calls. The next visitor (or page refresh) gets a freshly rendered page.
- **Fallback when API is down:** If the backend is unavailable during server render, the page renders the empty/error state gracefully. The static shell (layout, input, styles) always renders regardless of API health.
- **Client-side hydration:** After the server-rendered page loads, the `useTodos` hook takes over for dynamic mutations. The hook initializes its state from the server-rendered data (passed as props), avoiding a redundant client-side fetch on mount.
- **Deployment implication:** The frontend requires a Node.js runtime (not pure static hosting). Vercel handles this natively. Alternatively, any Node.js host can run `next start`.

This approach gives us the performance of static pages (cached, fast TTFB) with the freshness of server-rendered data, and the interactivity of client-side React for mutations.

**Component structure:** Flat `components/` directory with one file per component. shadcn primitives in `components/ui/`. Custom components (TodoInput, TodoItem, TodoList, EmptyState, SkeletonLoader, ErrorCallout, LoadError) as individual files. Hooks in `hooks/`, API client in `lib/`, configuration in `config/`.

```
frontend/src/
├── app/
│   ├── layout.tsx          (root layout — font, metadata)
│   ├── page.tsx            (server component — fetches todos, renders TodoPage)
│   └── globals.css         (Tailwind + design tokens)
├── components/
│   ├── ui/                 (shadcn primitives — checkbox, input, button)
│   ├── todo-page.tsx       (client component — receives server data, orchestrates UI)
│   ├── todo-input.tsx
│   ├── todo-item.tsx
│   ├── todo-list.tsx
│   ├── empty-state.tsx
│   ├── skeleton-loader.tsx
│   ├── error-callout.tsx
│   └── load-error.tsx
├── hooks/
│   └── use-todos.ts        (state + pending states + API calls + revalidation)
├── lib/
│   ├── api.ts              (typed fetch wrapper)
│   ├── actions.ts          (Next.js Server Actions — revalidatePath)
│   └── utils.ts            (shadcn cn utility, helpers)
└── config/
    └── placeholders.ts     (contextual placeholder banks)
```

**Key difference from pure SSG:** `app/page.tsx` is a **server component** that fetches todos from the backend API and passes them to a client component (`TodoPage`). The `TodoPage` client component receives the data as props, initializes the `useTodos` hook with it, and handles all interactive behavior.

### Infrastructure & Deployment

**Local development:**
- Frontend: `localhost:3000` (Next.js dev server with Turbopack)
- Backend: `localhost:3001` (Fastify + tsx watch)
- Database: `./data/todos.db` (SQLite file, gitignored)

**Environment configuration:**
- Frontend `.env.local`: `NEXT_PUBLIC_API_URL` (client-side), `API_URL` (server-side, for ISR fetches), `REVALIDATION_SECRET`
- Backend `.env`: `PORT`, `DATABASE_PATH`, `CORS_ORIGIN`, `REVALIDATION_SECRET`
- No secrets in MVP beyond revalidation token. Environment files gitignored with `.env.example` templates committed.

**Logging:** Fastify built-in Pino logger. Structured JSON output, request ID tracking, configurable log levels per environment.

**Deployment, CI/CD, monitoring:** Deferred to post-MVP. Architecture supports: Node.js hosting for both frontend (Next.js server) and backend (Fastify). Vercel for frontend (native Next.js ISR support) + any Node host for backend. SQLite can be migrated to PostgreSQL if deployment environment requires it.

### Decision Impact Analysis

**Implementation Sequence:**
1. Monorepo setup with workspaces and shared TypeScript config
2. Shared package: Zod schemas and TypeScript types for API contract
3. Backend: Fastify server, Drizzle schema, migrations, CRUD route handlers
4. Frontend: Next.js project with ISR page, design tokens, shadcn/ui setup
5. Frontend: Custom components (TodoInput → TodoItem → TodoList → states)
6. Frontend: useTodos hook with pending state pattern, API integration, and revalidation
7. Animation layer applied across components
8. Testing: Jest unit/integration tests, Playwright E2E tests

**Cross-Component Dependencies:**
- Shared Zod schemas drive both backend validation and frontend API client types
- Pending state hook design directly shapes component props (error/pending state per item)
- ISR revalidation requires coordination between frontend Server Actions and backend API
- Animation system depends on confirmed state change events from the useTodos hook
- Design tokens (CSS custom properties) are consumed by all frontend components

### PRD Deviation Log

| PRD Reference | PRD Value | Architecture Value | Rationale |
|---------------|-----------|-------------------|-----------|
| NFR17 | Todo description max 1024 characters | Max 128 characters | Stakeholder decision — short task descriptions only, keeps UI clean |
| Project Type | SSG with client-side hydration | ISR with server-side data fetching + client-side hydration | Stakeholder decision — serve real data on first paint, eliminate loading flash |
| UX Spec | Optimistic UI with rollback | Pending state pattern with server-confirmed updates | Stakeholder decision — simpler implementation, UI reflects pending/confirmed states rather than assuming success |

## Implementation Patterns & Consistency Rules

### Naming Conventions

**Database:**
- Tables: `snake_case`, plural (`todos`)
- Columns: `snake_case` (`created_at`)
- Drizzle schema maps `snake_case` SQL columns to `camelCase` TypeScript properties

**API:**
- Endpoints: kebab-case, plural nouns (`/api/todos`, `/api/todos/:id`)
- JSON fields: camelCase (`createdAt`, `todoText`)
- Error codes: UPPER_SNAKE_CASE (`VALIDATION_ERROR`, `NOT_FOUND`)

**Code:**
- TypeScript files: kebab-case (`todo-item.tsx`, `use-todos.ts`, `empty-state.tsx`)
- React components: PascalCase export names (`export function TodoItem()`)
- Functions/variables: camelCase (`fetchTodos`, `isCompleted`)
- Constants: UPPER_SNAKE_CASE (`MAX_TEXT_LENGTH`)
- Zod schemas: camelCase with Schema suffix (`createTodoSchema`, `todoSchema`)
- TypeScript types/interfaces: PascalCase (`Todo`, `CreateTodoRequest`)
- CSS custom properties: kebab-case with category prefix (`--color-accent`, `--shadow-resting`, `--duration-normal`)
- Environment variables: UPPER_SNAKE_CASE (`DATABASE_PATH`, `CORS_ORIGIN`)

### Structure Conventions

**Test placement:** Co-located with source files.

```
components/
├── todo-item.tsx
├── todo-item.test.tsx
hooks/
├── use-todos.ts
├── use-todos.test.ts
backend/src/routes/
├── todos.ts
├── todos.test.ts
```

**E2E tests:** Root-level `e2e/` directory, one file per user journey.

```
e2e/
├── journey-1-first-visit.spec.ts
├── journey-2-quick-capture.spec.ts
├── journey-3-review-tidy.spec.ts
├── journey-4-error-recovery.spec.ts
```

**Exports:** Named exports only. No default exports except where Next.js requires them (`page.tsx`, `layout.tsx`).

**Import ordering** (enforced by ESLint):
1. External packages (`react`, `next`, `fastify`)
2. Internal packages (`@shared/types`, `@shared/schemas`)
3. Project-relative (`@/components/...`, `@/hooks/...`, `@/lib/...`)
4. Side-effect imports (CSS)

### Format Conventions

**API responses:**

```typescript
// Success (single item)
{ todo: Todo }

// Success (list)
{ todos: Todo[] }

// Error
{ error: "VALIDATION_ERROR", message: "Text must be between 1 and 128 characters" }
```

No nested `data` wrapper. Response key matches the resource name. No `null` values in responses — omit optional fields or use defined defaults.

**Dates:** ISO 8601 strings everywhere (`2026-03-16T14:30:00.000Z`). Stored as TEXT in SQLite. Serialized as strings in JSON. Parsed to Date objects only in the UI layer for relative time display.

**Booleans in SQLite:** Stored as INTEGER (0/1) via Drizzle `{ mode: 'boolean' }`. TypeScript always sees `boolean`.

### Process Conventions

**Mutation flow (every mutation follows this exact sequence):**
1. Set `pendingAction` on the affected item (or input area for create). For create: clear input immediately, cache text internally.
2. Fire API call
3. On success: update local state with server response, clear pending state, play success animation, trigger `revalidatePath('/')` via Server Action
4. On failure: clear pending state, set `error` on the affected item, play error animation. For create: error callout includes restore action to recover cached text.

**Error handling layers:**

| Layer | Responsibility |
|-------|---------------|
| Zod schema (shared) | Validate shape and constraints |
| Fastify handler | Business logic errors (404, conflict) |
| Fastify error handler | Catch-all, format to `{ error, message }` |
| Frontend API client | Convert HTTP errors to typed `ApiError` |
| useTodos hook | Set per-item error state, manage pending |
| UI components | Render ErrorCallout linked via `aria-describedby` |

**Loading states:**

| State | Representation |
|-------|---------------|
| Initial page load | No loading state — ISR serves real data |
| Server unavailable during ISR | LoadError component with retry |
| Creating todo | Anticipation animation in list area |
| Toggling todo | Checkbox pending indicator (pulse/dim) |
| Deleting todo | Item pending indicator (dim) |

**Validation:** Always validate on client (fail fast, preserve input) AND on server (never trust client). Same Zod schema, both locations. Empty or whitespace-only submissions are silently ignored on the client (no error, no API call).

### Enforcement Rules

**All AI agents MUST:**
1. Follow the naming conventions table exactly — no deviations
2. Use named exports (except Next.js-required default exports)
3. Co-locate unit tests with source files
4. Use shared Zod schemas for all validation — never write ad-hoc validation
5. Follow the 4-step pending state mutation flow for every mutation
6. Never return `null` in API responses
7. Use ISO 8601 strings for all dates in the API layer
8. Handle `prefers-reduced-motion` for every animation
9. Include `aria-*` attributes and keyboard handling in every interactive component
10. Use the `@/` import alias for all project-relative imports

## Project Structure & Boundaries

### Complete Project Directory Structure

```
todo-bmad/
├── package.json                        (npm workspaces root)
├── tsconfig.base.json                  (shared TypeScript config — strict mode, paths)
├── playwright.config.ts                (E2E test configuration — 3 viewports)
├── .gitignore
├── .env.example                        (documents all env vars across packages)
├── README.md
│
├── e2e/                                (Playwright E2E tests — span both services)
│   ├── journey-1-first-visit.spec.ts   (empty state → first todo)
│   ├── journey-2-quick-capture.spec.ts (returning user, mobile add)
│   ├── journey-3-review-tidy.spec.ts   (complete, uncomplete, delete)
│   └── journey-4-error-recovery.spec.ts (all error types and retry)
│
├── packages/
│   ├── shared/                         (API contract — types and validation)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts                (barrel export)
│   │       ├── schemas.ts              (Zod schemas: createTodoSchema, updateTodoSchema, todoSchema)
│   │       ├── types.ts                (TypeScript types: Todo, CreateTodoRequest, UpdateTodoRequest, ApiError)
│   │       └── constants.ts            (MAX_TEXT_LENGTH = 128, error codes)
│   │
│   ├── backend/                        (Fastify API server)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── drizzle.config.ts           (Drizzle Kit migration config)
│   │   ├── jest.config.ts
│   │   ├── .env                        (PORT, DATABASE_PATH, CORS_ORIGIN — gitignored)
│   │   ├── .env.example
│   │   ├── data/                       (SQLite database directory — gitignored)
│   │   │   └── .gitkeep
│   │   ├── drizzle/                    (generated SQL migration files — committed)
│   │   │   └── 0000_create_todos.sql
│   │   └── src/
│   │       ├── index.ts                (server entry — starts Fastify, runs migrations)
│   │       ├── app.ts                  (Fastify app factory — registers plugins, routes)
│   │       ├── app.test.ts             (integration tests for app setup)
│   │       ├── config.ts               (environment config loader)
│   │       ├── db/
│   │       │   ├── schema.ts           (Drizzle schema — todos table definition)
│   │       │   ├── client.ts           (database connection — better-sqlite3 + Drizzle)
│   │       │   └── migrate.ts          (migration runner)
│   │       ├── routes/
│   │       │   ├── todos.ts            (GET, POST, PATCH, DELETE /api/todos)
│   │       │   └── todos.test.ts       (route handler tests via Fastify .inject())
│   │       └── plugins/
│   │           ├── cors.ts             (@fastify/cors configuration)
│   │           └── error-handler.ts    (global error handler — formats { error, message })
│   │
│   └── frontend/                       (Next.js 16 + shadcn/ui)
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.ts              (ISR config, API_URL env)
│       ├── jest.config.ts
│       ├── components.json             (shadcn/ui config)
│       ├── .env.local                  (NEXT_PUBLIC_API_URL, API_URL — gitignored)
│       ├── .env.example
│       ├── public/
│       │   └── favicon.ico
│       └── src/
│           ├── app/
│           │   ├── layout.tsx          (root layout — Outfit font, metadata, viewport)
│           │   ├── page.tsx            (server component — fetches todos, renders TodoPage)
│           │   └── globals.css         (Tailwind directives + CSS custom properties)
│           ├── components/
│           │   ├── ui/                 (shadcn primitives — checkbox, input, button)
│           │   ├── todo-page.tsx       (client component — receives server data, orchestrates UI)
│           │   ├── todo-page.test.tsx
│           │   ├── todo-input.tsx      (text input with contextual placeholders)
│           │   ├── todo-input.test.tsx
│           │   ├── todo-item.tsx       (single todo with checkbox, text, timestamp, delete)
│           │   ├── todo-item.test.tsx
│           │   ├── todo-list.tsx       (active/completed sections with divider)
│           │   ├── todo-list.test.tsx
│           │   ├── empty-state.tsx     (personality-driven empty list message)
│           │   ├── empty-state.test.tsx
│           │   ├── skeleton-loader.tsx (breathing pulse placeholder rows)
│           │   ├── skeleton-loader.test.tsx
│           │   ├── error-callout.tsx   (inline per-action error with restore for create)
│           │   ├── error-callout.test.tsx
│           │   ├── load-error.tsx      (full list-area error with retry CTA)
│           │   └── load-error.test.tsx
│           ├── hooks/
│           │   ├── use-todos.ts        (state, pending states, API calls, revalidation)
│           │   └── use-todos.test.ts
│           ├── lib/
│           │   ├── api.ts              (typed fetch wrapper)
│           │   ├── api.test.ts
│           │   ├── actions.ts          (Next.js Server Actions — revalidatePath)
│           │   └── utils.ts            (shadcn cn utility, relative time formatter)
│           └── config/
│               └── placeholders.ts     (contextual placeholder banks)
```

### Architectural Boundaries

**API boundary (frontend ↔ backend):**
The REST API is the only communication path between frontend and backend. The `shared` package defines the contract — both sides import the same Zod schemas and TypeScript types. The frontend never accesses the database directly. The backend never knows about React or Next.js.

```
Frontend (Next.js)  ──HTTP/JSON──>  Backend (Fastify)  ──Drizzle──>  SQLite
     │                                    │
     └── imports @shared/schemas ─────────┘
         @shared/types
         @shared/constants
```

**Server/Client boundary (within frontend):**
`page.tsx` is a server component — it fetches data during ISR and passes it to `TodoPage`. Everything below `TodoPage` is client-side React. Server Actions (`actions.ts`) bridge the gap for revalidation.

```
Server Component (page.tsx)
  └── fetches todos from API_URL (server-side, not exposed to browser)
  └── passes Todo[] as props to:
      Client Component (todo-page.tsx — "use client")
        └── useTodos hook manages all client-side state and mutations
        └── All child components are pure presentational (receive props)
```

**Data boundary:**
All database access is encapsulated in `db/client.ts` and `db/schema.ts`. Route handlers interact with data only through Drizzle queries on the schema. No raw SQL outside of migration files.

### Requirements to Structure Mapping

**FR1-FR6 (Task Management — create, view, complete, uncomplete, delete):**
- Backend: `routes/todos.ts` (all CRUD handlers)
- Frontend: `hooks/use-todos.ts` (mutation logic), `components/todo-input.tsx` (create), `components/todo-item.tsx` (complete, delete), `components/todo-list.tsx` (view)
- Shared: `schemas.ts` (createTodoSchema, updateTodoSchema), `types.ts` (Todo, CreateTodoRequest)

**FR7-FR9 (Task Visualization — completed distinction, empty state, loading):**
- Frontend: `components/todo-item.tsx` (completed styling), `components/empty-state.tsx`, `components/skeleton-loader.tsx`
- CSS: `globals.css` (design tokens for completed opacity, shadow tokens)

**FR10-FR12 (Data Persistence):**
- Backend: `db/schema.ts` (Drizzle schema), `db/client.ts` (connection), `drizzle/` (migrations)

**FR13-FR15 (Error Handling):**
- Backend: `plugins/error-handler.ts` (global error formatting)
- Frontend: `components/error-callout.tsx` (per-action errors), `components/load-error.tsx` (initial load failure)
- Shared: `types.ts` (ApiError type), `constants.ts` (error codes)

**FR16-FR19 (Responsive + Accessibility):**
- Frontend: `globals.css` (responsive breakpoints, reduced-motion), all components (ARIA attributes, keyboard handling)

**Cross-cutting: Design tokens**
- Single source: `globals.css` CSS custom properties
- Consumed by: all components via Tailwind utilities and direct CSS var references

**Cross-cutting: Validation**
- Single source: `shared/src/schemas.ts`
- Used by: backend routes (Fastify Zod provider), frontend API client (pre-flight), frontend input component (character limit)

### Data Flow

**Page load (ISR):**
```
Browser request → Next.js server → fetch(API_URL/api/todos) → Fastify → Drizzle → SQLite
                                  ← { todos: Todo[] }
                  ← Rendered HTML with todos baked in
Browser ← cached HTML (served statically until revalidated)
```

**Create mutation (client-side):**
```
User types + enter → useTodos.createTodo()
  → input clears, text cached, anticipation animation starts
  → fetch(NEXT_PUBLIC_API_URL/api/todos, POST)
  → Fastify validates (Zod) → Drizzle insert → SQLite
  ← { todo: Todo }
  → useTodos updates state with server response
  → entrance animation plays
  → revalidatePath('/') via Server Action
```

**Error flow:**
```
User action → useTodos.mutate()
  → pending state set
  → fetch fails (network error or 4xx/5xx)
  → API client throws typed ApiError
  → useTodos clears pending, sets error on item
  → ErrorCallout renders with personality-driven message
  → User retries via same gesture
```

### Development Workflow

**Starting development:**
```bash
npm run dev          # runs frontend (port 3000) and backend (port 3001) concurrently
```

**Running tests:**
```bash
npm run test         # Jest unit/integration tests across all packages
npm run test:e2e     # Playwright E2E tests (requires both services running)
```

**Database operations:**
```bash
npm run db:generate  # Generate migration from schema changes (backend)
npm run db:migrate   # Apply migrations (also runs automatically on server start)
```

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:** All technology choices are compatible and well-integrated. Next.js 16 + TypeScript + Tailwind CSS v4 + shadcn/ui are first-class integrations. Fastify + Drizzle ORM + better-sqlite3 work seamlessly with the shared Zod type provider. ISR + client-side pending state mutations follow standard Next.js App Router patterns. Jest and Playwright cover different test scopes without conflicts. npm workspaces manages all three packages natively.

**Pattern Consistency:** All patterns align with the technology stack. kebab-case file naming follows Next.js/React conventions. camelCase JSON fields match JavaScript conventions, snake_case DB columns match SQL conventions, and Drizzle handles the mapping layer. Named exports support tree-shaking and refactor safety. Co-located tests follow React community standards.

**Structure Alignment:** The three-package monorepo cleanly separates frontend, backend, and shared contract. The server/client boundary in the frontend is explicit (page.tsx server component → todo-page.tsx client component). All integration points are well-defined.

No contradictions or conflicts found.

### Requirements Coverage

**All 19 Functional Requirements covered:**

| FR | Requirement | Support |
|----|------------|---------|
| FR1-FR5 | CRUD operations | REST endpoints + useTodos hook + components |
| FR6 | Display text, status, timestamp | Todo schema + todo-item component |
| FR7 | Completed distinction | todo-list divider + completed styling |
| FR8 | Empty state | empty-state component |
| FR9 | Loading state | skeleton-loader (ISR fallback) |
| FR10-FR12 | Data persistence + API | Drizzle + SQLite + 4 REST endpoints |
| FR13-FR14 | Error messages + retry | error-callout + load-error + cached text recovery |
| FR15 | App shell without API | ISR fallback renders gracefully |
| FR16-FR17 | Mobile + desktop | Responsive breakpoints in globals.css |
| FR18 | Keyboard navigation | Enforcement rule, tab order in all components |
| FR19 | Assistive tech | ARIA attributes, role alerts, aria-describedby |

**All 20 Non-Functional Requirements covered:**

| NFR | Requirement | Support |
|-----|------------|---------|
| NFR1-NFR4 | Performance targets | ISR pre-rendered HTML, Tailwind CSS, optimized assets |
| NFR5 | Cache-control | Next.js fingerprinting and caching |
| NFR6-NFR12 | Accessibility (WCAG 2.1 AA) | Radix primitives, enforcement rules, prefers-reduced-motion |
| NFR13-NFR14 | Validation + XSS | Shared Zod schemas + server sanitization + JSX escaping |
| NFR15 | No internal error details | error-handler plugin formats generic responses |
| NFR16 | HTTPS | Deployment-layer enforcement |
| NFR17 | 128 char + 10KB limits | Zod schema + Fastify bodyLimit |
| NFR18 | 80% test coverage | Co-located Jest + Playwright E2E |
| NFR19 | No flaky tests | Fastify .inject() avoids server lifecycle |
| NFR20 | E2E all 4 journeys | 4 dedicated Playwright test files |

### Implementation Readiness

**Decision completeness:** All critical and important decisions documented with technology choices, rationale, and examples.

**Structure completeness:** Every file and directory specified with purpose annotations. No generic placeholders. All requirements mapped to specific locations.

**Pattern completeness:** Naming, structure, format, and process conventions defined with examples. 10 enforcement rules provide clear agent guardrails.

### Gap Analysis

**Critical gaps:** None.

**Minor observations (non-blocking, noted for implementation):**
- Outfit font loading strategy (subsetting, font-display, preload) should be addressed in the first frontend story for Lighthouse compliance.
- CI/CD pipeline deferred to post-MVP. Test infrastructure is CI-ready.
- API rate limiting not defined. Acceptable for single-user MVP.

### Architecture Completeness Checklist

- [x] Project context thoroughly analyzed (19 FRs, 20 NFRs, 5 cross-cutting concerns)
- [x] Technology stack fully specified (Next.js 16, Fastify, Drizzle, SQLite, Zod)
- [x] Critical decisions documented with rationale (5 critical, 5 important, 7 deferred)
- [x] Implementation patterns established (naming, structure, format, process)
- [x] Enforcement rules defined (10 rules for AI agent consistency)
- [x] Complete project structure defined (~60 files across 3 packages)
- [x] Architectural boundaries established (API, server/client, data)
- [x] Requirements mapped to structure (all FRs to specific files)
- [x] Data flow documented (ISR page load, client mutation, error flow)
- [x] PRD deviation log maintained (3 documented overrides)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — low-complexity project with clear requirements, deliberate technology choices, and comprehensive patterns.

**Key Strengths:**
- Single shared validation layer (Zod) eliminates frontend/backend contract drift
- ISR strategy gives fast first-paint with real data while keeping the architecture simple
- Pending state pattern is straightforward to implement and test
- Every component has a clear, single responsibility with explicit file locations
- PRD deviation log maintains traceability between documents

**Areas for Future Enhancement:**
- Authentication and multi-user support (Phase 2)
- Dark mode token set (CSS custom properties are ready)
- CI/CD pipeline and deployment automation
- API rate limiting
- Offline capability

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Use shared Zod schemas for all validation — never write ad-hoc validation
- Follow the 4-step pending state mutation flow for every mutation
- Refer to this document for all architectural questions

**First Implementation Priority:**
Initialize the monorepo with npm workspaces, set up the shared package with Zod schemas and TypeScript types, scaffold the Fastify backend with Drizzle and the Next.js frontend with shadcn/ui.
