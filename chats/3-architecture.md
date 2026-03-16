# bmad assistance request
_Exported on 16/03/2026 at 16:07:10 GMT from Cursor (2.6.19)_

---

**User**

/bmad-help 

---

**Cursor**

Now let me check what artifacts already exist to determine your progress.

Hey Kevin! Here's where you stand in the **BMM** module workflow:

---

## Completed

| Phase | Workflow | Status |
|-------|----------|--------|
| 2-planning | Create PRD (CP) | Done — `prd.md` found |
| 2-planning | Validate PRD (VP) | Done — validation report found |
| 2-planning | Create UX (CU) | Done — `ux-design-specification.md` found |

Phase 1 (Analysis) has no required steps — it's entirely optional, and you moved straight into planning. Phase 2 is complete.

---

## What's Next — Phase 3: Solutioning

You have one optional step available, followed by the next **required** step:

### Optional (but recommended before moving forward):

- None at this point — you're heading straight into required work.

### Required — next up:

1. **Create Architecture** (CA) — `bmad-bmm-create-architecture`
   - Agent: 🏗️ Winston (Architect)
   - Guided workflow to document your technical decisions — tech stack, data model, infrastructure, API design, etc.
   - Run in a **fresh context window**.

### Then after that (also required, in order):

2. **Create Epics and Stories** (CE) — `bmad-bmm-create-epics-and-stories`
   - Agent: 📋 John (Product Manager)
   - Break the PRD down into implementable epics and user stories.

3. **Check Implementation Readiness** (IR) — `bmad-bmm-check-implementation-readiness`
   - Agent: 🏗️ Winston (Architect)
   - Final validation that PRD, UX, Architecture, and Epics/Stories are aligned and ready to build. Recommended to use a **different high-quality LLM** if available.

---

**Your next action:** Open a fresh context window and run `bmad-bmm-create-architecture` to start the architecture design with Winston.

---

**User**

/bmad-create-architecture 

---

**Cursor**

Let me check for an existing architecture document and discover all input documents.

Welcome Kevin! I've scanned for documents to feed into the Architecture workspace for **todo-bmad**. Here's what I found:

**Documents Discovered:**

- **PRD:** 1 file found — `prd.md`
- **UX Design:** 2 files found — `ux-design-specification.md`, `ux-design-directions.html`
- **Product Brief:** None found
- **Research:** None found
- **Project docs:** None found (no `docs/` folder)
- **Project context:** None found

**Files to load:**
1. `_bmad-output/planning-artifacts/prd.md`
2. `_bmad-output/planning-artifacts/ux-design-specification.md`
3. `_bmad-output/planning-artifacts/ux-design-directions.html`

The PRD requirement is satisfied. Do you have any other documents you'd like me to include before I load everything and set up the architecture workspace? Or shall I proceed with what's been found?

---

**User**

Use what's been found

---

**Cursor**

Now let me check the available data files for this workflow and create the initial document.

Welcome Kevin! I've set up your Architecture workspace for **todo-bmad**.

**Documents Found:**

- **PRD:** 1 file loaded — `prd.md`
- **UX Design:** 2 files loaded — `ux-design-specification.md`, `ux-design-directions.html`
- **Research:** None found
- **Project docs:** None found
- **Project context:** None found

**Files loaded:**
1. `_bmad-output/planning-artifacts/prd.md` (315 lines — full PRD with functional/non-functional requirements, user journeys, success criteria)
2. `_bmad-output/planning-artifacts/ux-design-specification.md` (1065 lines — complete UX spec with design system, components, animations, accessibility)
3. `_bmad-output/planning-artifacts/ux-design-directions.html` (825 lines — visual design direction mockups, Direction 4 "Warm Depth" was selected)

**Document created:** `_bmad-output/planning-artifacts/architecture.md` from template, frontmatter initialized with workflow state and input document references.

I've got a solid foundation to work from — the PRD defines a deliberately lean full-stack Todo app (SSG frontend + backend API, CRUD operations, single user, no auth in MVP), and the UX spec details a polished "Warm Depth" design direction using shadcn/ui with Tailwind, Outfit typeface, optimistic UI, and a thoughtful animation library.

Ready to begin architectural decision making. Do you have any other documents you'd like me to include?

**[C]** Continue to project context analysis

---

**User**

c

---

**Cursor**

I'm reviewing your project documentation for **todo-bmad**. Here's my analysis:

I found **19 functional requirements** organized into Task Management, Task Visualization, Data Persistence, Error Handling, and Responsive Experience. I also found **20 non-functional requirements** across Performance, Accessibility, Security, and Testing. Your UX specification is comprehensive, defining the full component strategy, animation system, and interaction patterns.

**Key architectural aspects I notice:**

- **Core functionality is deliberately narrow** — CRUD on a single entity (todo) with text, completion status, and creation timestamp. No relationships, no complex queries, no multi-entity data model.
- **The frontend is the heavy lift** — the PRD and UX spec place most complexity in the presentation layer: optimistic UI with rollback, a bespoke animation library (6 distinct animation types), contextual placeholder rotation, skeleton loaders, and scoped error handling per action type.
- **The backend is thin** — a simple CRUD API for a single resource. No auth, no multi-tenancy, no complex business logic. The API's main concerns are input validation (1024 char limit, 10KB body limit), sanitization (XSS prevention), and clean error responses.
- **SSG + client-side hydration** is the defined pattern — the static shell renders instantly, dynamic operations happen via API calls post-hydration.
- **Performance and accessibility are first-class constraints** — Lighthouse 90+ for both, WCAG 2.1 AA, <1s FCP, <1.5s LCP, 80% test coverage across unit/integration/E2E.
- **Security requirements are specific** — input sanitization, XSS prevention, HTTPS everywhere, no internal details in error responses, request size enforcement.
- **The UX spec prescribes specific technical choices** — shadcn/ui + Radix primitives for components, Tailwind CSS for styling, Outfit typeface, CSS custom properties for design tokens. These are hard constraints for the architecture.

**Scale indicators:**

- **Project complexity:** Low — single entity, single user, no auth, no real-time, no integrations
- **Primary technical domain:** Full-stack web (SSG frontend + REST API backend)
- **Cross-cutting concerns identified:** Error handling strategy (optimistic UI with rollback), animation system (shared motion tokens), accessibility (pervasive ARIA, keyboard, reduced-motion), design token system (colors, shadows, spacing, motion)

This analysis will help me guide you through the architectural decisions needed to ensure AI agents implement this consistently.

Does this match your understanding of the project scope and requirements?

---

Here's the **Project Context Analysis** I'll add to the document:

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
19 FRs across 5 categories. The entire functional surface is CRUD operations on a single `todo` entity (create, read, complete/uncomplete, delete) with supporting visualization states (empty, loading, error). No search, no filtering, no sorting by user — list ordering is fixed (active newest-first above, completed most-recently-completed-first below). The simplicity of the data model means architectural decisions center on execution quality rather than data complexity.

**Non-Functional Requirements:**
20 NFRs form the actual engineering challenge. Performance (Lighthouse 90+, FCP <1s, LCP <1.5s, CLS <0.1), accessibility (WCAG 2.1 AA, keyboard-only operation, screen reader compatibility), security (input validation/sanitization, XSS prevention, HTTPS, request size limits), and testing (80% coverage, zero flaky tests, E2E covering all 4 user journeys) are all hard constraints that must be architected for from the start — not retrofitted.

**Scale & Complexity:**

- Primary domain: Full-stack web (SSG frontend + backend REST API)
- Complexity level: Low
- Estimated architectural components: ~8-10 (frontend app shell, 6 UI components, API client layer, backend API, data storage)

### Technical Constraints & Dependencies

- **Frontend framework must support SSG** with client-side hydration for dynamic CRUD operations
- **shadcn/ui + Radix UI** primitives for accessible component foundations (prescribed by UX spec)
- **Tailwind CSS** for utility-first styling with design tokens as CSS custom properties
- **Outfit typeface** via Google Fonts (web font performance implications for Lighthouse targets)
- **Single-user, no authentication** in MVP — simplifies backend significantly but the API should not be designed in a way that makes auth impossible to add later
- **No offline write capability** — static shell renders without API, but mutations require connectivity
- **HTTPS required** in all deployed environments including preview
- **Todo description max 1024 characters, request body max 10KB** — enforced server-side
- **Light mode only** for MVP, but CSS custom properties must support future dark mode addition

### Cross-Cutting Concerns Identified

- **Optimistic UI with rollback:** Every mutation (create, complete, uncomplete, delete) updates the UI immediately and rolls back on API failure. This pattern must be consistent across all operations and integrated with the animation system and error callouts.
- **Animation system:** 6 animation types (entrance, completion-migration, deletion, skeleton-pulse, shake/flash-error, anticipation) with shared motion tokens and `prefers-reduced-motion` variants. Animations are tightly coupled to state transitions — the architecture must support triggering animations in response to both optimistic updates and rollback events.
- **Error handling strategy:** Scoped per-action (not global). Each mutation failure produces a localized shake + callout. Initial load failure has its own full-area treatment. Error copy is personality-driven with a defined bank. The retry mechanism reuses the original gesture (no explicit retry button except for initial load).
- **Accessibility pervasiveness:** WCAG 2.1 AA touches every component — ARIA attributes, focus management after state changes, keyboard tab order, color contrast, `role="alert"` for errors, `aria-busy` for loading, `role="separator"` for divider. This is not a layer — it's woven into every architectural decision.
- **Design token system:** Colors, shadows, spacing (8px base), border radii, and motion tokens defined as CSS custom properties. Shared across all components. Must be structured for future dark mode extension.

---

**What would you like to do?**

- **[A]** Advanced Elicitation — Let's dive deeper into architectural implications
- **[P]** Party Mode — Bring different perspectives to analyze requirements
- **[C]** Continue — Save this analysis and begin architectural decisions

---

**User**

c

---

**Cursor**

Project context analysis saved. Now let's evaluate starter templates.

Before I dive into researching starters, I didn't find an existing project context file with technical preferences, so let me ask a few questions to guide the evaluation.

Your UX spec already constrains us to **shadcn/ui + Radix UI + Tailwind CSS**, which effectively means **React** on the frontend. And the PRD requires **SSG with client-side hydration**. That narrows the field significantly.

A few things I'd like to understand from you:

**Language:**
- TypeScript or JavaScript? (TypeScript is the strong default for this kind of project)

**Frontend Framework:**
- Do you have a preference between Next.js, Astro (with React islands), or Vite + React? All can do SSG, but they have different trade-offs.

**Backend/API:**
- Do you want the API bundled with the frontend framework (e.g., Next.js API routes) or as a separate service (e.g., Express, Fastify, Hono)?
- Database preference? (SQLite for simplicity, PostgreSQL for production-readiness, or something else?)

**Deployment/Platform:**
- Any preference on where this will be deployed? (Vercel, Netlify, Railway, self-hosted, etc.)

**Testing:**
- Any preferences on test frameworks? (Vitest, Jest, Playwright, Cypress for E2E?)

**Your experience level and goals:**
- Is there a stack you already know well, or is part of the goal here to learn something specific?

These will help me narrow down to the right starter recommendation.

---

**User**

100% typescript please

Next.js is good for the frontend.

The backend can be a separate service.  I've personally only got experience with Express, but happy to use the most lightweight and appropriate technology which is suitably testable.

Similarly for the database, I have no strong preferences as this isn't my area of expertise, but my main requirement is that the database is portable and standalone (i.e., can be run from any local machine rather than requiring a cloud-based database).

For the testing frameworks, I'd prefer jest for unit testing and playwright for e2e testing.

My personal level of expertise is in frontend so I will be relying quite heavily on you to select appropriate backend and database technologies given the relatively low complexity of the application and the need for performance and testability.

---

**Cursor**

Great context, Kevin. Let me research current versions and options to put together the right recommendation.

---

**User**

Please continue... it looks like you have gotten stuck

---

**Cursor**

Apologies for the stall, Kevin — some of my web searches were blocked. I have solid knowledge of these technologies though, so let me proceed with my analysis and recommendation.

Given your preferences, here's what I'm evaluating:

---

### Frontend: Next.js 16

This is straightforward. `create-next-app` with TypeScript, Tailwind CSS, App Router, and ESLint gives us exactly what we need. For SSG, Next.js supports `output: 'export'` for fully static builds. shadcn/ui has first-class Next.js integration.

**Initialization:**
```bash
npx create-next-app@latest todo-frontend --typescript --tailwind --eslint --app --src-dir --use-npm
```

---

### Backend: Fastify vs Hono vs Express

Since the API is a single-entity CRUD service with ~5 endpoints, I'm recommending **Fastify** over Express or Hono. Here's my reasoning:

| Criteria | Express | Fastify | Hono |
|----------|---------|---------|------|
| TypeScript support | Adequate (via @types) | First-class | First-class |
| Performance | Baseline | ~2-3x Express | ~2-3x Express |
| Built-in validation | No (need middleware) | Yes (JSON Schema) | Yes (with Zod) |
| Testing DX | Supertest | Built-in `.inject()` — no server startup needed | Direct app call — no server startup needed |
| Ecosystem maturity | Massive | Large, well-established | Growing, newer |
| Learning curve from Express | N/A | Low — similar concepts, better patterns | Low — different API style |

**Why Fastify over Express:** Better TypeScript integration, built-in request/response validation via JSON Schema (helps enforce NFR13 input validation), and the `.inject()` testing method means you can test routes without starting a server — which makes Jest tests fast and reliable. It's a natural step up from Express without being unfamiliar.

**Why Fastify over Hono:** Hono is excellent but newer. Fastify has a larger plugin ecosystem, more battle-tested patterns, and more community resources if you need to troubleshoot. For your first time building a backend service at this level, Fastify gives you slightly more guardrails.

---

### Database: SQLite + Drizzle ORM

This is the clear winner for your requirements:

- **SQLite** is a single file — no database server to install, no cloud dependency, runs on any machine. Perfect for "portable and standalone."
- **Drizzle ORM** adds type-safe queries, schema definitions in TypeScript, and a migration system — all without the heavy abstraction of Prisma. It's lightweight, fast, and the TypeScript DX is excellent.
- **better-sqlite3** as the underlying SQLite driver — synchronous, fast, well-maintained.

The entire database is a single `.sqlite` file in the project. Copy it, back it up, delete it and regenerate — zero infrastructure.

---

### Testing: Jest + Playwright

Matching your preferences:
- **Jest** for unit tests (backend route handlers, frontend component logic, utility functions)
- **Playwright** for E2E tests (all 4 user journeys across 3 viewport sizes, keyboard navigation, accessibility)
- **Fastify `.inject()`** for API integration tests within Jest (no server startup, fast)

---

### Project Structure: Monorepo with Workspaces

Since frontend and backend are separate services, I'd recommend a simple **npm workspaces monorepo**:

```
todo-bmad/
├── packages/
│   ├── frontend/    (Next.js app)
│   ├── backend/     (Fastify API)
│   └── shared/      (TypeScript types for API contract)
├── package.json     (workspace root)
└── playwright.config.ts (E2E tests at root level)
```

The `shared` package holds the TypeScript types for the todo entity and API request/response shapes — ensuring frontend and backend always agree on the contract. No runtime code, just types.

---

Here's the full **Starter Template Evaluation** content I'll add to the document:

---

## Starter Template Evaluation

### Primary Technology Domain

Full-stack TypeScript web application — SSG frontend (Next.js) with a separate REST API backend (Fastify) and embedded database (SQLite).

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

---

**What would you like to do?**

- **[A]** Advanced Elicitation — Explore custom approaches or alternative starters
- **[P]** Party Mode — Evaluate trade-offs from different perspectives
- **[C]** Continue — Save this decision and move to architectural decisions

---

**User**

c

---

**Cursor**

Now loading the next step.

Starter template evaluation saved. Now let's make the remaining architectural decisions.

Here's what we've already locked in from steps 2 and 3:

**Already Decided:**
- TypeScript strict mode across all packages
- Next.js 16 (App Router, SSG, Tailwind CSS v4, shadcn/ui)
- Fastify (separate backend service)
- SQLite + better-sqlite3 + Drizzle ORM
- Jest + Playwright for testing
- npm workspaces monorepo

That leaves several remaining decisions across five categories. Given the low complexity of this project, many of these have clear answers — let me walk through each category with my recommendation and rationale, and you can push back on anything that doesn't feel right.

---

### Category 1: Data Architecture

**Todo Entity Schema:**

The PRD specifies each todo stores: text description, completion status, and creation timestamp.

```typescript
// Drizzle schema
{
  id: text('id').primaryKey(),       // UUID string — avoids auto-increment leaking info
  text: text('text').notNull(),       // Max 1024 chars (enforced at API layer)
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),  // ISO 8601 string
}
```

I'm recommending UUIDs over auto-incrementing integers for the ID. They're generated client-side (needed for optimistic UI — you need an ID before the API responds), they don't reveal how many todos exist, and they make future multi-user migration painless.

**Validation Strategy: Zod (shared)**

Zod schemas defined in the `shared` package, used by both frontend and backend:
- Frontend: validates before sending API requests
- Backend: Fastify has a Zod integration (`fastify-type-provider-zod`) that validates incoming requests automatically

This means validation logic is written once and enforced in both places. The 1024-character limit, empty string rejection, and whitespace-only rejection all live in one Zod schema.

**Migration Strategy:**

Drizzle Kit for schema migrations. For MVP with a single-table schema, the initial migration creates the todos table. Drizzle Kit generates SQL migration files that can be version-controlled and run automatically on backend startup.

**Caching:** Not needed for MVP. Single user, low data volume, SQLite is already fast for reads.

---

### Category 2: Authentication & Security

**No auth in MVP** (per PRD). But the architecture prepares for it:

- The todo schema doesn't include a `userId` column yet, but adding one later is a simple migration
- API endpoints don't have user-scoped paths in MVP (`/api/todos` not `/api/users/:id/todos`), but Fastify's plugin system makes adding auth middleware straightforward

**API Security (MVP):**

| Concern | Approach |
|---------|----------|
| CORS | `@fastify/cors` — whitelist frontend origin only |
| Input validation | Zod schemas via `fastify-type-provider-zod` — rejects malformed requests |
| XSS prevention | Server: sanitize text input on write. Client: React's JSX escaping handles render-side |
| Request size | Fastify `bodyLimit: 10240` (10KB, per NFR17) |
| Character limit | Zod schema: `z.string().max(1024)` (per NFR17) |
| Error responses | Never expose internal details — generic error messages with appropriate HTTP status codes |
| HTTPS | Enforced at deployment/reverse proxy layer, not in application code |

---

### Category 3: API & Communication

**REST API with JSON.** No API versioning for MVP (single consumer).

**Endpoints:**

| Method | Path | Purpose | Success | Error |
|--------|------|---------|---------|-------|
| GET | `/api/todos` | List all todos | 200 + todo array | 500 |
| POST | `/api/todos` | Create todo | 201 + created todo | 400 (validation) / 500 |
| PATCH | `/api/todos/:id` | Update todo (toggle completed) | 200 + updated todo | 400 / 404 / 500 |
| DELETE | `/api/todos/:id` | Delete todo | 204 (no content) | 404 / 500 |

**Error Response Shape:**

```typescript
{
  error: string;    // Machine-readable error code (e.g., "VALIDATION_ERROR")
  message: string;  // Human-readable message (never exposes internals)
}
```

**API Client (Frontend):**

A thin typed fetch wrapper in the frontend that:
- Uses TypeScript types from the `shared` package for request/response shapes
- Returns typed responses or throws typed errors
- Lives in a single `api.ts` file — not a full SDK, just functions: `fetchTodos()`, `createTodo(text)`, `toggleTodo(id, completed)`, `deleteTodo(id)`

---

### Category 4: Frontend Architecture

**State Management: Custom `useTodos` hook with React `useState`**

No external state library needed. The entire app state is a single list of todos plus per-item error/loading states. A custom `useTodos()` hook encapsulates:
- The todo list state
- Optimistic add/toggle/delete with rollback on API failure
- Loading and error states per operation
- The API client calls

This keeps state management co-located with the data it manages and avoids introducing Redux/Zustand complexity for a single-entity app.

**Optimistic UI Pattern:**

1. User triggers action (add/toggle/delete)
2. Hook applies the mutation to local state immediately (optimistic update)
3. Hook fires the API call asynchronously
4. On success: no-op (state already reflects the change)
5. On failure: roll back local state to previous value, set error state on the affected item

The key architectural decision: each todo item in state carries its own `error` and `pendingAction` properties so the UI can show per-item error callouts and trigger per-item animations.

**SSG Strategy:**

Next.js `output: 'export'` for fully static HTML generation. The page renders an empty shell (input + skeleton/empty state) at build time. On client mount, the `useTodos` hook fetches from the API and hydrates the list. This gives us:
- Instant shell render (SSG)
- No server-side data fetching needed
- The static shell works even when the API is down (per FR15)

**Component File Organization:**

```
frontend/src/
├── app/
│   ├── layout.tsx          (root layout — font, metadata)
│   ├── page.tsx            (single page — composes components)
│   └── globals.css         (Tailwind + design tokens)
├── components/
│   ├── ui/                 (shadcn primitives — checkbox, input, button)
│   ├── todo-input.tsx
│   ├── todo-item.tsx
│   ├── todo-list.tsx
│   ├── empty-state.tsx
│   ├── skeleton-loader.tsx
│   ├── error-callout.tsx
│   └── load-error.tsx
├── hooks/
│   └── use-todos.ts        (state + optimistic UI + API calls)
├── lib/
│   ├── api.ts              (typed fetch wrapper)
│   └── utils.ts            (shadcn cn utility, helpers)
└── config/
    └── placeholders.ts     (contextual placeholder banks)
```

---

### Category 5: Infrastructure & Deployment

**Local Development:**
- Frontend: `localhost:3000` (Next.js dev server with Turbopack)
- Backend: `localhost:3001` (Fastify with tsx watch mode)
- Database: `./data/todos.db` file in the backend package (gitignored)

**Environment Configuration:**
- Frontend: `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3001`
- Backend: `.env` with `PORT=3001`, `DATABASE_PATH=./data/todos.db`, `CORS_ORIGIN=http://localhost:3000`
- Production values set at deployment time

**Logging:**
Fastify's built-in Pino logger — structured JSON logging with request ID tracking. Adequate for MVP, production-grade by default.

**Deployment:** Deferred to post-MVP. The architecture supports:
- Frontend: Vercel, Netlify, or any static host (it's just HTML/JS/CSS)
- Backend: Railway, Fly.io, or any Node.js host
- Database: SQLite file on the backend host (or migrate to PostgreSQL later if needed)

**Monitoring:** Deferred to post-MVP. Pino logging provides baseline observability.

---

Here's the full **Core Architectural Decisions** content I'll add to the document:

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data model and schema design (todo entity with UUID, text, completed, createdAt)
- API contract (REST endpoints, request/response shapes, error format)
- Validation strategy (Zod schemas shared between frontend and backend)
- State management approach (custom useTodos hook with optimistic UI)
- SSG strategy (static export with client-side hydration)

**Important Decisions (Shape Architecture):**
- UUID generation on client for optimistic UI support
- Per-item error/loading state for scoped feedback UX
- API client as typed fetch wrapper (not generated SDK)
- Component file organization (flat components directory)
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
| id | TEXT | Primary key (UUID v4, generated client-side) |
| text | TEXT | NOT NULL, max 1024 characters |
| completed | INTEGER (boolean) | NOT NULL, default false |
| created_at | TEXT | NOT NULL, ISO 8601 timestamp |

**Validation:** Zod schemas in `shared` package. Used by Fastify (via `fastify-type-provider-zod`) for automatic request validation and by the frontend API client for pre-flight validation. Single source of truth for: text length (1-1024 chars), text content (non-empty, trimmed), and completed boolean.

**Migrations:** Drizzle Kit generates versioned SQL migration files. Applied automatically on backend startup. Migration files version-controlled in the repository.

**IDs:** UUID v4 generated on the client before API call. Enables optimistic UI (item appears with ID immediately) and future multi-device sync. The `crypto.randomUUID()` Web API is available in all supported browsers and Node.js.

### Authentication & Security

**MVP: No authentication.** Single-user application with no user accounts.

**Future-proofing:** Todo schema excludes userId in MVP but adding a foreign key column is a single migration. API route structure (`/api/todos`) supports prefixing with auth middleware via Fastify plugins without restructuring.

**Security measures:**
- **CORS:** `@fastify/cors` configured to whitelist frontend origin. Rejects cross-origin requests from unknown domains.
- **Input validation:** Zod schemas enforce text length (1-1024), reject empty/whitespace-only input, validate request body structure. Fastify rejects requests exceeding 10KB body limit.
- **XSS prevention:** Server sanitizes todo text on write (strip HTML tags). React JSX escaping prevents render-side injection. API error messages never include user-submitted content or internal details.
- **HTTPS:** Enforced at reverse proxy / hosting layer. Application code does not handle TLS directly.

### API & Communication Patterns

**Protocol:** REST over HTTP with JSON bodies. No API versioning in MVP (single consumer).

**Endpoints:**
- `GET /api/todos` → 200 with `{ todos: Todo[] }`
- `POST /api/todos` → 201 with `{ todo: Todo }` | 400 validation error
- `PATCH /api/todos/:id` → 200 with `{ todo: Todo }` | 404 not found | 400 validation error
- `DELETE /api/todos/:id` → 204 no content | 404 not found

**Error format:** `{ error: string, message: string }` where `error` is a machine-readable code (VALIDATION_ERROR, NOT_FOUND, INTERNAL_ERROR) and `message` is human-readable without internal details.

**API client (frontend):** Typed fetch wrapper (`lib/api.ts`) with functions mapped to endpoints. Uses `shared` package types for request/response shapes. Throws typed errors for non-2xx responses. No retry logic in the client — retry is handled at the UI layer via user gesture.

### Frontend Architecture

**State management:** Custom `useTodos()` React hook using `useState`. No external state library. The hook encapsulates the full todo lifecycle: fetch, create, toggle, delete, with optimistic updates and rollback.

**Optimistic UI pattern:** Each mutation applies to local state immediately. On API failure, state rolls back to pre-mutation snapshot. Each todo carries `error?: string` and `pendingAction?: 'creating' | 'toggling' | 'deleting'` metadata for per-item UI feedback (animations, callouts).

**SSG approach:** `next.config.ts` with `output: 'export'` for fully static build. Single page (`app/page.tsx`) renders the shell at build time. `useTodos` hook runs client-side on mount, fetching data from the API. Static shell includes input and skeleton/empty-state markup for instant render even without API.

**Component structure:** Flat `components/` directory with one file per component. shadcn primitives in `components/ui/`. Custom components (TodoInput, TodoItem, TodoList, EmptyState, SkeletonLoader, ErrorCallout, LoadError) as individual files. Hooks in `hooks/`, API client in `lib/`, configuration in `config/`.

### Infrastructure & Deployment

**Local development:**
- Frontend: `localhost:3000` (Next.js + Turbopack)
- Backend: `localhost:3001` (Fastify + tsx watch)
- Database: `./data/todos.db` (SQLite file, gitignored)

**Environment configuration:**
- Frontend `.env.local`: `NEXT_PUBLIC_API_URL`
- Backend `.env`: `PORT`, `DATABASE_PATH`, `CORS_ORIGIN`
- No secrets in MVP (no auth). Environment files gitignored with `.env.example` templates committed.

**Logging:** Fastify built-in Pino logger. Structured JSON output, request ID tracking, configurable log levels per environment.

**Deployment, CI/CD, monitoring:** Deferred to post-MVP. Architecture supports static hosting (frontend) + Node.js hosting (backend) on any platform. SQLite can be migrated to PostgreSQL if deployment environment requires it.

### Decision Impact Analysis

**Implementation Sequence:**
1. Monorepo setup with workspaces and shared TypeScript config
2. Shared package: Zod schemas and TypeScript types for API contract
3. Backend: Fastify server, Drizzle schema, migrations, CRUD route handlers
4. Frontend: Next.js static export shell, design tokens, shadcn/ui setup
5. Frontend: Custom components (TodoInput → TodoItem → TodoList → states)
6. Frontend: useTodos hook with optimistic UI and API integration
7. Animation layer applied across components
8. Testing: Jest unit/integration tests, Playwright E2E tests

**Cross-Component Dependencies:**
- Shared Zod schemas drive both backend validation and frontend API client types
- UUID generation on client requires `crypto.randomUUID()` — available in all target environments
- Optimistic UI hook design directly shapes component props (error/pending state per item)
- Animation system depends on state transition events from the useTodos hook
- Design tokens (CSS custom properties) are consumed by all frontend components

---

**What would you like to do?**

- **[A]** Advanced Elicitation — Explore innovative approaches to any specific decisions
- **[P]** Party Mode — Review decisions from multiple perspectives
- **[C]** Continue — Save these decisions and move to implementation patterns

---

**User**

For the todo entry schema, I don't think we need 1024 characters for the text.  I think 128 should be fine.  Can you please update all such documentation.

In the SSG strategy, I was actually thinking that the existing todo items could be served with the static content.  Will that be a problem?





---

**Cursor**

Good catches on both. Let me address each:

### Character Limit: 1024 → 128

Straightforward change. I'll update all references in the architecture document. Worth noting that the **PRD also specifies 1024** (in NFR17: "any todo creation or update request whose description exceeds 1024 characters"), so that will need updating too when you next touch the PRD. I'll flag it in the architecture doc.

### SSG with Pre-rendered Todos

This is worth discussing. There's a meaningful trade-off here.

**What you're describing** is: at build time (or via revalidation), fetch the current todos from the API and bake them into the static HTML. When the page loads, the user sees their actual data immediately — no skeleton loader, no flash of empty state.

**The challenge:** With Next.js `output: 'export'` (pure static), data is only fetched at **build time**. So the baked-in todos become stale the moment a user adds, completes, or deletes anything. The client-side JS would then re-fetch on mount and replace the stale list, which could cause:

- A visible content flash (stale data → fresh data) that risks CLS violations
- Confusion if a todo was deleted since the last build but still appears briefly
- A build-time dependency on the API being available

**There's a better path though:** If we switch from pure static export to **Next.js with ISR (Incremental Static Regeneration)** or server-side rendering, we can serve fresh data on each page load. This means:

- **ISR approach:** The page is server-rendered with current todos, cached, and revalidated on-demand (e.g., after every mutation the frontend triggers a revalidation). Users see current data on first paint. Client-side JS handles mutations with optimistic UI as before.
- **Trade-off:** This requires a Next.js **server** (not just static files). The frontend can no longer be deployed to a pure static host — it needs a Node.js runtime (Vercel handles this natively, or any Node host).

**My recommendation:** If you want todos in the initial HTML, ISR is the right approach. It's a small architectural shift — we drop `output: 'export'` and use Next.js server-side rendering with on-demand revalidation. The frontend deployment becomes a Node.js server instead of static files, but the UX benefit is real: users see their data on first paint with no loading state flash.

However, this means the **frontend also needs a Node.js host**, which changes the deployment story. Both frontend and backend become server processes.

**Do you want to go the ISR route** (data in initial HTML, requires Node.js frontend host), or **stick with pure SSG** (static shell + client-side fetch, simpler deployment)?

This decision affects the architecture content I'm about to save, so I'd like to get your input before committing.

---

**User**

Yes please, go for the ISR approach

---

**Cursor**

Let me update the architecture document with both changes — 128 char limit and ISR strategy — and save the full Core Architectural Decisions section.

Now I need to update the existing 1024-char references and the SSG references, then append the decisions section.

Now let me append the full Core Architectural Decisions section with both changes incorporated.

All saved. Now loading the next step.

Core Architectural Decisions saved with ISR strategy and 128-char limit. Now let's define implementation patterns.

Kevin, this step is about preventing AI agents from making inconsistent choices when implementing different parts of the codebase. Given our stack (Next.js + Fastify + Drizzle + TypeScript), here are the key conflict points and my recommended patterns for each. Tell me where you disagree or want something different.

---

### Naming Patterns

**The core tension:** Database conventions use `snake_case`, JavaScript uses `camelCase`, React components use `PascalCase`, and file systems use either `kebab-case` or `camelCase`. Without explicit rules, different agents will mix these unpredictably.

**My recommendation:**

| Context | Convention | Example |
|---------|-----------|---------|
| Database tables | snake_case, plural | `todos` |
| Database columns | snake_case | `created_at` |
| API JSON fields | camelCase | `{ createdAt, todoText }` |
| API endpoints | kebab-case, plural nouns | `/api/todos`, `/api/todos/:id` |
| TypeScript files | kebab-case | `todo-item.tsx`, `use-todos.ts` |
| React components | PascalCase (export name) | `export function TodoItem()` |
| Functions/variables | camelCase | `fetchTodos`, `isCompleted` |
| Constants | UPPER_SNAKE_CASE | `MAX_TEXT_LENGTH` |
| CSS custom properties | kebab-case with prefix | `--color-accent`, `--shadow-resting` |
| Zod schemas | camelCase with Schema suffix | `createTodoSchema`, `todoSchema` |
| TypeScript types/interfaces | PascalCase | `Todo`, `CreateTodoRequest` |
| Environment variables | UPPER_SNAKE_CASE | `DATABASE_PATH`, `CORS_ORIGIN` |

**The snake_case → camelCase boundary:** Drizzle handles this automatically in the ORM layer. Database columns are `snake_case`, but the TypeScript objects returned by Drizzle use the property names defined in the schema file. We define Drizzle columns with `snake_case` SQL names but `camelCase` TypeScript property names.

---

### Structure Patterns

**Tests: Co-located with source files.**

```
components/
├── todo-item.tsx
├── todo-item.test.tsx      ← unit test right next to the component
hooks/
├── use-todos.ts
├── use-todos.test.ts
```

Backend routes follow the same pattern. This keeps tests discoverable and makes it obvious when something is untested.

**E2E tests: Root-level `e2e/` directory** since they span both frontend and backend:

```
e2e/
├── journey-1-first-visit.spec.ts
├── journey-2-quick-capture.spec.ts
├── journey-3-review-tidy.spec.ts
├── journey-4-error-recovery.spec.ts
```

**Exports: Named exports only.** No default exports anywhere (except `page.tsx` and `layout.tsx` which Next.js requires). Named exports are refactor-safe and prevent naming inconsistencies across imports.

**Import ordering** (enforced by ESLint):
1. External packages (`react`, `next`, `fastify`)
2. Internal packages (`@shared/types`, `@shared/schemas`)
3. Project-relative (`@/components/...`, `@/hooks/...`, `@/lib/...`)
4. Side-effect imports (CSS)

---

### Format Patterns

**API responses — consistent wrappers:**

```typescript
// Success (single item)
{ todo: Todo }

// Success (list)
{ todos: Todo[] }

// Error
{ error: "VALIDATION_ERROR", message: "Text must be between 1 and 128 characters" }
```

No nested `data` wrapper. No `meta` or `pagination` for MVP. The response key matches the resource name.

**Dates:** ISO 8601 strings everywhere (`2026-03-16T14:30:00.000Z`). Stored as TEXT in SQLite. Serialized as strings in JSON. Parsed to `Date` objects only in the UI layer when needed for relative time display ("2m ago").

**Booleans in SQLite:** Stored as INTEGER (0/1) via Drizzle's `{ mode: 'boolean' }`. Drizzle handles the conversion — TypeScript code always sees `boolean`.

**Null handling:** API never returns `null` for optional fields. Omit the field entirely, or use a defined default. The Zod schemas enforce this.

---

### Process Patterns

**Optimistic UI — the exact flow every mutation follows:**

1. Generate UUID client-side (for create) or use existing ID
2. Save a snapshot of current state
3. Apply optimistic update to local state
4. Fire API call
5. On success: trigger `revalidatePath('/')` via Server Action, clear pending state
6. On failure: restore snapshot, set `error` on the affected item, trigger shake animation

Every mutation follows this exact sequence. No variation.

**Error handling layers:**

| Layer | Responsibility | Example |
|-------|---------------|---------|
| Zod schema | Validate shape and constraints | Reject empty text, text > 128 chars |
| Fastify handler | Business logic errors | 404 for non-existent todo |
| Fastify error handler | Catch-all, format response | Convert exceptions to `{ error, message }` |
| Frontend API client | Convert HTTP errors to typed errors | Throw `ApiError` with code and message |
| useTodos hook | Rollback state, set per-item error | Restore snapshot, set `error` field |
| UI components | Display error callout | Render `ErrorCallout` linked via `aria-describedby` |

**Loading states:**

| State | Where | Representation |
|-------|-------|---------------|
| Initial page load | Server-side (ISR) | No loading state — data is in the HTML |
| Server unavailable during ISR | `page.tsx` | Renders `LoadError` component with retry |
| Item creating | `todo.pendingAction === 'creating'` | Anticipation animation |
| Item toggling | `todo.pendingAction === 'toggling'` | No visual indicator (optimistic is instant) |
| Item deleting | `todo.pendingAction === 'deleting'` | No visual indicator (optimistic is instant) |

**Validation timing:** Validate on the client before API call (fail fast, preserve user input) AND on the server (never trust client). Same Zod schema, both locations.

---

### Enforcement Guidelines

**All AI agents MUST:**

1. Follow the naming conventions table exactly — no exceptions, no "I think this reads better" deviations
2. Use named exports (except Next.js-required default exports)
3. Co-locate unit tests with source files
4. Use the shared Zod schemas for all validation — never write ad-hoc validation
5. Follow the 6-step optimistic UI mutation flow for every mutation
6. Never return `null` in API responses — omit optional fields or use defaults
7. Use ISO 8601 strings for all date handling in API layer
8. Handle `prefers-reduced-motion` for every animation
9. Include `aria-*` attributes and keyboard handling in every interactive component
10. Use the `@/` import alias for all project-relative imports

---

Here's the full **Implementation Patterns & Consistency Rules** content I'll add to the document. Does this look right, or do you want to adjust any of these conventions?

**What would you like to do?**

- **[A]** Advanced Elicitation — Explore additional consistency patterns
- **[P]** Party Mode — Review patterns from different implementation perspectives
- **[C]** Continue — Save these patterns and move to project structure

---

**User**

Please make typescript files use camelCase rather than kebab-case

I'm now also thinking that the requirement for optimistic updates is overkill for MVP.  I'd like to dial out that requirement and instead have the UI reflect that an action is pending rather than making the change immediately in the UI

---

**Cursor**

Two good calls. Let me work through the implications of each.

### 1. File naming: camelCase

Straightforward. `todoItem.tsx`, `useTodos.ts`, `loadError.tsx`, etc.

### 2. Replacing Optimistic UI with Pending States

This is a meaningful simplification. Here's what changes:

**New mutation flow (replaces the 6-step optimistic pattern):**

1. User triggers action (add/toggle/delete)
2. Set `pendingAction` on the affected item (or input area for create)
3. Fire API call
4. On success: update local state with server response, clear pending, play success animation
5. On failure: clear pending, set error on the affected item, play error animation

**Key differences:**
- No state snapshots, no rollback logic
- The todo doesn't appear in the list until the server confirms creation
- Toggle doesn't visually flip until the server confirms
- Delete doesn't remove the item until the server confirms
- The UX spec's "anticipation animation" becomes the primary pending feedback — a subtle pulse or indicator on the affected item
- Input clears immediately on submit (that's just resetting the form, not an optimistic update), but the new todo only materializes in the list on API success

**UUID generation moves server-side.** We no longer need client-generated IDs since items don't appear in the list before server confirmation. The backend generates UUIDs and returns them in the response.

**What the pending states look like per action:**

| Action | Pending UX | Success UX | Failure UX |
|--------|-----------|------------|------------|
| Create | Input clears, anticipation animation in list area (space opening / placeholder pulse) | New todo slides in with entrance animation | Error callout near input, text NOT preserved (input already cleared) — or we keep text until confirmed |
| Toggle | Checkbox shows pending indicator (pulse/dim) | Strikethrough + migration animation plays | Item shakes, error callout |
| Delete | Item dims or shows pending indicator | Exit animation plays, gap closes | Item shakes, error callout |

**One question for you on Create:** When the user hits enter, should the input clear immediately (feels responsive but text is lost if the API fails), or should it stay until the server confirms (feels slightly sluggish but text is preserved on failure)?

The UX spec originally said the input clears instantly and text is preserved on failure (which was the optimistic approach). With pending states, I'd recommend: **input clears immediately, but we cache the text internally** so that if the create fails, the error callout includes a "restore" action that puts the text back in the input. Best of both worlds — feels responsive, no data loss.

Does that approach work for you, or would you prefer the input to stay populated until confirmation?

---

**User**

I like your approach.  Can we ensure that the PRD and other documentation gets updated to reflect these changes?

---

**Cursor**

Absolutely. There are changes needed across three documents — the architecture doc, the PRD, and the UX spec. Let me track everything systematically.

Let me start by reading the current state of all three documents to identify every reference that needs updating.

Good — I can see all the references. Let me work through all three documents systematically.

**Architecture doc** — updating optimistic UI → pending states, file naming → camelCase, UUID → server-side.

Now update the file naming in the component structure.

Now updating the **PRD**. Let me find all the references that need changing.

Now the **UX spec**. Let me update the optimistic UI references and the character limit.

Now let me also update the journey flows that reference optimistic behavior. Let me check the key ones.

Now let me check the SSG references in the UX spec and update the platform strategy section.

All three documents are updated. Here's the summary of what changed:

**PRD (`prd.md`) — 10 edits:**
- NFR17: 1024 → 128 character limit
- All "SSG" / "statically generated" references → ISR / server-rendered
- Implementation considerations updated for ISR

**UX Spec (`ux-design-specification.md`) — 10 edits:**
- "Optimistic UI updates" → pending state feedback with cached text recovery
- Journey 1 & 2 mermaid flows: SSG shell → ISR page with data
- Capture/Complete experience mechanics updated for pending → confirmed flow
- Journey patterns: optimistic intent → responsive intent, text preservation → text recovery with restore action
- 1024 char limit → 128
- All SSG references → ISR
- Graceful degradation updated for ISR fallback

**Architecture (`architecture.md`) — 12 edits:**
- Cross-cutting concerns: optimistic UI → pending state pattern
- Decision priorities: removed client-side UUID, updated state management description
- Schema: UUID generation moved server-side
- Frontend architecture: full rewrite of mutation pattern section
- Component file names: kebab-case → camelCase
- Hook description: pending states, not optimistic
- PRD deviation log: added optimistic UI and 128 char entries

---

Now, back to the workflow — let me present the **Implementation Patterns & Consistency Rules** content with all corrections incorporated for your review. Here it is:

---

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
- TypeScript files: camelCase (`todoItem.tsx`, `useTodos.ts`, `emptyState.tsx`)
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
├── todoItem.tsx
├── todoItem.test.tsx
hooks/
├── useTodos.ts
├── useTodos.test.ts
backend/src/routes/
├── todos.ts
├── todos.test.ts
```

**E2E tests:** Root-level `e2e/` directory, one file per user journey.

```
e2e/
├── journey1FirstVisit.spec.ts
├── journey2QuickCapture.spec.ts
├── journey3ReviewTidy.spec.ts
├── journey4ErrorRecovery.spec.ts
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

---

**What would you like to do?**

- **[A]** Advanced Elicitation — Explore additional consistency patterns
- **[P]** Party Mode — Review patterns from different implementation perspectives
- **[C]** Continue — Save these patterns and move to project structure

---

**User**

c

---

**Cursor**

Now append the Implementation Patterns section.

Now loading the next step.

Implementation Patterns saved. Now let me define the complete project structure based on everything we've decided.

Kevin, here's the full project tree mapped to our architectural decisions. I've been specific about every file and directory — no placeholders.

---

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
│   ├── journey1FirstVisit.spec.ts      (empty state → first todo)
│   ├── journey2QuickCapture.spec.ts    (returning user, mobile add)
│   ├── journey3ReviewTidy.spec.ts      (complete, uncomplete, delete)
│   └── journey4ErrorRecovery.spec.ts   (all error types and retry)
│
├── packages/
│   ├── shared/                         (API contract — types and validation)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts                (barrel export)
│   │       ├── schemas.ts              (Zod schemas: createTodoSchema, updateTodoSchema, todoSchema)
│   │       ├── types.ts                (TypeScript types: Todo, CreateTodoRequest, UpdateTodoRequest, ApiError, etc.)
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
│   │           └── errorHandler.ts     (global error handler — formats { error, message })
│   │
│   └── frontend/                       (Next.js 16 + shadcn/ui)
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.ts              (ISR config, API_URL env, image domains)
│       ├── jest.config.ts
│       ├── components.json             (shadcn/ui config)
│       ├── .env.local                  (NEXT_PUBLIC_API_URL, API_URL — gitignored)
│       ├── .env.example
│       ├── public/
│       │   └── favicon.ico
│       └── src/
│           ├── app/
│           │   ├── layout.tsx          (root layout — Outfit font, metadata, viewport)
│           │   ├── page.tsx            (server component — fetches todos via API_URL, renders TodoPage)
│           │   └── globals.css         (Tailwind directives + CSS custom properties / design tokens)
│           ├── components/
│           │   ├── ui/                 (shadcn primitives — checkbox, input, button)
│           │   ├── todoPage.tsx        (client component — receives server data, orchestrates UI)
│           │   ├── todoPage.test.tsx
│           │   ├── todoInput.tsx       (text input with contextual placeholders)
│           │   ├── todoInput.test.tsx
│           │   ├── todoItem.tsx        (single todo with checkbox, text, timestamp, delete)
│           │   ├── todoItem.test.tsx
│           │   ├── todoList.tsx        (active/completed sections with divider)
│           │   ├── todoList.test.tsx
│           │   ├── emptyState.tsx      (personality-driven empty list message)
│           │   ├── emptyState.test.tsx
│           │   ├── skeletonLoader.tsx  (breathing pulse placeholder rows)
│           │   ├── skeletonLoader.test.tsx
│           │   ├── errorCallout.tsx    (inline per-action error with restore action for create)
│           │   ├── errorCallout.test.tsx
│           │   ├── loadError.tsx       (full list-area error with retry CTA)
│           │   └── loadError.test.tsx
│           ├── hooks/
│           │   ├── useTodos.ts         (state management, pending states, API calls, revalidation)
│           │   └── useTodos.test.ts
│           ├── lib/
│           │   ├── api.ts              (typed fetch wrapper — fetchTodos, createTodo, toggleTodo, deleteTodo)
│           │   ├── api.test.ts
│           │   ├── actions.ts          (Next.js Server Actions — revalidatePath)
│           │   └── utils.ts            (shadcn cn utility, relative time formatter)
│           └── config/
│               └── placeholders.ts     (contextual placeholder banks — empty, hasItems, justAdded)
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
      Client Component (todoPage.tsx — "use client")
        └── useTodos hook manages all client-side state and mutations
        └── All child components are pure presentational (receive props)
```

**Data boundary:**
All database access is encapsulated in `db/client.ts` and `db/schema.ts`. Route handlers interact with data only through Drizzle queries on the schema. No raw SQL outside of migration files.

### Requirements to Structure Mapping

**FR1-FR6 (Task Management — create, view, complete, uncomplete, delete):**
- Backend: `routes/todos.ts` (all CRUD handlers)
- Frontend: `hooks/useTodos.ts` (mutation logic), `components/todoInput.tsx` (create), `components/todoItem.tsx` (complete, delete), `components/todoList.tsx` (view)
- Shared: `schemas.ts` (createTodoSchema, updateTodoSchema), `types.ts` (Todo, CreateTodoRequest)

**FR7-FR9 (Task Visualization — completed distinction, empty state, loading):**
- Frontend: `components/todoItem.tsx` (completed styling), `components/emptyState.tsx`, `components/skeletonLoader.tsx`
- CSS: `globals.css` (design tokens for completed opacity, shadow tokens)

**FR10-FR12 (Data Persistence):**
- Backend: `db/schema.ts` (Drizzle schema), `db/client.ts` (connection), `drizzle/` (migrations)

**FR13-FR15 (Error Handling):**
- Backend: `plugins/errorHandler.ts` (global error formatting)
- Frontend: `components/errorCallout.tsx` (per-action errors), `components/loadError.tsx` (initial load failure)
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
# From repo root — starts both services
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
npm run db:migrate   # Apply migrations (backend — also runs on server start)
```

---

**What would you like to do?**

- **[A]** Advanced Elicitation — Explore alternative project organization
- **[P]** Party Mode — Review structure from different perspectives
- **[C]** Continue — Save this structure and move to architecture validation

---

**User**

Actually, go back to making typescript files kebab-case

---

**Cursor**

No problem. Let me revert all the file naming references back to kebab-case across the architecture document.

The naming convention line and the structure examples need updating. The references to `useTodos` as a hook/function name (PascalCase in code) are fine — it's only the file names that should be kebab-case.

Now the component structure tree from the earlier step 4 section.

Done. All TypeScript file names are back to kebab-case across the architecture document. The convention line, test co-location examples, E2E test files, and component structure tree are all consistent.

The project structure content I presented (not yet saved) also uses kebab-case now. Ready to continue — would you like to proceed?

**[C]** Continue — Save the project structure and move to architecture validation

---

**User**

c

---

**Cursor**

Project structure saved. Now loading the validation step.

I've run a comprehensive validation of the architecture. Here are the results:

---

### Coherence Validation

**Decision Compatibility:** All technology choices are compatible and well-integrated.
- Next.js 16 + TypeScript + Tailwind CSS v4 + shadcn/ui: first-class integrations, no conflicts
- Fastify + TypeScript + Drizzle ORM + better-sqlite3: all compatible, Fastify's Zod type provider bridges to shared schemas cleanly
- ISR server-side fetch + client-side pending state mutations: standard Next.js App Router pattern
- Jest + Playwright: no conflicts, different test scopes
- npm workspaces: works natively with all three packages

**Pattern Consistency:** All patterns align with the technology stack.
- kebab-case file naming follows Next.js and React ecosystem conventions
- camelCase JSON fields match JavaScript conventions, snake_case DB columns match SQL conventions, Drizzle handles the mapping
- Named exports align with TypeScript best practices and tree-shaking
- Co-located tests follow the React testing community standard

**Structure Alignment:** Project structure directly supports every architectural decision.
- Three-package monorepo cleanly separates concerns
- Shared package enforces the API contract at compile time
- Server/client boundary in frontend is explicit (page.tsx → todo-page.tsx)

No contradictions found.

---

### Requirements Coverage Validation

**Functional Requirements — all 19 FRs covered:**

| FR | Requirement | Architectural Support |
|----|------------|----------------------|
| FR1-FR5 | CRUD operations | REST endpoints + useTodos hook + components |
| FR6 | Display text, status, timestamp | Todo schema + todo-item component |
| FR7 | Completed distinction | todo-list divider + completed styling |
| FR8 | Empty state | empty-state component |
| FR9 | Loading state | skeleton-loader (ISR fallback when API unavailable) |
| FR10-FR12 | Data persistence + CRUD API | Drizzle + SQLite + 4 REST endpoints |
| FR13-FR14 | Error messages + retry | error-callout + load-error + cached text recovery |
| FR15 | App shell without API | ISR fallback renders shell gracefully |
| FR16-FR17 | Mobile + desktop | Responsive breakpoints in globals.css |
| FR18 | Keyboard navigation | Enforcement rule #9, tab order in all components |
| FR19 | Assistive tech | ARIA attributes, role="alert", aria-describedby |

**Non-Functional Requirements — all 20 NFRs covered:**

| NFR | Requirement | Architectural Support |
|-----|------------|----------------------|
| NFR1-NFR4 | Performance (Lighthouse, FCP, LCP, CLS) | ISR eliminates loading flash, pre-rendered HTML, Tailwind CSS |
| NFR5 | Cache-control + asset optimization | Next.js handles fingerprinting and caching natively |
| NFR6-NFR12 | Accessibility (WCAG 2.1 AA) | Radix primitives, enforcement rules, prefers-reduced-motion |
| NFR13-NFR14 | Input validation + XSS | Shared Zod schemas + server sanitization + React JSX escaping |
| NFR15 | No internal details in errors | error-handler plugin formats generic responses |
| NFR16 | HTTPS | Deployment-layer enforcement (documented) |
| NFR17 | 128 char limit + 10KB body | Zod schema + Fastify bodyLimit config |
| NFR18 | 80% test coverage | Co-located Jest tests + Playwright E2E |
| NFR19 | No flaky tests | Fastify .inject() avoids server lifecycle, deterministic |
| NFR20 | E2E for all 4 journeys | 4 dedicated Playwright test files |

---

### Implementation Readiness

**Decision completeness:** All critical and important decisions are documented with technology choices, rationale, and concrete examples.

**Structure completeness:** Every file and directory is specified. No generic placeholders. Requirements are mapped to specific locations.

**Pattern completeness:** Naming, structure, format, and process conventions are all defined with examples. The 10 enforcement rules give agents clear guardrails.

---

### Gap Analysis

**Critical gaps:** None found.

**Important gaps (addressed):**
- The PRD deviation log captures all differences between the PRD/UX spec and architectural decisions (128 chars, ISR, pending states). All three documents have been updated to reflect current decisions.

**Minor observations (non-blocking):**
- Outfit font loading strategy (subsetting, `font-display: swap`, preload hints) is an implementation detail but important for Lighthouse performance. Should be addressed in the first frontend story.
- CI/CD pipeline is explicitly deferred to post-MVP. The test infrastructure is CI-ready whenever that decision is made.
- No rate limiting defined for the API. Acceptable for single-user MVP but noted for future phases.

---

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (low)
- [x] Technical constraints identified (7 constraints)
- [x] Cross-cutting concerns mapped (5 concerns)

**Architectural Decisions**
- [x] Critical decisions documented (5 critical, 5 important)
- [x] Technology stack fully specified (Next.js 16, Fastify, Drizzle, SQLite, Zod)
- [x] Integration patterns defined (REST API, shared types, ISR revalidation)
- [x] Performance considerations addressed (ISR, Tailwind, font optimization)

**Implementation Patterns**
- [x] Naming conventions established (8 categories)
- [x] Structure patterns defined (co-located tests, named exports, import ordering)
- [x] Format patterns specified (API responses, dates, booleans, null handling)
- [x] Process patterns documented (mutation flow, error layers, loading states, validation)

**Project Structure**
- [x] Complete directory structure defined (~60 files across 3 packages)
- [x] Component boundaries established (API, server/client, data)
- [x] Integration points mapped (shared package, ISR fetch, revalidation)
- [x] Requirements to structure mapping complete (all 19 FRs mapped)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — low-complexity project with clear requirements, deliberate technology choices, and comprehensive patterns.

**Key Strengths:**
- Single shared validation layer (Zod) eliminates frontend/backend contract drift
- ISR strategy gives fast first-paint with real data while keeping the architecture simple
- Pending state pattern is straightforward to implement and test compared to optimistic UI
- Every component has a clear, single responsibility with explicit file locations
- PRD deviation log maintains traceability between documents

**Areas for Future Enhancement:**
- Authentication and multi-user support (Phase 2)
- Dark mode token set (CSS custom properties are ready)
- CI/CD pipeline and deployment automation
- API rate limiting
- Offline capability

---

**What would you like to do?**

- **[A]** Advanced Elicitation — Address any architectural concerns
- **[P]** Party Mode — Review validation from different perspectives
- **[C]** Continue — Save validation results and complete the architecture

---

**User**

c

---

**Cursor**

Now loading the completion step.

Congratulations, Kevin -- the architecture for **todo-bmad** is complete!

Here's what we accomplished together across 8 collaborative steps:

1. **Initialized** the architecture document and loaded all your planning artifacts (PRD, UX design spec, visual design directions).
2. **Analyzed project context** -- mapped all 19 functional requirements, 20 non-functional requirements, and 5 cross-cutting concerns.
3. **Evaluated and selected the technology stack** -- Next.js 16 (frontend), Fastify (backend), SQLite + Drizzle ORM (database), Zod (shared validation), Jest + Playwright (testing), all in a 100% TypeScript monorepo with npm workspaces.
4. **Made core architectural decisions** across data, security, API, frontend, and infrastructure -- including the shift from SSG to ISR for server-rendered fresh data, the move from optimistic UI to a pending state pattern, and server-side UUID generation.
5. **Defined implementation patterns and consistency rules** -- 10 enforcement rules covering naming conventions (kebab-case files, camelCase code, snake_case DB), structure patterns, format patterns, and process conventions to guide AI agents.
6. **Mapped the complete project structure** -- ~60 files across 3 packages with every component, hook, utility, and test file specified with clear purpose annotations.
7. **Validated the entire architecture** -- confirmed coherence across all decisions, 100% requirements coverage, implementation readiness, and no critical gaps.
8. **Completed the workflow** with this handoff summary.

The architecture document at `_bmad-output/planning-artifacts/architecture.md` is now your **single source of truth** for all technical decisions. It will ensure consistent implementation across every story and sprint.

---

**What's next?** The natural next step is to create your **epics and stories** to break the requirements down into implementable units, then run **sprint planning** to sequence them. You can invoke `/bmad-help` any time to see your options.

Do you have any questions about the architecture document or any of the decisions we made?

