# Quick spec dockerize
_Exported on 20/03/2026 at 18:25:57 GMT from Cursor (2.6.20)_

---

**User**

@_bmad/bmm/agents/pm.md I'd like to discuss a new requirement.

I want to containerize the frontend and backend app so that I can run them using docker compose.  I have limited experience with docker so wil look to you for guidance.

---

**Cursor**

Let me read the PM agent skill and understand your project structure first.

Let me load the full PM agent file as instructed.

Let me understand the environment configuration and backend entry point.

Hey Kevin! Good to see you.

So you want to containerize the frontend and backend with Docker Compose. Before I jump to solutions, let me ask the important question: **why?**

What's driving this? A few possibilities come to mind, and the answer changes what we'd actually recommend:

1. **"I want other people to run this easily"** -- onboarding, demos, sharing with collaborators
2. **"I want to deploy this somewhere"** -- a VPS, cloud provider, etc.
3. **"I want a consistent dev environment"** -- reproducibility, no more "works on my machine"
4. **"All of the above"** or something else entirely

The reason I'm pressing on this is that the containerization approach differs meaningfully depending on the goal. For example:

- If it's **deployment-focused**, we'd want optimized multi-stage production builds, minimal image sizes, and proper health checks.
- If it's **dev-focused**, we'd want volume mounts for live reloading, dev-mode containers, and maybe not even production builds at all.
- If it's **both**, we'd likely want a `docker-compose.yml` for production and a `docker-compose.dev.yml` override for development.

A few things I noticed about your stack that are worth flagging up front since you mentioned limited Docker experience:

- **better-sqlite3** uses native C++ bindings. This means the Docker image's OS architecture has to match when `npm install` runs -- you can't just copy `node_modules` from your Mac into a Linux container. This is solvable but it's a gotcha people hit.
- **The shared package** needs to build before both frontend and backend, so the build order in the Dockerfiles matters.
- **Next.js 16 standalone output** mode can dramatically shrink the frontend image (from ~1GB to ~100MB). Worth considering.
- **SQLite database persistence** needs a Docker volume so your data survives container restarts.

So -- what's the primary goal here? Once I know that, I can help you think through the right scope and we can figure out whether this is a quick spec or something bigger.

---

**User**

It's mostly deployment focussed.  A single docker-compose.yml for all is sufficient.

Any opportunities to minimise bundle/image size are welcome.

Hopefully none of this would require a significant rearchitecture of the system, but please indicate if and where it does

---

**Cursor**

Good, that narrows things down nicely. Let me give you the honest assessment.

**The good news: no significant rearchitecture required.** Your stack is already well-structured for containerization. Here's the breakdown:

---

**What needs to be created (all new files, no existing code changes):**

1. **`packages/backend/Dockerfile`** -- Multi-stage build. Build stage compiles shared + backend with native `better-sqlite3` bindings. Production stage copies only the compiled output into a slim `node:alpine` image. Expected image size: ~80-120MB.

2. **`packages/frontend/Dockerfile`** -- Multi-stage build using Next.js **standalone output mode**. This is the big size win: instead of shipping the entire `node_modules` (~800MB+), standalone mode bundles only the files Next.js actually needs into a self-contained server. Expected image size: ~100-150MB.

3. **`docker-compose.yml`** -- Orchestrates both services, defines a shared network, maps ports, and mounts a Docker volume for SQLite persistence.

4. **`.dockerignore`** -- Keeps `node_modules`, `.next`, test files, etc. out of the build context for faster builds.

---

**The one existing code change (one line):**

Adding `output: 'standalone'` to your Next.js config. This tells the build to produce a self-contained server bundle. It doesn't change how the app behaves -- same SSR, same server actions, same everything. It just changes the production output format from "assume `node_modules` is present" to "bundle everything needed into `.next/standalone/`".

---

**Worth calling out -- environment variable wiring in Docker:**

This is the only subtlety. You have two API URL variables:
- **`NEXT_PUBLIC_API_URL`** -- baked into the client JS bundle at build time. The browser uses this to call the backend directly. Needs to be `http://localhost:3001` (the host-mapped port) since the browser is outside Docker.
- **`API_URL`** -- used server-side at runtime for SSR fetches. In Docker this can be `http://backend:3001` (the internal container hostname), which is faster and doesn't leave the Docker network.

Your architecture already separates these two variables, so this just works. No code changes needed -- it's purely a configuration concern in `docker-compose.yml`.

---

**What this does NOT cover (and shouldn't, for now):**

- No reverse proxy / nginx -- overkill for a single-user todo app
- No TLS termination -- that's a deployment environment concern, not an app concern
- No CI/CD pipeline changes -- Docker builds are additive

---

**My recommendation:** This is small and self-contained enough for a **quick spec** rather than a full epic. It's 4 new files and 1 one-line change. No test changes, no behavior changes, no API changes.

Want me to create a quick spec for this so we can hand it off to implementation? Or do you have more questions you want to dig into first?

---

**User**

I also want to ensure that using the local npm run dev / npm run start etc. still work

---

**Cursor**

Absolutely, and this is a firm constraint -- not a nice-to-have. The whole point is that Docker is an **additive deployment option**, not a replacement for your local workflow.

The good news: this happens naturally with the approach I described. Here's why:

- **`npm run dev`** -- completely unaffected. Dockerfiles and `docker-compose.yml` are inert files that do nothing unless you explicitly run `docker compose up`. Your dev workflow doesn't touch them.

- **`npm run start`** -- also unaffected. The `standalone` output mode adds a *new* `.next/standalone/` directory inside the build output, but `next start` continues to use the standard `.next/` output as it always has. They coexist.

- **`npm run build`**, **`npm run test`**, **`npm run lint`** -- all unchanged. No scripts are modified.

The only file that changes is `next.config`, and the `output: 'standalone'` setting is invisible to everything except what Docker uses to package the production image.

So I'll make this an **explicit acceptance criterion** in the quick spec: all existing `npm run` commands must continue to work identically on the host machine. If something breaks local dev, the spec isn't done.

Ready for me to create that quick spec? Or anything else you want to hash out first?

---

**User**

Yes, a quick spec would be fine

---

**Cursor**

No WIP file found -- starting fresh. Since we've already had a thorough requirements conversation, let me do a quick orient scan to verify the technical landscape before I capture everything.

Good -- orient scan complete. A couple of nice findings:

- `next.config.ts` already has `outputFileTracingRoot` pointing to the monorepo root, which is needed for standalone mode in a monorepo. That's one less thing to configure.
- The `API_URL` / `NEXT_PUBLIC_API_URL` split in `api.ts` is clean and exactly what we need for Docker networking.

Here's the captured understanding -- please confirm before I create the spec file:

---

**Title:** Docker Compose Containerization

**Problem Statement:** The application has no containerized deployment option. Running the app requires a local Node.js environment, manual dependency installation, and manual process management. There's no way to spin up the full stack with a single command for deployment purposes.

**Solution:** Add production-optimized Dockerfiles for the frontend and backend services, plus a `docker-compose.yml` to orchestrate them. Use multi-stage builds and Next.js standalone output mode to minimise image sizes. Mount a Docker volume for SQLite persistence.

**In Scope:**
- Dockerfile for backend (multi-stage, alpine-based, handles native `better-sqlite3` bindings)
- Dockerfile for frontend (multi-stage, standalone output mode, minimal runtime image)
- `docker-compose.yml` orchestrating both services with networking, env vars, and volume mount
- Root `.dockerignore`
- One-line change to `next.config.ts` (`output: 'standalone'`)

**Out of Scope:**
- Development-mode Docker setup (hot reload, volume-mounted source)
- Reverse proxy / nginx / TLS termination
- CI/CD pipeline integration
- Docker-based test execution
- Changes to existing `npm run` scripts, test suites, or application code

---

Does that look right, Kevin? Anything to add or adjust?

---

**User**

Will this allow me to run these containers locally and access the app via localhost:3000?

---

**Cursor**

Yes, exactly. That's the whole idea. `docker-compose.yml` will map the container ports to your host machine:

- **Frontend:** container port 3000 mapped to `localhost:3000` -- you open your browser, go to `http://localhost:3000`, and it works just like it does today.
- **Backend:** container port 3001 mapped to `localhost:3001` -- the browser's API calls to `http://localhost:3001` hit the backend container.

The workflow would be:

```bash
docker compose up --build
```

That single command builds both images (if needed) and starts both containers. You open `http://localhost:3000` and you're using the app. `Ctrl+C` stops everything. `docker compose down` tears it down.

One caveat worth noting: you can't run Docker Compose and your local `npm run dev` / `npm run start` at the same time, because they'd fight over the same ports (3000 and 3001). But that's expected -- you'd use one or the other, not both simultaneously. If you ever needed to change the host-mapped ports, that's a one-line change in the compose file.

So -- does the captured scope look good to you? Ready for me to create the spec file?

---

**User**

Yes, go ahead

---

**Cursor**

Created: `_bmad-output/implementation-artifacts/tech-spec-wip.md`

**Captured:**
- Title: Docker Compose Containerization
- Problem: No containerized deployment option; no single-command production startup
- Scope: 2 Dockerfiles, 1 docker-compose.yml, 1 .dockerignore, 1 one-line config change

**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Deep Investigation (Step 2 of 4)

---

**User**

c

---

**Cursor**

Now for the deep investigation. Based on the orient scan, I need to look at the build configurations, tsconfigs, and directory structure more closely. Let me dig in.

Investigation complete. Here's what I found, Kevin.

Based on my deep dive, I see the following key technical details:

- **`packages/frontend/next.config.ts`** already has `outputFileTracingRoot` pointing to the monorepo root -- that's a prerequisite for standalone mode in monorepos, so we're in good shape. Just needs `output: 'standalone'` added.
- **Backend migrations** use `path.resolve(__dirname, "../../drizzle")` in the compiled output, meaning the `drizzle/` folder at the backend package root must be present in the Docker image alongside `dist/`.
- **Backend already listens on `0.0.0.0`** -- that's essential for Docker networking. No change needed.
- **`better-sqlite3`** will need `python3`, `make`, and `g++` available in the Docker build stage for native addon compilation. The production stage doesn't need them.
- **Shared package** exports from `dist/index.js` in production mode (the `"default"` condition in its `exports` field), so it must be compiled before the frontend and backend are built.
- **`data/.gitkeep`** exists, confirming the data directory pattern. Docker volume will mount at this path.

Are there other files or directories I should investigate, or does this cover the landscape?

Assuming it does, here's the technical context I'm capturing:

**Tech Stack:** Docker, Docker Compose, Node.js Alpine images, multi-stage builds

**Files to Create (4):**
| File | Purpose |
|---|---|
| `packages/backend/Dockerfile` | Multi-stage build: compile shared + backend, copy dist + drizzle + node_modules to alpine runtime |
| `packages/frontend/Dockerfile` | Multi-stage build: compile shared + frontend in standalone mode, copy .next/standalone to alpine runtime |
| `docker-compose.yml` | Orchestrate frontend + backend services, networking, env vars, SQLite volume |
| `.dockerignore` | Exclude node_modules, .next, data, coverage, test artifacts from build context |

**Files to Modify (1):**
| File | Change |
|---|---|
| `packages/frontend/next.config.ts` | Add `output: 'standalone'` to config object |

**No test files affected.** No application logic changes. No API changes.

Let me update the WIP file with this context.

**Context Gathered:**

- Tech Stack: Docker, Docker Compose, Node.js 20 Alpine, multi-stage builds
- Files to Modify: 1 file (`next.config.ts` — one-line addition)
- Files to Create: 4 files (2 Dockerfiles, docker-compose.yml, .dockerignore)
- Patterns: npm workspaces monorepo, shared-first build order, Next.js standalone output, better-sqlite3 native bindings, Drizzle migration folder dependency
- Tests: No test files affected

**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Generate Spec (Step 3 of 4)

---

**User**

c

---

**Cursor**

Now let me generate the full implementation plan and acceptance criteria.

Now proceeding to the review step.

Here's your complete tech-spec, Kevin. Please review:

---

**Docker Compose Containerization** | 5 tasks, 11 acceptance criteria, 5 files to touch (4 new, 1 modified)

**Tasks:**

1. **Create root `.dockerignore`** -- Exclude `node_modules`, `.next`, `dist`, `data`, test artifacts, `.env` files, `.git`, `e2e`, `_bmad*`, and `*.md` from the build context.

2. **Add `output: 'standalone'` to `next.config.ts`** -- Single-line addition to the existing config object. Does not affect `next dev` or `next start` on the host.

3. **Create backend Dockerfile** -- Two-stage build. Stage 1 installs native build tools (`python3`, `make`, `g++`), copies monorepo workspace files, runs `npm ci`, builds shared then backend. Stage 2 copies compiled output (`dist/`, `drizzle/`), reinstalls production-only deps (for native `better-sqlite3` bindings), creates `data/` directory, runs `node packages/backend/dist/index.js`.

4. **Create frontend Dockerfile** -- Two-stage build. Stage 1 installs all deps, builds shared, sets `NEXT_PUBLIC_API_URL=http://localhost:3001` at build time, runs `next build` producing standalone output. Stage 2 copies `.next/standalone/`, `.next/static/`, and `public/` into the minimal runtime image, runs `node packages/frontend/server.js`.

5. **Create `docker-compose.yml`** -- Orchestrates both services with port mapping (3000, 3001), environment variables (including `API_URL=http://backend:3001` for SSR), a named volume for SQLite persistence, `depends_on` ordering, and `unless-stopped` restart policy.

**Acceptance Criteria (11):**

- AC 1-5: Build and start successfully; full CRUD works via `localhost:3000`
- AC 6: Data persists across `docker compose down` / `up` cycles
- AC 7-9: Host-machine `npm run dev`, `npm run build`, `npm run test` all still work identically
- AC 10-11: Backend image under 200MB, frontend image under 250MB

**Testing Strategy:** Manual verification only -- no automated tests added. Existing unit/E2E/Lighthouse suites cover application logic and are validated via AC 7-9.

---

**Select:** [C] Continue [E] Edit [Q] Questions [A] Advanced Elicitation [P] Party Mode

---

**User**

c

---

**Cursor**

**Tech-Spec Complete!**

Saved to: `_bmad-output/implementation-artifacts/tech-spec-docker-compose-containerization.md`

---

**Next Steps:**

[A] Advanced Elicitation - refine further
[R] Adversarial Review - critique of the spec (highly recommended)
[B] Begin Development - start implementing now (not recommended)
[D] Done - exit workflow
[P] Party Mode - get expert feedback before dev

---

Once you are fully satisfied with the spec (ideally after **Adversarial Review** and maybe a few rounds of **Advanced Elicitation**), it is recommended to run implementation in a FRESH CONTEXT for best results.

Copy this prompt to start dev:

```
quick-dev _bmad-output/implementation-artifacts/tech-spec-docker-compose-containerization.md
```

This ensures the dev agent has clean context focused solely on implementation.

---

**User**

r

---

**Cursor**

Launching the adversarial review in a separate agent for information asymmetry -- it will only see the spec file, not our conversation.

The review came back with 15 findings. Let me evaluate each one for severity and validity.

The adversarial review found 15 findings. Here they are ordered by severity:

---

**CRITICAL (4):**

| ID | Validity | Description |
|---|---|---|
| F1 | Real | **`DATABASE_PATH` and volume mount point to different locations.** Backend CMD runs from `/app` (WORKDIR), so `./data/todos.db` resolves to `/app/data/todos.db`. But the volume mounts at `/app/packages/backend/data`. The DB file is written outside the volume -- data lost on every restart. Violates AC 6. |
| F2 | Real | **Next.js standalone server binds to `localhost` inside the container.** It checks the `HOSTNAME` env var and defaults to `localhost` (loopback). Inside Docker, loopback is unreachable from the host. Must set `HOSTNAME=0.0.0.0` in frontend environment. Without this, AC 2 fails every time. |
| F3 | Real | **Backend production stage will fail to compile `better-sqlite3`.** Stage 2 runs `npm ci` (triggers `node-gyp`) but has no `python3`/`make`/`g++` installed. Must either install build tools in Stage 2 or copy `node_modules` from Stage 1 (requires same base image). |
| F4 | Undecided | **`npm ci` with workspace filters may fail when lockfile references missing workspaces.** Backend Dockerfile only copies shared + backend `package.json` stubs, but lockfile was generated with all three workspaces. Safer approach: copy all workspace `package.json` stubs. |

**HIGH (1):**

| ID | Validity | Description |
|---|---|---|
| F5 | Real | **`COPY packages/frontend/public/` will fail** because `public/` doesn't exist (favicon is in `src/app/`). Docker COPY has no conditional -- the build breaks. |

**MEDIUM (4):**

| ID | Validity | Description |
|---|---|---|
| F6 | Real | Frontend source file copy list says "and any other config files" -- not actionable for a dev agent. Must enumerate explicitly. |
| F7 | Real | `depends_on: backend` doesn't wait for process readiness. First SSR fetch may hit backend before Fastify binds. Should document as known limitation or add health check. |
| F8 | Real | No non-root user in either Dockerfile. Standard Docker security practice. |
| F9 | Real | No `--init` flag or `tini` for PID 1 signal handling in containers. |

**LOW (6):**

| ID | Validity | Description |
|---|---|---|
| F10 | Real | `REVALIDATION_SECRET` is set but never used by any route handler -- dead config. |
| F11 | Real | `LOG_LEVEL` missing from docker-compose backend environment. |
| F12 | Real | Image size AC targets are unsubstantiated guesses. |
| F13 | Real | ACs 2-5 require manual browser testing with no scriptable alternative. |
| F14 | Real | `output: 'standalone'` changes host build output too (adds `.next/standalone/`). Should acknowledge. |
| F15 | Real | No graceful shutdown handler -- SIGTERM won't flush SQLite WAL. |

---

Kevin, this review was genuinely useful -- it caught several real bugs that would have broken the Docker setup on first run. The 4 critical findings (F1-F3 especially) are show-stoppers that need to be fixed in the spec before implementation.

Want me to apply fixes for all of these findings now, or would you like to discuss which ones to address versus accept as known limitations?

**Select:** [A] Advanced Elicitation [R] Adversarial Review [B] Begin Development [D] Done [P] Party Mode

---

**User**

Please fix all of the findings!

---

**Cursor**

Let me check a few things in the codebase to make precise fixes, then I'll update the spec.

Good -- confirmed no `public/` directory exists. The frontend config files needed for a Docker build are: `next.config.ts`, `tsconfig.json`, and `postcss.config.mjs`. Now let me write the fully corrected spec addressing all 15 findings.

All 15 findings fixed. Here's a summary of the changes:

**Critical fixes (F1-F4):**
- **F1:** Changed `DATABASE_PATH` to absolute path `/app/packages/backend/data/todos.db` in docker-compose, with explicit explanation of why relative paths break
- **F2:** Added `HOSTNAME=0.0.0.0` to frontend environment in docker-compose, plus new Technical Decision #4 explaining the issue
- **F3:** Redesigned backend Dockerfile to use single `npm ci` + `npm prune --omit=dev` in the builder stage, then copy the pruned `node_modules` (with compiled native addons) to production stage. No second compilation needed.
- **F4:** Both Dockerfiles now copy ALL three workspace `package.json` stubs for lockfile integrity

**High fix (F5):**
- **F5:** Removed `public/` copy step entirely with explicit "Do NOT copy" note explaining why

**Medium fixes (F6-F9):**
- **F6:** Exhaustive list of frontend config files: `next.config.ts`, `tsconfig.json`, `postcss.config.mjs` -- no more "and any other config files"
- **F7:** Added health check to backend service (`wget --spider`), frontend uses `depends_on` with `condition: service_healthy`
- **F8:** Both Dockerfiles create a non-root `appuser` with `USER` directive; backend data dir is `chown`-ed
- **F9:** Added `init: true` to both services in docker-compose for proper signal handling

**Low fixes (F10-F15):**
- **F10:** Removed `REVALIDATION_SECRET` from docker-compose with explanation in Notes
- **F11:** Added `LOG_LEVEL=info` to backend environment
- **F12:** Moved image size targets from ACs to advisory guidance in Notes
- **F13:** Added `curl` commands to ACs 2-5 for scriptable verification
- **F14:** Task 2 notes now acknowledge `.next/standalone/` appears on host builds
- **F15:** Documented graceful shutdown behaviour in Notes with mitigation path

---

**Select:** [A] Advanced Elicitation [R] Adversarial Review [B] Begin Development [D] Done [P] Party Mode

