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

### Step 3 — Unit Tests & Coverage

```bash
npm run test   # all Jest unit/integration tests pass across all packages
```

Coverage is collected automatically on every test run (configured in each package's `jest.config.js`). The build **fails** if any package drops below the required threshold:

| Metric | Required |
|--------|----------|
| Statements | ≥ 80% |
| Branches | ≥ 80% |
| Functions | ≥ 80% |
| Lines | ≥ 80% |

**Coverage rules:**
- Every story that adds or modifies source files must maintain ≥ 80% coverage — do not defer coverage gaps to a later story.
- Write unit tests alongside each task, not as a batch at the end.
- The following files are excluded from coverage measurement as they are untestable in Jest (Next.js internals / entry points):
  - `src/lib/actions.ts` (Next.js Server Action wrapper)
  - `src/app/layout.tsx`, `src/app/page.tsx` (Next.js page/layout entry points)
  - `src/index.ts` (server/package entry points)
  - `src/db/client.ts` (database connection module)

### Step 4 — E2E Tests

> ⚠️ **ALWAYS run outside the sandbox** using `required_permissions: ["all"]` in the Shell tool. `npm run test:e2e` requires OS-level network access and a real Chromium binary — it will always fail inside the Cursor sandbox regardless of any other settings.

```bash
npm run test:e2e  # ← Shell tool with required_permissions: ["all"]
```

### Step 5 — Lighthouse Audit *(frontend stories only)*

> ⚠️ **MANDATORY for any story that touches frontend files.**
> ⚠️ **ALWAYS run outside the sandbox** using `required_permissions: ["all"]` — Lighthouse requires OS-level access to launch a headless Chromium binary.

The script starts the dev server, runs desktop and mobile audits headlessly (no visible browser window), prints scores, and stops the server automatically:

```bash
npm run test:lighthouse   # ← Shell tool with required_permissions: ["all"]
```

The script exits with a non-zero code if any score is below 100, so a clean exit (`Exit code: 0`) confirms all scores passed.

**Required scores (both desktop and mobile):**
- Accessibility: **100**
- Best Practices: **100**
- SEO: **100**

Scores must remain at 100 unless a drop is technically unavoidable — in which case document the reason and minimum acceptable score in the story's Dev Agent Record.

> **Note:** The Chrome DevTools MCP server is NOT used for Lighthouse audits. The `test:lighthouse` script uses the `lighthouse` npm package directly with a headless Chrome flag.
