---
title: 'Docker Compose Containerization'
slug: 'docker-compose-containerization'
created: '2026-03-20'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack: [docker, docker-compose, node-alpine, multi-stage-builds]
files_to_modify: [packages/frontend/next.config.ts]
files_to_create: [packages/backend/Dockerfile, packages/frontend/Dockerfile, docker-compose.yml, .dockerignore]
code_patterns: [npm-workspaces-monorepo, shared-package-build-first, nextjs-standalone-output, better-sqlite3-native-bindings, drizzle-migrations-folder]
test_patterns: []
---

# Tech-Spec: Docker Compose Containerization

**Created:** 2026-03-20

## Overview

### Problem Statement

The application has no containerized deployment option. Running the app requires a local Node.js environment, manual dependency installation, and manual process management. There is no way to spin up the full production stack with a single command.

### Solution

Add production-optimized Dockerfiles for the frontend and backend services, plus a `docker-compose.yml` to orchestrate them. Use multi-stage builds and Next.js standalone output mode to minimise image sizes. Mount a Docker volume for SQLite database persistence.

### Scope

**In Scope:**

- Dockerfile for backend (multi-stage, alpine-based, handles native `better-sqlite3` bindings)
- Dockerfile for frontend (multi-stage, standalone output mode, minimal runtime image)
- `docker-compose.yml` orchestrating both services with networking, env vars, and volume mount
- Root `.dockerignore`
- One-line change to `next.config.ts` (add `output: 'standalone'`)

**Out of Scope:**

- Development-mode Docker setup (hot reload, volume-mounted source)
- Reverse proxy / nginx / TLS termination
- CI/CD pipeline integration
- Docker-based test execution
- Changes to existing `npm run` scripts, test suites, or application code

## Context for Development

### Codebase Patterns

**Monorepo Structure:**
- Root `package.json` uses npm workspaces (`packages/*`)
- Three packages: `shared`, `backend`, `frontend`
- Build order: shared → backend + frontend (shared must compile first as both depend on its `dist/` output via the `"default"` export condition)

**Backend (`packages/backend`):**
- Fastify server, entry point: `src/index.ts` → compiled to `dist/index.js` (CommonJS)
- `better-sqlite3` native addon — requires `python3`, `make`, `g++` at build time
- Database path configurable via `DATABASE_PATH` env var (default: `./data/todos.db`)
- Drizzle ORM migrations in `drizzle/` folder, referenced from compiled code via `path.resolve(__dirname, "../../drizzle")` — this folder must be present in the Docker image
- Already binds to `0.0.0.0` — Docker-ready
- CORS origin configurable via `CORS_ORIGIN` env var

**Frontend (`packages/frontend`):**
- Next.js 16, builds via `next build`
- `next.config.ts` already sets `outputFileTracingRoot: path.join(__dirname, "../../")` for monorepo tracing — prerequisite for standalone mode
- `API_URL` env var: used server-side for SSR fetches (`fetchTodos()`) — should point to Docker internal hostname in containers
- `NEXT_PUBLIC_API_URL` env var: baked into client bundle at build time — must resolve to the backend as seen by the browser (`http://localhost:3001`)
- Server Action `revalidateHome()` calls `revalidatePath('/')` — no outbound call to backend, works without network changes

**Shared (`packages/shared`):**
- Zod schemas and TypeScript types
- Exports via conditional: `"development"` → `./src/index.ts`, `"default"` → `./dist/index.js`
- In Docker builds, the `"default"` condition applies, so `dist/` must be present

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `packages/frontend/next.config.ts` | Needs `output: 'standalone'` added; already has `outputFileTracingRoot` |
| `packages/frontend/src/lib/api.ts` | Uses `API_URL` (SSR) and `NEXT_PUBLIC_API_URL` (client) — defines Docker networking requirements |
| `packages/backend/src/index.ts` | Server entry point, binds `0.0.0.0`, runs migrations on startup |
| `packages/backend/src/config.ts` | All configurable env vars: `PORT`, `DATABASE_PATH`, `CORS_ORIGIN`, `REVALIDATION_SECRET`, `LOG_LEVEL` |
| `packages/backend/src/db/migrate.ts` | Resolves migrations folder via `path.resolve(__dirname, "../../drizzle")` — path must work in container |
| `packages/backend/src/db/client.ts` | Creates SQLite connection with WAL mode at `DATABASE_PATH` |
| `packages/shared/package.json` | Conditional exports — `"default"` targets `dist/index.js` |
| `.gitignore` | Documents build artifacts (`dist/`, `.next/`, `node_modules/`, `data/`) — informs `.dockerignore` |
| `.env.example` | Documents all env vars for both services |
| `packages/backend/.env.example` | Backend-specific env var defaults |

### Technical Decisions

1. **Node.js Alpine base images:** Use `node:20-alpine` for minimal image size. Alpine requires additional packages for native addon compilation in the build stage only.

2. **Multi-stage builds:** Each Dockerfile uses at least 2 stages (build + production). Build stage includes dev dependencies and compile tools; production stage copies only runtime artifacts.

3. **Next.js standalone output:** Adding `output: 'standalone'` to `next.config.ts` produces a self-contained server in `.next/standalone/` that bundles only the required `node_modules` files. The `.next/static/` and `public/` directories must be copied separately into the standalone output.

4. **Docker Compose networking:** Services communicate over a Docker bridge network. Frontend SSR uses `http://backend:3001` (the Docker service hostname). Browser-side JS uses `http://localhost:3001` (the host-mapped port).

5. **SQLite volume mount:** A named Docker volume persists the SQLite database file across container restarts. Mounted at the backend's `data/` directory.

6. **Build context:** The Dockerfiles live in their respective package directories but need access to the monorepo root (for `package.json`, `package-lock.json`, and `packages/shared/`). Docker Compose sets the build context to the monorepo root and points to the Dockerfile via the `dockerfile` directive.

### Constraints

- All existing `npm run` commands (`dev`, `start`, `build`, `test`, `lint`, `test:e2e`, `test:lighthouse`) must continue to work identically on the host machine.
- `better-sqlite3` uses native C++ bindings compiled via `node-gyp`. Dependencies must be installed inside the Linux container — never copy `node_modules` from the host.
- `NEXT_PUBLIC_API_URL` is baked into the client JS bundle at build time. It must resolve to the backend as seen by the browser (the host-mapped port), not the internal Docker network hostname.
- `API_URL` is used server-side at runtime. It should use the internal Docker network hostname for faster, network-local SSR fetches.
- Backend migrations folder (`drizzle/`) must be included in the production image alongside the compiled `dist/` output.

## Implementation Plan

### Tasks

- [ ] Task 1: Create root `.dockerignore`
  - File: `.dockerignore` (create)
  - Action: Create a `.dockerignore` file at the monorepo root that excludes files not needed in the Docker build context. This keeps image builds fast by reducing the context sent to the Docker daemon.
  - Content to exclude:
    - `node_modules` (all levels — reinstalled inside the container)
    - `.next` (rebuilt inside the container)
    - `dist` (all levels — rebuilt inside the container)
    - `data` (database files — mounted via volume, not baked into image)
    - `coverage`, `test-results`, `playwright-report` (test artifacts)
    - `.env`, `.env.local` (secrets — passed via docker-compose environment)
    - `.git` (version history not needed in image)
    - `e2e` (E2E tests not needed in production images)
    - `_bmad*` (planning artifacts not needed in production images)
    - `*.md` (documentation not needed in production images, except README if desired)

- [ ] Task 2: Add `output: 'standalone'` to Next.js config
  - File: `packages/frontend/next.config.ts` (modify)
  - Action: Add `output: "standalone"` to the `nextConfig` object. The existing `outputFileTracingRoot` remains unchanged.
  - Result after change:
    ```typescript
    const nextConfig: NextConfig = {
      output: "standalone",
      outputFileTracingRoot: path.join(__dirname, "../../"),
    };
    ```
  - Notes: This changes only the production build output format. `next dev` and `next start` on the host are unaffected.

- [ ] Task 3: Create backend Dockerfile
  - File: `packages/backend/Dockerfile` (create)
  - Action: Create a multi-stage Dockerfile for the backend service.
  - **Stage 1 — `build`** (based on `node:20-alpine`):
    1. Install native build tools: `python3`, `make`, `g++` (required by `better-sqlite3` via `node-gyp`)
    2. Set working directory to `/app`
    3. Copy root `package.json`, `package-lock.json`, and workspace `packages/shared/package.json` + `packages/backend/package.json` (for dependency caching)
    4. Run `npm ci --workspace=packages/shared --workspace=packages/backend --include-workspace-root` to install dependencies with native compilation inside Linux
    5. Copy `packages/shared/src/` and `packages/shared/tsconfig.json`, then copy `packages/backend/src/` and `packages/backend/tsconfig.json`, plus `tsconfig.base.json`
    6. Run `npm run build -w packages/shared` then `npm run build -w packages/backend`
  - **Stage 2 — `production`** (based on `node:20-alpine`):
    1. Set working directory to `/app`
    2. Copy from build stage: `packages/backend/dist/`, `packages/backend/drizzle/`, `packages/backend/package.json`
    3. Copy from build stage: `packages/shared/dist/`, `packages/shared/package.json`
    4. Copy root `package.json` and `package-lock.json`
    5. Run `npm ci --workspace=packages/shared --workspace=packages/backend --include-workspace-root --omit=dev` (production deps only — this reinstalls `better-sqlite3` without dev deps, which is needed because the native addon must be compiled for this stage's OS)
    6. Create `/app/packages/backend/data` directory for the SQLite database
    7. Set `NODE_ENV=production`
    8. Expose port `3001`
    9. `CMD ["node", "packages/backend/dist/index.js"]`
  - Notes: `better-sqlite3` native addon must be compiled in the production stage as well because alpine versions between stages may differ. Alternatively, both stages can use the same base image and the addon can be copied, but reinstalling production deps is safer and more maintainable. If image size is a concern, an optimization is to copy `node_modules` from the build stage and skip the second `npm ci` — but this only works if both stages use the exact same base image.

- [ ] Task 4: Create frontend Dockerfile
  - File: `packages/frontend/Dockerfile` (create)
  - Action: Create a multi-stage Dockerfile for the frontend service.
  - **Stage 1 — `build`** (based on `node:20-alpine`):
    1. Set working directory to `/app`
    2. Copy root `package.json`, `package-lock.json`, and workspace `packages/shared/package.json` + `packages/frontend/package.json` (for dependency caching)
    3. Run `npm ci --workspace=packages/shared --workspace=packages/frontend --include-workspace-root`
    4. Copy `packages/shared/src/` and `packages/shared/tsconfig.json`, plus `tsconfig.base.json`
    5. Run `npm run build -w packages/shared`
    6. Copy `packages/frontend/` source files (src/, public/, next.config.ts, tsconfig.json, postcss.config.mjs, and any other config files)
    7. Set build-time env vars: `NEXT_PUBLIC_API_URL=http://localhost:3001` (baked into client JS)
    8. Run `npm run build -w packages/frontend`
  - **Stage 2 — `production`** (based on `node:20-alpine`):
    1. Set working directory to `/app`
    2. Copy from build stage: `packages/frontend/.next/standalone/` to `/app/` (this includes a minimal `node_modules` and the server entry point)
    3. Copy from build stage: `packages/frontend/.next/static/` to `/app/packages/frontend/.next/static/` (static assets are not included in standalone output)
    4. Copy from build stage: `packages/frontend/public/` to `/app/packages/frontend/public/` (if it exists — public assets are not included in standalone output)
    5. Set `NODE_ENV=production`
    6. Expose port `3000`
    7. `CMD ["node", "packages/frontend/server.js"]`
  - Notes: The standalone output relocates the server entry point. With `outputFileTracingRoot` set to the monorepo root, the standalone server.js lives at `.next/standalone/packages/frontend/server.js`. The `COPY` paths must reflect this. The `static` and `public` directories must be placed relative to the standalone server's expected location.

- [ ] Task 5: Create `docker-compose.yml`
  - File: `docker-compose.yml` (create)
  - Action: Create a Docker Compose file orchestrating both services.
  - Content:
    - **`backend` service:**
      - `build.context`: `.` (monorepo root)
      - `build.dockerfile`: `packages/backend/Dockerfile`
      - `ports`: `"3001:3001"`
      - `environment`:
        - `PORT=3001`
        - `DATABASE_PATH=./data/todos.db`
        - `CORS_ORIGIN=http://localhost:3000`
        - `REVALIDATION_SECRET=docker-dev-secret`
        - `NODE_ENV=production`
      - `volumes`: `todo-data:/app/packages/backend/data`
      - `restart`: `unless-stopped`
    - **`frontend` service:**
      - `build.context`: `.` (monorepo root)
      - `build.dockerfile`: `packages/frontend/Dockerfile`
      - `ports`: `"3000:3000"`
      - `environment`:
        - `API_URL=http://backend:3001` (internal Docker network hostname for SSR)
        - `NODE_ENV=production`
      - `depends_on`: `backend`
      - `restart`: `unless-stopped`
    - **`volumes`:**
      - `todo-data:` (named volume for SQLite persistence)

### Acceptance Criteria

- [ ] AC 1: Given Docker and Docker Compose are installed, when I run `docker compose up --build` from the monorepo root, then both `frontend` and `backend` containers build successfully and start without errors.

- [ ] AC 2: Given both containers are running, when I open `http://localhost:3000` in a browser, then the todo application loads and renders the full UI (empty state or existing todos).

- [ ] AC 3: Given both containers are running and the app is loaded, when I create a new todo, then it appears in the list without page refresh (client-side mutation via `NEXT_PUBLIC_API_URL` → `http://localhost:3001`).

- [ ] AC 4: Given both containers are running, when I toggle a todo's completion status, then the change persists and the UI updates correctly.

- [ ] AC 5: Given both containers are running, when I delete a todo, then it is removed from the list and the deletion persists.

- [ ] AC 6: Given todos have been created in the containers, when I run `docker compose down` then `docker compose up`, then all previously created todos are still present (SQLite volume persistence).

- [ ] AC 7: Given the containers are not running, when I run `npm run dev` from the monorepo root on the host machine, then the frontend and backend start normally on ports 3000 and 3001 with no errors.

- [ ] AC 8: Given the containers are not running, when I run `npm run build` from the monorepo root on the host machine, then all packages build successfully with no errors.

- [ ] AC 9: Given the containers are not running, when I run `npm run test` from the monorepo root on the host machine, then all unit tests pass with no regressions.

- [ ] AC 10: Given the backend image has been built, when I inspect its size via `docker images`, then it is under 200MB.

- [ ] AC 11: Given the frontend image has been built, when I inspect its size via `docker images`, then it is under 250MB.

## Additional Context

### Dependencies

- **Docker Engine** (v20.10+ recommended) must be installed on the host machine.
- **Docker Compose** (v2+, included with Docker Desktop) must be available.
- No new npm packages are required. No changes to `package.json` files (except the one-line `next.config.ts` change).

### Testing Strategy

**No automated tests are added by this spec.** The Dockerfiles and docker-compose.yml are infrastructure files, not application code. The existing test suite (unit, E2E, Lighthouse) validates that the application logic is unchanged.

**Manual verification:**

1. Run `docker compose up --build` and verify both containers start.
2. Open `http://localhost:3000` and perform full CRUD operations (create, toggle, delete).
3. Run `docker compose down` then `docker compose up` and verify data persists.
4. Verify `docker images` shows both images under target sizes.
5. Stop containers, then run `npm run dev` / `npm run build` / `npm run test` on the host to confirm no regressions.

### Notes

- **`NEXT_PUBLIC_API_URL` is a build-time constant.** If the backend's host-mapped port changes (e.g. `3002` instead of `3001`), the frontend image must be rebuilt. This is inherent to Next.js's public env var mechanism, not a limitation of this spec.
- **Apple Silicon (ARM64) compatibility:** `node:20-alpine` supports ARM64 natively. `better-sqlite3` compiles cleanly on ARM64 Alpine. No platform flags needed for local Docker Desktop on Apple Silicon Macs.
- **Future enhancement — dev-mode compose override:** A `docker-compose.dev.yml` could be added later with volume-mounted source and hot reload. This is explicitly out of scope for now but the single-file production compose doesn't preclude it.
- **Future enhancement — health checks:** Docker Compose supports `healthcheck` directives. Adding a `GET /api/todos` health check to the backend and a TCP check on port 3000 for the frontend would improve orchestration reliability. Not included in this spec to keep scope minimal.
