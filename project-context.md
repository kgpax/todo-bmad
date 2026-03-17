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
