# Project Context — todo-bmad

## Git Branching Convention

Each story MUST be implemented on its own feature branch. The `main` branch is protected and only receives changes via pull request.

**Branch naming:** `feat/{story-key}` (e.g., `feat/1-1-project-scaffolding-shared-api-contract`)

**Workflow:**

1. Before starting any implementation, create and check out the feature branch from `main`:
   ```
   git checkout main && git pull
   git checkout -b feat/{story-key}
   ```
2. Commit work incrementally as tasks are completed. Use clear commit messages referencing the story (e.g., `feat(1.1): scaffold monorepo with npm workspaces`).
3. When the story is complete and status is set to `review`, push the branch and inform the user so they can raise a PR to merge into `main`.
4. Do NOT merge into `main` directly. Do NOT push to `main`.

## Definition of Done

Before any story implementation is considered complete, ALL of the following must pass without error:

```bash
npm run dev    # dev server starts cleanly with no module or compilation errors
npm run test   # all Jest unit/integration tests pass across all packages
npm run build  # production build completes without errors
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

No story may be marked `review` until ALL commands above exit successfully, including `npm run test:e2e` run outside the sandbox.
