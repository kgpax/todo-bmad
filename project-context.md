# Project Context — todo-bmad

## Git Branching Convention

### ⚠️ CRITICAL — Create Feature Branch BEFORE Writing Any Code

Each story MUST be implemented on its own feature branch. The `main` branch is protected and only receives changes via pull request.

**Branch naming:** `feat/{story-key}` (e.g., `feat/1-1-project-scaffolding-shared-api-contract`)

> **MANDATORY for AI Agents:** The very first action when starting any story implementation MUST be to create and check out the feature branch. Do NOT read files, do NOT write code, do NOT run tests until this step is complete. Implementing on `main` is a critical process violation.

**Workflow:**

1. **FIRST ACTION — before anything else:** create and check out the feature branch from `main`:
   ```bash
   git checkout main && git pull
   git checkout -b feat/{story-key}
   ```
2. Verify you are on the correct branch (`git branch --show-current`) before proceeding.
3. Commit work incrementally as tasks are completed. Use clear commit messages referencing the story (e.g., `feat(1.1): scaffold monorepo with npm workspaces`).
4. When the story is complete and status is set to `review`, push the branch and inform the user so they can raise a PR to merge into `main`.
5. Do NOT merge into `main` directly. Do NOT push to `main`.

## Definition of Done

Before any story implementation is considered complete, ALL of the following must pass without error:

```bash
npm run dev    # dev server starts cleanly with no module or compilation errors
npm run test   # all Jest unit/integration tests pass across all packages
npm run build  # production build completes without errors
npm run lint   # ESLint passes with no errors (frontend)
```

### ⚠️ CRITICAL — E2E Tests: ALWAYS Run Outside the Sandbox

```bash
npm run test:e2e  # ← MUST be run with required_permissions: ["all"]
```

> **MANDATORY for AI Agents:** `npm run test:e2e` requires OS-level network interface access (`uv_interface_addresses`) and a real Chromium binary. It will **always fail** inside the Cursor sandbox — no matter what `required_permissions` are set.
>
> **ALWAYS run `npm run test:e2e` using `required_permissions: ["all"]`** in the Shell tool to execute it outside the sandbox. This is not optional — E2E tests MUST pass before a story can be marked `review`.
>
> **DO NOT skip `npm run test:e2e`.** A story is NOT complete until E2E tests pass.

No story may be marked `review` until ALL commands above exit successfully, including `npm run lint` and `npm run test:e2e` run outside the sandbox.

### Lighthouse Audit via Chrome DevTools MCP

For any story that modifies frontend files, run Lighthouse audits using the Chrome DevTools MCP server after starting the dev server (`npm run dev`):

1. Open the page: `new_page` with `url: "http://localhost:3000"`
2. Run desktop audit: `lighthouse_audit` with `mode: "navigation"`, `device: "desktop"`
3. Run mobile audit: `lighthouse_audit` with `mode: "navigation"`, `device: "mobile"`

**Required scores (both desktop and mobile):**
- Accessibility: **100**
- Best Practices: **100**
- SEO: **100**

Scores must remain at 100 unless a drop is technically unavoidable — in which case the story must document the reason and the minimum acceptable score.

> **MANDATORY for AI Agents:** The dev server must be running before invoking the MCP tools. Start it with `npm run dev` (using `required_permissions: ["all"]`) and wait for the "Ready" message before opening the page. Stop the server after the audit completes. A story with frontend changes is NOT complete until Lighthouse scores meet the thresholds above.
