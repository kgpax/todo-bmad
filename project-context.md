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
| Performance | **90** | **90** |
| Accessibility | **100** | **100** |
| Best Practices | **100** | **100** |
| SEO | **100** | **100** |

Performance floor is 90 for both platforms. Desktop observed ~93–94 (LCP ~1.7s due to dynamic route blocking on API fetch before streaming HTML); mobile observed 100 consistently. All other categories must remain at 100 unless a drop is technically unavoidable — document reason and minimum in the story's Dev Agent Record.

> **Note:** The Chrome DevTools MCP server is NOT used for Lighthouse audits. The `test:lighthouse` script uses the `lighthouse` npm package directly with a headless Chrome flag.

### ADR: SSR failure scenarios tested at unit level, not E2E (2026-03-20)

**Context:** Story 3-3 required E2E tests for AC #12–14: initial load failure showing `LoadError`, retry success showing skeleton then content, and retry failure showing `LoadError` again. These scenarios involve the initial `fetchTodos()` call failing server-side during SSR.

**Decision:** E2E tests for AC #12–14 were implemented, reviewed, and **removed**. The SSR failure path is covered by unit tests only.

**Root cause of removal:** Playwright's `page.route()` intercepts only browser-level network requests. When Next.js server components execute `fetchTodos()`, that HTTP call originates from the Node.js server process — a separate OS process that Playwright cannot observe or mock. The only way to simulate SSR failure in E2E is to kill the backend process. An initial implementation using `lsof -ti:3001 | xargs kill -9` accidentally killed the Playwright worker itself (it had open TCP connections to port 3001). A refined implementation using `pkill -9 -f 'tsx.*conditions=development'` worked, but killing OS processes in an automated test suite is inherently fragile and dangerous in CI environments.

**Why unit tests are sufficient for this path:** The SSR failure path is shallow and fully deterministic: `fetchTodos()` returns `{ fetchFailed: true }` → `page.tsx` passes `fetchFailed={true}` to `<TodoPage>` → `useTodos` initialises `loadError=true` → `<TodoPage>` renders `<LoadError>`. Every step of this chain has direct unit test coverage. There is no browser behaviour, animation, or user interaction involved that a unit test cannot verify.

**Consequences:**
- Do not add E2E tests for SSR-initiated error states unless a test seam is introduced (e.g. an env var that makes `fetchTodos()` return `fetchFailed: true` without a real network call, readable server-side without a process restart).
- Client-side retry flows (AC #4–6) remain appropriate for E2E testing via `page.route()`, since the retry fetch originates in the browser.
- This pattern generalises: any behaviour that originates server-side in a Next.js server component should be tested at the unit/integration level, not E2E, unless a proper test seam exists.

### ADR: React Suspense streaming via `loading.tsx` rejected (2026-03-20)

**Context:** Story 3-1 proposed adding `packages/frontend/src/app/loading.tsx` to create a Suspense boundary around `page.tsx`. The hypothesis was that streaming would improve desktop Lighthouse performance by sending a skeleton shell immediately while the API fetch resolved, reducing both FCP and LCP.

**Decision:** The `loading.tsx` streaming approach was implemented, tested, and **rejected**. All implementation was fully reverted.

**Measured results:**

| Metric | Without `loading.tsx` | With `loading.tsx` |
|---|---|---|
| FCP | ~1.7 s | ~0.8 s |
| LCP | ~1.7 s (consistent) | 1.7–2.4 s (variable) |
| Desktop Lighthouse Performance | 93–94 (stable) | 87–93 (fails ≥90 in ~70% of runs) |

**Root cause:** Suspense streaming splits the render into two phases — skeleton HTML arrives immediately (FCP), then real content arrives as a streaming chunk after `fetchTodos()` resolves and React processes the `$RC()` update (LCP). Phase 2 LCP is dominated by JavaScript bundle execution time during React hydration in headless Chrome. V8 JIT warm-up and CPU scheduler variability cause LCP to swing by up to 700 ms between runs. Without streaming, FCP and LCP are the same single-phase render event, so LCP is consistent.

**Consequences:**
- The 90 performance floor is preserved. Desktop LCP remains at ~1.7 s (consistent).
- **Do not re-attempt `loading.tsx`** or any App Router Suspense streaming boundary on this stack without first solving the two-phase LCP variability problem (e.g., by reducing the JavaScript bundle size enough that Phase 2 hydration is negligible).
- The SkeletonLoader component concept is still valid for **client-side** loading states (e.g., error-retry flows in stories 3-3 and 3-4), but must not be delivered via a route-level Suspense boundary.
- Stories 3-3 (Initial Load Error) and 3-4 (Graceful Degradation) need their SkeletonLoader/`loading.tsx` references revisited to use a client-side approach instead.
