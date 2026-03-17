# Story 1.1: Project Scaffolding & Shared API Contract

Status: review

## Story

As a developer,
I want the monorepo scaffolded with shared types and validation schemas,
So that all packages have a consistent foundation and API contract.

## Acceptance Criteria

1. **Given** a fresh clone of the repository **When** `npm install` is run at the root **Then** all 3 workspace packages (shared, backend, frontend) install successfully

2. **Given** the shared package **When** schemas are imported **Then** `createTodoSchema`, `updateTodoSchema`, and `todoSchema` are available with correct Zod validation rules

3. **Given** the shared package **When** types are imported **Then** `Todo`, `CreateTodoRequest`, `UpdateTodoRequest`, and `ApiError` TypeScript types are available

4. **Given** the shared package **When** constants are imported **Then** `MAX_TEXT_LENGTH` (128) and error code constants (`VALIDATION_ERROR`, `NOT_FOUND`, `INTERNAL_ERROR`) are available

5. **Given** TypeScript strict mode enabled **When** any package is built **Then** it compiles with zero errors

6. **Given** the `createTodoSchema` **When** text of 0 characters, only whitespace, or exceeding 128 characters is validated **Then** validation fails with a descriptive error

7. **Given** the `createTodoSchema` **When** valid text between 1-128 characters is validated **Then** validation succeeds and the text is trimmed

## Tasks / Subtasks

- [x] Task 1: Initialize root monorepo (AC: #1, #5)
  - [x] 1.1 Create root `package.json` with npm workspaces pointing to `packages/*`
  - [x] 1.2 Create `tsconfig.base.json` with TypeScript strict mode, path aliases, and shared compiler options
  - [x] 1.3 Create `.gitignore` (node_modules, .env, .env.local, data/, .next/, dist/, *.db)
  - [x] 1.4 Create root `.env.example` documenting all env vars across packages
  - [x] 1.5 Add root `package.json` scripts: `dev`, `build`, `test`, `test:e2e`, `db:generate`, `db:migrate`
- [x] Task 2: Create shared package with Zod schemas and types (AC: #2, #3, #4, #6, #7)
  - [x] 2.1 Create `packages/shared/package.json` with name `@todo-bmad/shared`, Zod dependency, barrel entry point
  - [x] 2.2 Create `packages/shared/tsconfig.json` extending base config
  - [x] 2.3 Create `packages/shared/src/constants.ts` — `MAX_TEXT_LENGTH = 128`, error codes `VALIDATION_ERROR`, `NOT_FOUND`, `INTERNAL_ERROR`
  - [x] 2.4 Create `packages/shared/src/schemas.ts` — `createTodoSchema` (text: trimmed string 1-128 chars, strips whitespace-only), `updateTodoSchema` (completed: boolean), `todoSchema` (id, text, completed, createdAt)
  - [x] 2.5 Create `packages/shared/src/types.ts` — `Todo`, `CreateTodoRequest`, `UpdateTodoRequest`, `ApiError` types inferred from Zod schemas
  - [x] 2.6 Create `packages/shared/src/index.ts` barrel export (all schemas, types, and constants as named exports)
  - [x] 2.7 Write unit tests for `createTodoSchema` validation: empty string fails, whitespace-only fails, >128 chars fails, valid 1-128 chars succeeds with trimming, HTML content passes through (sanitization is backend responsibility)
  - [x] 2.8 Write unit tests for `updateTodoSchema` validation: boolean required, non-boolean fails
  - [x] 2.9 Write unit tests for `todoSchema`: validates complete Todo shape
- [x] Task 3: Scaffold frontend package (AC: #1, #5)
  - [x] 3.1 Run `npx create-next-app@latest` in `packages/frontend` with TypeScript, Tailwind, ESLint, App Router, src directory, npm
  - [x] 3.2 Configure `tsconfig.json` to extend `../../tsconfig.base.json` and set `@/` path alias to `./src/`
  - [x] 3.3 Run `npx shadcn@latest init` to set up shadcn/ui with new-york style
  - [x] 3.4 Add `@todo-bmad/shared` as a workspace dependency
  - [x] 3.5 Strip default create-next-app boilerplate content from page.tsx (leave minimal "Hello World" placeholder)
  - [x] 3.6 Create `.env.example` documenting `NEXT_PUBLIC_API_URL`, `API_URL`, `REVALIDATION_SECRET`
  - [x] 3.7 Install and configure Jest with ts-jest for frontend unit testing
  - [x] 3.8 Verify `npm run build` compiles with zero TypeScript errors
- [x] Task 4: Scaffold backend package (AC: #1, #5)
  - [x] 4.1 Create `packages/backend/package.json` with all dependencies
  - [x] 4.2 Create `packages/backend/tsconfig.json` extending base config
  - [x] 4.3 Create minimal `packages/backend/src/index.ts` entry point (Fastify server that starts on configured port)
  - [x] 4.4 Create `packages/backend/src/app.ts` Fastify app factory (empty plugin/route registration placeholder)
  - [x] 4.5 Create `packages/backend/src/config.ts` environment config loader (PORT, DATABASE_PATH, CORS_ORIGIN)
  - [x] 4.6 Add `@todo-bmad/shared` as a workspace dependency
  - [x] 4.7 Create `.env.example` documenting `PORT`, `DATABASE_PATH`, `CORS_ORIGIN`, `REVALIDATION_SECRET`
  - [x] 4.8 Create `data/.gitkeep` for SQLite database directory
  - [x] 4.9 Install and configure Jest with ts-jest for backend unit testing
  - [x] 4.10 Verify TypeScript compilation with zero errors
- [x] Task 5: Verify cross-package integration (AC: #1, #5)
  - [x] 5.1 Verify `npm install` at root installs all 3 workspaces without errors
  - [x] 5.2 Verify frontend can import from `@todo-bmad/shared` (schemas, types, constants)
  - [x] 5.3 Verify backend can import from `@todo-bmad/shared` (schemas, types, constants)
  - [x] 5.4 Verify `npm run build` at root compiles all packages with zero errors
  - [x] 5.5 Run all shared package unit tests and confirm they pass

## Dev Notes

### Architecture Compliance

This story establishes the project foundation that every subsequent story builds upon. Decisions made here propagate through the entire codebase. Follow the architecture document exactly.

**Source:** [architecture.md — Starter Template Evaluation, Project Structure & Boundaries]

### Technology Versions (Verified March 2026)

| Package | Version | Notes |
|---------|---------|-------|
| Next.js | 16 (latest via create-next-app@latest) | Turbopack default, React 19.2, App Router |
| Fastify | ^5.8 | Install latest 5.x; do NOT use Fastify 4.x |
| Zod | ^4.3 | Current stable release |
| Drizzle ORM | ^0.45 | Use 0.x stable, NOT the 1.0 beta |
| better-sqlite3 | latest | Pair with @types/better-sqlite3 |
| TypeScript | ^5.1 (via create-next-app defaults) | Strict mode required |
| shadcn/ui | CLI v4 | `npx shadcn@latest init` — uses Radix UI primitives |
| Jest | latest | With ts-jest for TypeScript |
| Playwright | latest | E2E tests (installed at root, configured later) |

### Shared Package Schema Specifications

**`createTodoSchema`:**
```typescript
import { z } from "zod";
import { MAX_TEXT_LENGTH } from "./constants";

export const createTodoSchema = z.object({
  text: z.string().trim().min(1).max(MAX_TEXT_LENGTH),
});
```
- Trims whitespace before validation
- Rejects empty strings and whitespace-only strings after trimming
- Rejects strings exceeding 128 characters
- Does NOT sanitize HTML (that's the backend's responsibility on write — Story 1.4)

**`updateTodoSchema`:**
```typescript
export const updateTodoSchema = z.object({
  completed: z.boolean(),
});
```

**`todoSchema`:**
```typescript
export const todoSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  completed: z.boolean(),
  createdAt: z.string().datetime(),
});
```

**Types derived from schemas:**
```typescript
export type Todo = z.infer<typeof todoSchema>;
export type CreateTodoRequest = z.infer<typeof createTodoSchema>;
export type UpdateTodoRequest = z.infer<typeof updateTodoSchema>;

export interface ApiError {
  error: string;
  message: string;
}
```

**Constants:**
```typescript
export const MAX_TEXT_LENGTH = 128;
export const VALIDATION_ERROR = "VALIDATION_ERROR";
export const NOT_FOUND = "NOT_FOUND";
export const INTERNAL_ERROR = "INTERNAL_ERROR";
```

### Naming Conventions (Enforced Across All Stories)

| Context | Convention | Example |
|---------|-----------|---------|
| TypeScript files | kebab-case | `todo-item.tsx`, `use-todos.ts` |
| React components | PascalCase exports | `export function TodoItem()` |
| Functions/variables | camelCase | `fetchTodos`, `isCompleted` |
| Constants | UPPER_SNAKE_CASE | `MAX_TEXT_LENGTH` |
| Zod schemas | camelCase + Schema suffix | `createTodoSchema` |
| TypeScript types | PascalCase | `Todo`, `CreateTodoRequest` |
| CSS custom properties | kebab-case with prefix | `--color-accent` |
| DB tables | snake_case plural | `todos` |
| DB columns | snake_case | `created_at` |
| API JSON fields | camelCase | `createdAt` |
| Error codes | UPPER_SNAKE_CASE | `VALIDATION_ERROR` |
| Env vars | UPPER_SNAKE_CASE | `DATABASE_PATH` |

### Exports Convention

**Named exports only.** No default exports anywhere except where Next.js requires them (page.tsx, layout.tsx). This applies to the shared package, backend, and all frontend files.

### Import Ordering (Enforced by ESLint)

1. External packages (`react`, `next`, `fastify`, `zod`)
2. Internal packages (`@todo-bmad/shared`)
3. Project-relative (`@/components/...`, `@/hooks/...`, `@/lib/...`)
4. Side-effect imports (CSS)

### Root tsconfig.base.json Guidance

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

Each package extends this and adds package-specific overrides (jsx, paths, outDir, etc.).

### Root package.json Workspace Configuration

```json
{
  "name": "todo-bmad",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "...",
    "build": "...",
    "test": "...",
    "test:e2e": "...",
    "db:generate": "npm run db:generate -w packages/backend",
    "db:migrate": "npm run db:migrate -w packages/backend"
  }
}
```

The `dev` script should run both frontend and backend concurrently. Use `concurrently` or npm workspace `--workspace` flags.

### Complete Target Directory Structure (This Story)

```
todo-bmad/
├── package.json                        (npm workspaces root)
├── tsconfig.base.json                  (shared TypeScript strict config)
├── .gitignore
├── .env.example
├── packages/
│   ├── shared/
│   │   ├── package.json               (name: @todo-bmad/shared)
│   │   ├── tsconfig.json              (extends ../../tsconfig.base.json)
│   │   └── src/
│   │       ├── index.ts               (barrel export)
│   │       ├── schemas.ts             (createTodoSchema, updateTodoSchema, todoSchema)
│   │       ├── schemas.test.ts        (validation unit tests)
│   │       ├── types.ts               (Todo, CreateTodoRequest, UpdateTodoRequest, ApiError)
│   │       └── constants.ts           (MAX_TEXT_LENGTH, error codes)
│   ├── backend/
│   │   ├── package.json
│   │   ├── tsconfig.json              (extends ../../tsconfig.base.json)
│   │   ├── jest.config.ts
│   │   ├── .env.example
│   │   ├── data/
│   │   │   └── .gitkeep
│   │   └── src/
│   │       ├── index.ts               (server entry — minimal, starts Fastify)
│   │       ├── app.ts                 (Fastify app factory — empty route placeholder)
│   │       └── config.ts              (env config: PORT, DATABASE_PATH, CORS_ORIGIN)
│   └── frontend/
│       ├── package.json
│       ├── tsconfig.json              (extends ../../tsconfig.base.json)
│       ├── next.config.ts
│       ├── jest.config.ts
│       ├── components.json            (shadcn/ui config)
│       ├── .env.example
│       └── src/
│           └── app/
│               ├── layout.tsx         (default from create-next-app, cleaned up)
│               ├── page.tsx           (minimal "Hello World" placeholder)
│               └── globals.css        (Tailwind defaults from create-next-app)
```

### What This Story Does NOT Include

Do NOT implement these — they belong to later stories:
- Database schema or Drizzle configuration (Story 1.2)
- CORS plugin (Story 1.2)
- Error handler plugin (Story 1.2)
- API routes (Stories 1.3–1.6)
- Design tokens / CSS custom properties (Story 1.7)
- Outfit font (Story 1.7)
- Any UI components beyond the default Next.js shell (Story 1.7+)
- Playwright configuration (Story 1.9)
- E2E test files (Story 1.9)

### Anti-Patterns to Avoid

- **Do NOT use default exports** in the shared package or any non-Next.js file
- **Do NOT install Drizzle Kit or configure migrations** — that's Story 1.2
- **Do NOT create any API route handlers** — that's Stories 1.3–1.6
- **Do NOT add design tokens or Outfit font** to the frontend — that's Story 1.7
- **Do NOT use outdated Zod APIs** — use Zod 4 patterns as documented in the architecture
- **Do NOT use `any` type** — TypeScript strict mode must be clean
- **Do NOT use relative imports** between packages — use the workspace package name `@todo-bmad/shared`
- **Do NOT install unnecessary dependencies** — only what this story requires

### Project Structure Notes

- The workspace name `@todo-bmad/shared` must match exactly across root package.json workspaces, shared package.json name field, and import statements in frontend/backend
- The `@/` alias in the frontend maps to `./src/` — configure this in tsconfig.json paths
- Backend uses `tsx` for development (`tsx watch src/index.ts`) and `tsc` for production builds
- Test files are co-located with source: `schemas.test.ts` next to `schemas.ts`

### References

- [Source: architecture.md#Starter Template Evaluation] — technology stack selection and commands
- [Source: architecture.md#Project Structure & Boundaries] — complete directory structure
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — naming, exports, imports
- [Source: architecture.md#Data Architecture] — schema design and Zod validation approach
- [Source: architecture.md#Core Architectural Decisions] — shared package as API contract
- [Source: epics.md#Story 1.1] — acceptance criteria and requirements

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Debug Log References

- shadcn CLI v4 `--style` flag removed; manually created `components.json` with new-york style instead
- Jest config uses `.js` format (not `.ts`) to avoid ts-node dependency
- Added `--no-watchman` flag to Jest scripts due to watchman socket permissions in sandbox environment
- Backend tsconfig overrides `module: CommonJS` + `moduleResolution: node` (base uses ESNext/bundler — backend needs Node.js-compatible CommonJS output)
- `data/` in `.gitignore` uses `!data/.gitkeep` negation to track the directory placeholder while ignoring database files

### Completion Notes List

- Monorepo initialized with npm workspaces (`packages/*`) and `concurrently` for parallel dev server
- `tsconfig.base.json` sets strict TypeScript (ES2022, strict mode, bundler resolution, source maps, declarations)
- Shared package: Zod 4.3.6 schemas (`createTodoSchema`, `updateTodoSchema`, `todoSchema`), types (`Todo`, `CreateTodoRequest`, `UpdateTodoRequest`, `ApiError`), and constants (`MAX_TEXT_LENGTH=128`, error codes)
- 17 unit tests covering all schema validation rules — all pass
- Frontend: Next.js 16.1.7 (App Router, TypeScript, Tailwind v4, ESLint), shadcn/ui new-york style, `@/` → `./src/` alias, minimal Hello World page.tsx
- Backend: Fastify 5.8.x with `buildApp()` factory, `getConfig()` env loader (PORT/DATABASE_PATH/CORS_ORIGIN/REVALIDATION_SECRET), `data/.gitkeep` for SQLite dir
- Both packages link to `@todo-bmad/shared` via npm workspace — TypeScript import resolution verified for both
- Zero TypeScript errors across all 3 packages

### File List

- `package.json` (root — workspaces, scripts, concurrently)
- `tsconfig.base.json` (root — shared TypeScript config)
- `.gitignore` (root — updated with all required patterns)
- `.env.example` (root — all env vars documented)
- `packages/shared/package.json`
- `packages/shared/tsconfig.json`
- `packages/shared/jest.config.js`
- `packages/shared/src/constants.ts`
- `packages/shared/src/schemas.ts`
- `packages/shared/src/types.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/schemas.test.ts`
- `packages/backend/package.json`
- `packages/backend/tsconfig.json`
- `packages/backend/jest.config.js`
- `packages/backend/.env.example`
- `packages/backend/data/.gitkeep`
- `packages/backend/src/index.ts`
- `packages/backend/src/app.ts`
- `packages/backend/src/config.ts`
- `packages/frontend/package.json`
- `packages/frontend/tsconfig.json`
- `packages/frontend/jest.config.js`
- `packages/frontend/components.json`
- `packages/frontend/.env.example`
- `packages/frontend/eslint.config.mjs`
- `packages/frontend/next.config.ts`
- `packages/frontend/postcss.config.mjs`
- `packages/frontend/src/app/page.tsx`
- `packages/frontend/src/app/layout.tsx`
- `packages/frontend/src/app/globals.css`
- `packages/frontend/src/lib/utils.ts`

### Change Log

- 2026-03-17: Initial implementation — monorepo scaffolded, shared package with Zod schemas/types/tests, frontend (Next.js 16 + shadcn), backend (Fastify 5). All ACs satisfied, 17 tests passing, zero TypeScript errors.
