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

No story may be marked `review` until every step below is completed in order, without error. Do not skip any step.

### Step 1 — Lint

```bash
npm run lint   # ESLint passes with 0 errors (frontend)
```

### Step 2 — Build

```bash
npm run build  # production build completes without TypeScript or compilation errors
```

### Step 3 — Unit Tests

```bash
npm run test   # all Jest unit/integration tests pass across all packages
```

### Step 4 — E2E Tests

> ⚠️ **ALWAYS run outside the sandbox** using `required_permissions: ["all"]` in the Shell tool. `npm run test:e2e` requires OS-level network access and a real Chromium binary — it will always fail inside the Cursor sandbox regardless of any other settings.

```bash
npm run test:e2e  # ← Shell tool with required_permissions: ["all"]
```

### Step 5 — Lighthouse Audit *(frontend stories only)*

> ⚠️ **MANDATORY for any story that touches frontend files.** Start the dev server outside the sandbox first (`required_permissions: ["all"]`), wait for the "Ready" message, then run both audits via the Chrome DevTools MCP server.

```bash
npm run dev   # ← Shell tool with required_permissions: ["all"] — wait for "Ready"
```

Using the Chrome DevTools MCP:
1. `new_page` — `url: "http://localhost:3000"`
2. `lighthouse_audit` — `mode: "navigation"`, `device: "desktop"`
3. `lighthouse_audit` — `mode: "navigation"`, `device: "mobile"`
4. Stop the dev server after audits complete

**Required scores (both desktop and mobile):**
- Accessibility: **100**
- Best Practices: **100**
- SEO: **100**

Scores must remain at 100 unless a drop is technically unavoidable — in which case document the reason and minimum acceptable score in the story's Dev Agent Record.
