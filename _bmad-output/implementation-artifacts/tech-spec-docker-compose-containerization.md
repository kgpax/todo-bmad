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
- `docker-compose.yml` orchestrating both services with networking, env vars, health check, and volume mount
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
- **No `public/` directory exists.** The favicon is at `src/app/favicon.ico` (App Router convention). Do NOT attempt to copy a `public/` directory in the Dockerfile.

**Shared (`packages/shared`):**
- Zod schemas and TypeScript types
- Exports via conditional: `"development"` → `./src/index.ts`, `"default"` → `./dist/index.js`
- In Docker builds, the `"default"` condition applies, so `dist/` must be present

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `packages/frontend/next.config.ts` | Needs `output: 'standalone'` added; already has `outputFileTracingRoot` |
| `packages/frontend/src/lib/api.ts` | Uses `API_URL` (SSR) and `NEXT_PUBLIC_API_URL` (client) — defines Docker networking requirements |
| `packages/frontend/postcss.config.mjs` | Required for Tailwind CSS processing during `next build` |
| `packages/backend/src/index.ts` | Server entry point, binds `0.0.0.0`, runs migrations on startup |
| `packages/backend/src/config.ts` | All configurable env vars: `PORT`, `DATABASE_PATH`, `CORS_ORIGIN`, `REVALIDATION_SECRET`, `LOG_LEVEL` |
| `packages/backend/src/db/migrate.ts` | Resolves migrations folder via `path.resolve(__dirname, "../../drizzle")` — path must work in container |
| `packages/backend/src/db/client.ts` | Creates SQLite connection with WAL mode at `DATABASE_PATH` |
| `packages/shared/package.json` | Conditional exports — `"default"` targets `dist/index.js` |
| `.gitignore` | Documents build artifacts (`dist/`, `.next/`, `node_modules/`, `data/`) — informs `.dockerignore` |
| `.env.example` | Documents all env vars for both services |
| `packages/backend/.env.example` | Backend-specific env var defaults |

### Technical Decisions

1. **Node.js Alpine base images:** Use `node:20-alpine` for minimal image size. The exact same tag must be used for all stages within a Dockerfile to ensure native addon binary compatibility when copying `node_modules` between stages.

2. **Multi-stage builds:** Each Dockerfile uses at least 2 stages (build + production). Build stage includes dev dependencies and compile tools; production stage copies only runtime artifacts. Native `better-sqlite3` bindings are compiled once in the build stage and copied to the production stage (safe because both stages use the same base image).

3. **Next.js standalone output:** Adding `output: 'standalone'` to `next.config.ts` produces a self-contained server in `.next/standalone/` that bundles only the required `node_modules` files. The `.next/static/` directory must be copied separately into the standalone output. Note: `next build` on the host will also produce `.next/standalone/` — this is gitignored and has no practical impact but does change the build output structure.

4. **Next.js standalone hostname binding:** The standalone server checks the `HOSTNAME` env var to determine its listen address (defaults to `localhost`). Inside Docker, `localhost` means the container's loopback interface — unreachable from the host. The docker-compose `environment` must set `HOSTNAME=0.0.0.0` so the frontend is accessible via port mapping.

5. **Docker Compose networking:** Services communicate over a Docker bridge network. Frontend SSR uses `http://backend:3001` (the Docker service hostname). Browser-side JS uses `http://localhost:3001` (the host-mapped port).

6. **SQLite volume mount:** A named Docker volume persists the SQLite database file across container restarts. The backend's `DATABASE_PATH` must use an **absolute path** (e.g. `/app/packages/backend/data/todos.db`) that falls within the volume mount point (`/app/packages/backend/data`). A relative `./data/todos.db` resolves from `process.cwd()` (which is `WORKDIR`, i.e. `/app`), creating the DB at `/app/data/todos.db` — outside the volume. This would cause silent data loss on container restart.

7. **Build context:** The Dockerfiles live in their respective package directories but need access to the monorepo root (for `package.json`, `package-lock.json`, and `packages/shared/`). Docker Compose sets the build context to the monorepo root and points to the Dockerfile via the `dockerfile` directive.

8. **Workspace lockfile integrity:** `npm ci` validates the lockfile against all workspace `package.json` files referenced in it. Both Dockerfiles must copy ALL workspace `package.json` stubs (shared, backend, and frontend) even if the Dockerfile only builds a subset. Otherwise `npm ci` fails because the lockfile references workspaces whose `package.json` is missing from the build context.

9. **Non-root container user:** Both production stages create a dedicated non-root user (`appuser`) and switch to it via the `USER` directive before the `CMD`. The backend's data directory must be `chown`-ed to this user so SQLite can write to it.

10. **PID 1 signal handling:** Both services in docker-compose use `init: true`, which runs `tini` as PID 1 to properly forward signals (SIGTERM, SIGINT) and reap zombie processes. Without this, Node.js runs as PID 1 and does not handle signals correctly, leading to a 10-second forced kill on `docker compose down` instead of graceful shutdown.

11. **Backend health check:** The backend service defines a `healthcheck` using `wget --spider -q http://localhost:3001/api/todos`. The frontend service uses `depends_on` with `condition: service_healthy` so its container only starts after the backend is confirmed ready (Fastify bound, migrations run). Without this, the frontend's initial SSR fetch may hit a not-yet-ready backend.

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
    - `*.md` (documentation not needed in production images)

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
  - Notes: This changes the production build output format — `next build` will now also produce a `.next/standalone/` directory on the host. This is gitignored and does not affect `next dev` or `next start` on the host, but it does add to the build output structure. No functional impact to existing workflows.

- [ ] Task 3: Create backend Dockerfile
  - File: `packages/backend/Dockerfile` (create)
  - Action: Create a multi-stage Dockerfile for the backend service.
  - **CRITICAL:** Both stages MUST use the exact same `node:20-alpine` tag so that native `better-sqlite3` bindings compiled in the build stage are binary-compatible when copied to the production stage.
  - **Stage 1 — `builder`** (based on `node:20-alpine`):
    1. Install native build tools: `apk add --no-cache python3 make g++` (required by `better-sqlite3` via `node-gyp`)
    2. Set working directory to `/app`
    3. Copy root `package.json`, `package-lock.json`, and ALL three workspace `package.json` stubs: `packages/shared/package.json`, `packages/backend/package.json`, `packages/frontend/package.json`. All three must be present even though only shared + backend are built, because the lockfile references all three workspaces and `npm ci` validates lockfile integrity against them.
    4. Run `npm ci` to install all dependencies (including devDependencies needed for building)
    5. Copy `packages/shared/src/` and `packages/shared/tsconfig.json`
    6. Copy `packages/backend/src/`, `packages/backend/tsconfig.json`, and `packages/backend/drizzle/`
    7. Copy `tsconfig.base.json` from root
    8. Run `npm run build -w packages/shared && npm run build -w packages/backend`
    9. Run `npm prune --omit=dev` to remove devDependencies from `node_modules` (retains compiled `better-sqlite3` native addon)
  - **Stage 2 — `production`** (based on the same `node:20-alpine`):
    1. Set working directory to `/app`
    2. Create non-root user: `addgroup -S appuser && adduser -S appuser -G appuser`
    3. Copy from builder: root `package.json` (needed for workspace resolution at runtime)
    4. Copy from builder: `packages/shared/dist/` and `packages/shared/package.json`
    5. Copy from builder: `packages/backend/dist/`, `packages/backend/drizzle/`, and `packages/backend/package.json`
    6. Copy from builder: `node_modules/` (already pruned to production-only, with compiled native addons)
    7. Create data directory and set ownership: `mkdir -p /app/packages/backend/data && chown -R appuser:appuser /app/packages/backend/data`
    8. Set `ENV NODE_ENV=production`
    9. Switch to non-root user: `USER appuser`
    10. Expose port `3001`
    11. `CMD ["node", "packages/backend/dist/index.js"]`

- [ ] Task 4: Create frontend Dockerfile
  - File: `packages/frontend/Dockerfile` (create)
  - Action: Create a multi-stage Dockerfile for the frontend service.
  - **Stage 1 — `builder`** (based on `node:20-alpine`):
    1. Set working directory to `/app`
    2. Copy root `package.json`, `package-lock.json`, and ALL three workspace `package.json` stubs: `packages/shared/package.json`, `packages/frontend/package.json`, `packages/backend/package.json`. All three must be present for lockfile integrity.
    3. Run `npm ci` to install all dependencies
    4. Copy `packages/shared/src/` and `packages/shared/tsconfig.json`
    5. Copy `tsconfig.base.json` from root
    6. Run `npm run build -w packages/shared`
    7. Copy the following frontend files (exhaustive list — no other config files exist):
       - `packages/frontend/src/` (all source code)
       - `packages/frontend/next.config.ts`
       - `packages/frontend/tsconfig.json`
       - `packages/frontend/postcss.config.mjs`
    8. Set build-time env var: `ARG NEXT_PUBLIC_API_URL=http://localhost:3001` and `ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL` (baked into client JS bundle)
    9. Run `npm run build -w packages/frontend`
  - **Stage 2 — `production`** (based on `node:20-alpine`):
    1. Set working directory to `/app`
    2. Create non-root user: `addgroup -S appuser && adduser -S appuser -G appuser`
    3. Copy from builder: `packages/frontend/.next/standalone/` to `/app/` (this is the entire standalone output — includes a minimal `node_modules` subtree and the server entry point). With `outputFileTracingRoot` set to the monorepo root, the standalone directory structure mirrors the monorepo layout: the server entry lives at `.next/standalone/packages/frontend/server.js`.
    4. Copy from builder: `packages/frontend/.next/static/` to `/app/packages/frontend/.next/static/` (static assets are not included in standalone output and must be copied separately)
    5. **Do NOT copy `public/`.** The project has no `packages/frontend/public/` directory. The favicon is at `src/app/favicon.ico` and is included in the `.next/static/` output by the App Router.
    6. Set ownership: `chown -R appuser:appuser /app`
    7. Set `ENV NODE_ENV=production`
    8. Switch to non-root user: `USER appuser`
    9. Expose port `3000`
    10. `CMD ["node", "packages/frontend/server.js"]`
  - Notes: The `COPY .next/standalone/ /app/` flattens the standalone output into `/app/`. The server entry becomes `/app/packages/frontend/server.js`. The static assets must land at `/app/packages/frontend/.next/static/` relative to where the server expects them.

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
        - `DATABASE_PATH=/app/packages/backend/data/todos.db` (**absolute path** — must fall within the volume mount point; a relative `./data/todos.db` would resolve from WORKDIR `/app` to `/app/data/todos.db`, which is outside the volume)
        - `CORS_ORIGIN=http://localhost:3000`
        - `LOG_LEVEL=info`
        - `NODE_ENV=production`
      - `volumes`: `todo-data:/app/packages/backend/data`
      - `healthcheck`:
        - `test`: `["CMD", "wget", "--spider", "-q", "http://localhost:3001/api/todos"]`
        - `interval`: `5s`
        - `timeout`: `3s`
        - `retries`: `5`
        - `start_period`: `10s`
      - `init`: `true`
      - `restart`: `unless-stopped`
    - **`frontend` service:**
      - `build.context`: `.` (monorepo root)
      - `build.dockerfile`: `packages/frontend/Dockerfile`
      - `ports`: `"3000:3000"`
      - `environment`:
        - `API_URL=http://backend:3001` (internal Docker network hostname for SSR)
        - `HOSTNAME=0.0.0.0` (**required** — Next.js standalone server checks this env var to set its listen address; without it, the server binds to `localhost` inside the container, which is unreachable from the host through Docker port mapping)
        - `NODE_ENV=production`
      - `depends_on`:
        - `backend`:
          - `condition`: `service_healthy`
      - `init`: `true`
      - `restart`: `unless-stopped`
    - **`volumes`:**
      - `todo-data:` (named volume for SQLite persistence)

### Acceptance Criteria

- [ ] AC 1: Given Docker and Docker Compose are installed, when I run `docker compose up --build` from the monorepo root, then both `frontend` and `backend` containers build successfully and start without errors.

- [ ] AC 2: Given both containers are running, when I run `curl -s http://localhost:3000 | head -c 200`, then the response contains HTML content (the todo app shell). Additionally, opening `http://localhost:3000` in a browser renders the full UI.

- [ ] AC 3: Given both containers are running, when I run `curl -s -X POST -H "Content-Type: application/json" -d '{"text":"test todo"}' http://localhost:3001/api/todos`, then I receive a 201 response with the created todo JSON. Opening the app in a browser confirms the todo appears.

- [ ] AC 4: Given a todo exists, when I toggle its completion via `curl -s -X PATCH -H "Content-Type: application/json" -d '{"completed":true}' http://localhost:3001/api/todos/{id}`, then the response shows `completed: true` and the UI reflects the change.

- [ ] AC 5: Given a todo exists, when I delete it via `curl -s -X DELETE http://localhost:3001/api/todos/{id}`, then I receive a 204 response and the todo no longer appears in the list.

- [ ] AC 6: Given todos have been created in the containers, when I run `docker compose down` then `docker compose up`, then all previously created todos are still present (verify via `curl -s http://localhost:3001/api/todos`). This confirms the SQLite volume persistence works correctly with the absolute `DATABASE_PATH`.

- [ ] AC 7: Given the containers are not running, when I run `npm run dev` from the monorepo root on the host machine, then the frontend and backend start normally on ports 3000 and 3001 with no errors.

- [ ] AC 8: Given the containers are not running, when I run `npm run build` from the monorepo root on the host machine, then all packages build successfully with no errors.

- [ ] AC 9: Given the containers are not running, when I run `npm run test` from the monorepo root on the host machine, then all unit tests pass with no regressions.

- [ ] AC 10: Given the backend container is running, when I run `docker compose exec backend node -e "process.exit(0)"`, then it exits successfully, confirming the Node.js runtime is functional inside the container.

- [ ] AC 11: Given both containers are running, when I run `docker compose down` (not `down -v`), then the containers stop within a few seconds (confirming `init: true` provides proper signal handling rather than waiting for the 10-second SIGKILL timeout).

## Additional Context

### Dependencies

- **Docker Engine** (v20.10+ recommended) must be installed on the host machine.
- **Docker Compose** (v2+, included with Docker Desktop) must be available.
- No new npm packages are required. No changes to `package.json` files (except the one-line `next.config.ts` change).

### Testing Strategy

**No automated tests are added by this spec.** The Dockerfiles and docker-compose.yml are infrastructure files, not application code. The existing test suite (unit, E2E, Lighthouse) validates that the application logic is unchanged.

**Manual verification:**

1. Run `docker compose up --build` and verify both containers start (backend health check passes, frontend waits for it).
2. Verify API access: `curl -s http://localhost:3001/api/todos` returns a JSON response.
3. Verify frontend access: `curl -s http://localhost:3000 | head -c 500` returns HTML.
4. Open `http://localhost:3000` in a browser and perform full CRUD operations (create, toggle, delete).
5. Run `docker compose down` then `docker compose up` and verify data persists via `curl -s http://localhost:3001/api/todos`.
6. Stop containers, then run `npm run dev` / `npm run build` / `npm run test` on the host to confirm no regressions.

### Notes

- **Image size targets (advisory, not gating):** Backend image is expected to be ~80-150MB; frontend image ~100-200MB. These are estimates based on `node:20-alpine` (~50MB compressed) plus application code and dependencies. Actual sizes depend on npm dependency tree and Next.js bundle. Do not treat these as hard pass/fail criteria.
- **`NEXT_PUBLIC_API_URL` is a build-time constant.** If the backend's host-mapped port changes (e.g. `3002` instead of `3001`), the frontend image must be rebuilt. This is inherent to Next.js's public env var mechanism, not a limitation of this spec. The frontend Dockerfile uses a build `ARG` so the value can be overridden at build time: `docker compose build --build-arg NEXT_PUBLIC_API_URL=http://localhost:3002 frontend`.
- **Apple Silicon (ARM64) compatibility:** `node:20-alpine` supports ARM64 natively. `better-sqlite3` compiles cleanly on ARM64 Alpine. No platform flags needed for local Docker Desktop on Apple Silicon Macs.
- **`REVALIDATION_SECRET` is intentionally omitted from docker-compose.** The backend config reads this env var but no route handler currently uses it. It exists as a placeholder for future ISR revalidation support. Including it in docker-compose would imply functionality that doesn't exist. When it becomes active, add it to both the backend and frontend service environments.
- **Graceful shutdown:** The backend entry point (`src/index.ts`) does not have an explicit SIGTERM handler. With `init: true` in docker-compose, `tini` forwards SIGTERM to the Node.js process, which exits promptly. However, in-flight requests and the SQLite WAL checkpoint may not flush. For a single-user todo app this is acceptable. If graceful shutdown becomes important, add a `process.on('SIGTERM', () => app.close())` handler to the backend — but that is a code change outside this spec's scope.
- **Future enhancement — dev-mode compose override:** A `docker-compose.dev.yml` could be added later with volume-mounted source and hot reload. This is explicitly out of scope for now but the single-file production compose doesn't preclude it.
