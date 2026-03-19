# Project Context — todo-bmad

## Code Quality Rules

### Never use `suppressHydrationWarning`

`suppressHydrationWarning` is forbidden. Its presence is always a code smell — it silences a symptom rather than fixing the root cause (server/client rendering mismatch). If you find yourself reaching for it:

- For **timestamps or other time-dependent values**: use a static format (e.g. `DD/MM/YYYY HH:mm`) that is identical on server and client, rather than a relative format that drifts after the ISR cache is written.
- For **user-generated or locale-specific content**: ensure the server and client render the same value, or defer the dynamic portion to a client-only effect after hydration with an explicit loading/placeholder state.
- If a genuine mismatch is unavoidable, document it explicitly and use a client-only component that renders `null` on the server and populates after mount — never suppress the warning.

### Never assert on CSS class names or inline styles in tests

CSS class names and computed CSS styles are implementation details that can change without breaking behaviour. **Never** use `className`, `toHaveClass()`, `getAttribute("class")`, `getComputedStyle()`, or any other CSS inspection in test assertions.

Instead, expose state through semantic attributes that are stable by design:

- **Prefer `aria-` attributes** for state that maps to an ARIA concept (e.g. `aria-disabled`, `aria-checked`, `aria-expanded`).
- **Use `data-` attributes** for custom application state that has no ARIA equivalent (e.g. `data-completed="true"` on a todo card).

Add the attribute to the component and query it in both unit tests and POM methods.

### E2E tests must use Page Object Models

Playwright tests must use Page Object Models (POMs) from `e2e/pages/` rather than inline locators. Each POM class encapsulates locators, actions, and query helpers for a page or major UI region. Keep all assertions in the test files — POMs should not import `expect` or contain assertion logic. When a test needs to verify a visual property (e.g. focus ring, hover state), the POM exposes a query method returning a value and the test asserts on it.

## Git Branching Convention

### 🚨 STOP — Git Pre-Flight is STEP ZERO. No Exceptions.

This pre-flight has been missed multiple times. **Before loading the story file, before reading any source file, before running any command related to the story — complete all three checks below in order.** Skipping any step is a critical process violation.

**Branch naming:** `feat/{story-key}` (e.g., `feat/1-1-project-scaffolding-shared-api-contract`)

#### Pre-Flight Sequence (run these commands first, every time)

**1. Verify you are on `main`**

```bash
git branch --show-current
```

If the output is not `main`, stop and check out main before continuing:

```bash
git checkout main
```

**2. Pull the latest from origin**

```bash
git fetch origin
git pull --ff-only origin main
```

If `pull --ff-only` fails (diverged history), do not proceed — resolve the divergence manually and confirm with the user.

**3. Create and check out the story branch**

```bash
git checkout -b feat/{story-key}
```

If the branch already exists (prior session), switch to it and note that work may have already started:

```bash
git checkout feat/{story-key}
```

Confirm you are on the correct branch before doing anything else:

```bash
git branch --show-current   # must print feat/{story-key}
```

Only after all three steps complete successfully may implementation begin.

---

**Ongoing workflow:**

- Commit work incrementally as tasks are completed. Use clear commit messages referencing the story (e.g., `feat(1.1): scaffold monorepo with npm workspaces`).
- When the story is complete and status is set to `review`, push the branch and inform the user so they can raise a PR to merge into `main`.
- Do NOT merge into `main` directly. Do NOT push to `main`.

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

**⚠️ 100% coverage is a mandatory gate — no story may be marked `review` unless all packages report 100% across all four metrics.**

Every `npm run test` run collects coverage and **fails with a non-zero exit code** if any package drops below 100%. This is enforced by `coverageThreshold` in each `jest.config.js` — coverage numbers are not advisory.

**Required thresholds (all packages):**

| Metric     | Threshold |
|------------|-----------|
| Statements | 100%      |
| Branches   | 100%      |
| Functions  | 100%      |
| Lines      | 100%      |

**Excluded files (not measured):**

- `packages/frontend/src/lib/actions.ts` — Next.js Server Action (not unit-testable)
- `packages/frontend/src/app/layout.tsx` — Next.js layout entry point
- `packages/frontend/src/app/page.tsx` — Next.js page entry point
- `packages/backend/src/index.ts` — server entry point
- `packages/backend/src/db/client.ts` — DB connection entry point
- `packages/shared/src/index.ts` — package entry point

**Approved `/* istanbul ignore next */` usage:**

`/* istanbul ignore next */` is permitted **only** for code paths that are structurally unreachable during a correctly mounted component's lifecycle, and **must** include an explanatory comment. Current approved usages:

- `todo-input.tsx`: `inputRef.current?.focus()` and `inputRef.current?.blur()` — `inputRef.current` is always attached for a mounted component; the null branch is unreachable without adversarial test gymnastics.

Do **not** use `/* istanbul ignore next */` to silence branches that are merely inconvenient to test. If a branch is reachable but hard to exercise, write the test.

**Coverage gap rule:** Coverage gaps must be closed in the **same story** that introduces the code — never deferred to a later story.

### Step 4 — E2E Tests

> ⚠️ **ALWAYS run outside the sandbox** using `required_permissions: ["all"]` in the Shell tool. `npm run test:e2e` requires OS-level network access and a real Chromium binary — it will always fail inside the Cursor sandbox regardless of any other settings.
> ⚠️ **If tests fail with "Executable doesn't exist"**: Cursor stores Playwright browser binaries in macOS's temp directory (`/var/folders/.../T/cursor-sandbox-cache/`), which is cleared on system restart. Fix by running `npx playwright install chromium` (with `required_permissions: ["all"]`) once after each reboot.

```bash
npm run test:e2e  # ← Shell tool with required_permissions: ["all"]
```

### Step 5 — Lighthouse Audit *(frontend stories only)*

> ⚠️ **MANDATORY for any story that touches frontend files.**
> ⚠️ **ALWAYS run outside the sandbox** using `required_permissions: ["all"]` — Lighthouse requires OS-level access to launch a headless Chromium binary.
> ⚠️ **If Lighthouse fails with "Executable doesn't exist"**: run `npx playwright install chromium` (with `required_permissions: ["all"]`) to reinstall. Cursor stores browser binaries in macOS's temp directory (`/var/folders/.../T/cursor-sandbox-cache/`), which is cleared on system restart. This is expected — reinstall once after each reboot.

The script always runs `npm run build` first (unless a server is already on port 3000), then starts the **production** stack (`npm run start`), runs desktop and mobile audits headlessly (no visible browser window), prints scores, and stops the production stack when done. Scores reflect the production build, not the dev server.

```bash
npm run test:lighthouse   # ← Shell tool with required_permissions: ["all"]
```

The script exits with a non-zero code if any score is below its required threshold, so a clean exit (`Exit code: 0`) confirms all scores passed.

**Required scores:**

| Category | Desktop | Mobile |
|---|---|---|
| Performance | **90** | **100** |
| Accessibility | **100** | **100** |
| Best Practices | **100** | **100** |
| SEO | **100** | **100** |

Desktop performance floor is 90 (observed ~93–94) because the dynamic route blocks on the API fetch before streaming HTML, causing LCP ~1.7s. The fix (React Suspense streaming) is scoped to Story 3-1. All other categories must remain at 100 unless a drop is technically unavoidable — document reason and minimum in the story's Dev Agent Record.

> **Note:** The Chrome DevTools MCP server is NOT used for Lighthouse audits. The `test:lighthouse` script uses the `lighthouse` npm package directly with a headless Chrome flag.
