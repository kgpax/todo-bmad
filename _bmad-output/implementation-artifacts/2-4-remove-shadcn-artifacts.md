# Story 2.4: Remove shadcn Artifacts

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want unused shadcn/ui scaffolding removed from the frontend package,
So that the codebase only contains dependencies and configuration that are actually used.

## Acceptance Criteria

1. **Given** the frontend package **When** `components.json` is inspected **Then** it has been deleted (shadcn CLI config is no longer needed)

2. **Given** the frontend `package.json` **When** dependencies are inspected **Then** `@radix-ui/react-slot`, `class-variance-authority`, and `jiti` have been removed (unused scaffolding dependencies)

3. **Given** the frontend codebase **When** all source files are inspected **Then** no file imports from `@radix-ui/react-slot`, `class-variance-authority`, or `jiti`

4. **Given** dependencies that remain (`clsx`, `tailwind-merge`, `lucide-react`, `@radix-ui/react-checkbox`) **When** the project builds and all tests pass **Then** no functionality is affected by the removal

5. **Given** a clean `node_modules` reinstall (`rm -rf node_modules package-lock.json && npm install`) **When** executed after all dependency removals **Then** install completes with no errors and the lockfile is regenerated cleanly

6. **Given** `npm run test` and `npm run build` **When** executed after clean install **Then** both pass cleanly with no errors

## Tasks / Subtasks

- [x] Task 1: Delete `components.json` (AC: #1)
  - [x] 1.1 Delete `packages/frontend/components.json`
  - [x] 1.2 Verify no config file, script, or source code references `components.json`

- [x] Task 2: Remove unused npm dependencies (AC: #2, #3)
  - [x] 2.1 Run `npm uninstall @radix-ui/react-slot class-variance-authority jiti -w packages/frontend`
  - [x] 2.2 Verify `package.json` no longer lists any of the three removed dependencies
  - [x] 2.3 Confirm zero source files import from any removed package (pre-verified: none do)

- [x] Task 3: Clean install to verify dependency tree integrity (AC: #5)
  - [x] 3.1 Delete `node_modules/` at root and all packages: `rm -rf node_modules packages/*/node_modules`
  - [x] 3.2 Run `npm install` from the root — must complete with no errors
  - [x] 3.3 Verify `jiti` is still present in `node_modules/` as a transitive dependency (pulled by `@tailwindcss/postcss` and `eslint`)

- [x] Task 4: Verify retained dependencies are unaffected (AC: #4)
  - [x] 4.1 Confirm `clsx` (used in `lib/utils.ts` → `cn()`) is still present
  - [x] 4.2 Confirm `tailwind-merge` (used in `lib/utils.ts` → `cn()`) is still present
  - [x] 4.3 Confirm `lucide-react` (used in `todo-item.tsx` X icon, `ui/checkbox.tsx` Check icon) is still present
  - [x] 4.4 Confirm `@radix-ui/react-checkbox` (used in `ui/checkbox.tsx`) is still present

- [x] Task 5: Verify Definition of Done (AC: #6)
  - [x] 5.1 `npm run lint` — 0 errors
  - [x] 5.2 `npm run build` — production build clean
  - [x] 5.3 `npm run test` — all Jest tests pass with 100% coverage across all packages
  - [x] 5.4 `npm run test:e2e` — all existing E2E tests pass
  - [x] 5.5 `npm run test:lighthouse` — Desktop & Mobile: Accessibility 100, Best Practices 100, SEO 100

## Dev Notes

### Architecture Compliance

This is a **cleanup story in Epic 2** — it removes dead scaffolding without changing any application behavior. Zero source files import from either `@radix-ui/react-slot` or `class-variance-authority` (verified via codebase grep).

**Background:** shadcn/ui was initialized during project scaffolding (Story 1.1) but no components were ever added via `npx shadcn add`. Every component was hand-built using Radix UI primitives directly with custom Tailwind styling. The architecture explicitly documents this:

> **Do not use `npx shadcn add` for any component.**

[Source: architecture.md#PRD Deviation Log — "shadcn was initialized during scaffolding but no components were ever added via `npx shadcn add`"]

### What Gets Removed

| Artifact | Type | Why Unused |
|----------|------|-----------|
| `packages/frontend/components.json` | File | shadcn CLI config — CLI is never used since components are hand-built |
| `@radix-ui/react-slot` | npm dep | shadcn's `Slot` component wrapper — no source file imports it |
| `class-variance-authority` | npm dep | shadcn's variant utility (`cva`) — no source file imports it |
| `jiti` | npm dep | Tailwind v3 config loader — v4 uses CSS-based config; still available as transitive dep via `@tailwindcss/postcss` and `eslint` |

### What Stays (Do NOT Remove)

| Dependency | Used By | Purpose |
|-----------|---------|---------|
| `clsx` | `lib/utils.ts` → `cn()` | Class name concatenation |
| `tailwind-merge` | `lib/utils.ts` → `cn()` | Tailwind class deduplication |
| `lucide-react` | `todo-item.tsx` (X icon), `ui/checkbox.tsx` (Check icon) | Icons |
| `@radix-ui/react-checkbox` | `components/ui/checkbox.tsx` | Accessible checkbox primitive |
| `@formkit/auto-animate` | `todo-list.tsx` | FLIP animation for list transitions |

### Removal Command

```bash
npm uninstall @radix-ui/react-slot class-variance-authority jiti -w packages/frontend
```

This updates both `packages/frontend/package.json` and the root `package-lock.json` atomically.

### Clean Install Verification

After uninstall, perform a full clean reinstall to prove the dependency tree is healthy:

```bash
rm -rf node_modules packages/*/node_modules
npm install
```

`jiti` will still be present in `node_modules/` as a transitive dependency (required by `@tailwindcss/node` and `eslint`). The removal only strips it as an unnecessary **direct** dependency from `packages/frontend/package.json`.

### Pre-Verified: Zero Import References

Codebase search confirms no source file in `packages/frontend/src/` imports from any of the three removed packages. The `lib/utils.ts` file uses `clsx` and `tailwind-merge` only — it does NOT re-export `cva` from `class-variance-authority` (a common shadcn pattern that was never introduced here). `jiti` is a runtime config loader never imported by application code.

### What This Story Does NOT Include

- No changes to any source code (`.tsx`, `.ts`, `.css`) — only `package.json`, `package-lock.json`, and `components.json`
- No removal of the `components/ui/` directory — `checkbox.tsx` and its test live there and are actively used
- No changes to `lib/utils.ts` — the `cn()` helper uses `clsx` + `tailwind-merge`, not `cva`
- No backend or shared package changes

### Previous Story Intelligence

**From Story 2.3 (done):**
- 139 Jest unit tests (100% coverage), 18 E2E tests, Lighthouse Accessibility/Best Practices/SEO all 100
- Delete button uses `lucide-react` X icon — confirms `lucide-react` must stay
- `data-pending-deleting="true"` and `data-completed` attributes used for testing
- Git branch pattern: `feat/{story-key}`

**From Story 2.2 (done):**
- `@formkit/auto-animate` is installed and actively used — do NOT remove
- `jest.mock("@formkit/auto-animate/react")` is in global `jest.setup.ts`

### Anti-Patterns to Avoid

- **Do NOT remove `clsx`, `tailwind-merge`, `lucide-react`, or `@radix-ui/react-checkbox`** — these are actively used
- **Do NOT edit any source files** — if any source file imported the removed packages, that would be a different story. None do.
- **Do NOT use `npx shadcn add` for anything** — the whole point is removing shadcn
- **Do NOT manually edit `package-lock.json`** — `npm uninstall` + clean install handles it
- **Do NOT worry about `jiti` disappearing from `node_modules`** — it remains as a transitive dep of `@tailwindcss/postcss` → `@tailwindcss/node` and `eslint`; only the direct listing in `package.json` is removed
- **Do NOT forget `required_permissions: ["all"]` for E2E and Lighthouse commands**

### Naming Conventions (Enforced)

| Context | Convention | Example |
|---------|-----------|---------|
| Git branch | `feat/{story-key}` | `feat/2-4-remove-shadcn-artifacts` |
| Commit message | `feat({story-id}): description` | `feat(2.4): remove unused shadcn artifacts` |

### Project Structure Notes

**Files DELETED:**
```
packages/frontend/components.json     (shadcn CLI config)
```

**Files MODIFIED:**
```
packages/frontend/package.json        (remove 3 dependencies: @radix-ui/react-slot, class-variance-authority, jiti)
package-lock.json                     (regenerated via clean install)
```

**Files UNCHANGED:**
```
packages/frontend/src/                (all source files unchanged)
packages/frontend/src/lib/utils.ts    (cn() uses clsx + tailwind-merge, not cva)
packages/frontend/src/components/ui/  (checkbox.tsx uses @radix-ui/react-checkbox, stays)
packages/backend/                     (no changes)
packages/shared/                      (no changes)
e2e/                                  (no changes)
```

### References

- [Source: epics.md#Story 2.4] — acceptance criteria, background context
- [Source: architecture.md#PRD Deviation Log] — "shadcn was initialized during scaffolding but no components were ever added"
- [Source: architecture.md#Starter Template Evaluation] — "Do not use `npx shadcn add` for any component"
- [Source: architecture.md#Enforcement Rules] — named exports, co-located tests
- [Source: project-context.md#Definition of Done] — lint, build, test, E2E, Lighthouse gates
- [Source: project-context.md#Git Branching Convention] — feature branch pattern
- [Source: 2-3-delete-todos.md] — previous story test counts, patterns, git branch convention

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Debug Log References

No issues encountered. Straightforward cleanup story with no source code changes.

### Completion Notes List

- Deleted `packages/frontend/components.json` (shadcn CLI config — never used since all components were hand-built)
- Removed 3 direct dependencies from `packages/frontend/package.json`: `@radix-ui/react-slot`, `class-variance-authority`, `jiti`
- Confirmed zero source files import from any removed package
- Performed full clean reinstall (`rm -rf node_modules packages/*/node_modules && npm install`) — completed with no errors
- Confirmed `jiti` remains available as a transitive dependency (via `@tailwindcss/postcss` → `@tailwindcss/node`)
- All retained deps (`clsx`, `tailwind-merge`, `lucide-react`, `@radix-ui/react-checkbox`, `@formkit/auto-animate`) confirmed present
- All validation gates passed: lint (0 errors), build (clean), 201 Jest tests (100% coverage), 18 E2E tests, Lighthouse Desktop & Mobile all 100

### File List

- `packages/frontend/components.json` — DELETED
- `packages/frontend/package.json` — MODIFIED (removed 3 deps)
- `package-lock.json` — MODIFIED (regenerated via clean install)

### Change Log

- 2026-03-19: Deleted `components.json`; removed `@radix-ui/react-slot`, `class-variance-authority`, `jiti` from `packages/frontend/package.json`; regenerated `package-lock.json` via clean install. All tests, build, lint, E2E, and Lighthouse gates pass.
- 2026-03-19: Code review passed. All 6 ACs verified implemented. All 14 subtasks confirmed complete. Git changes fully consistent with story File List. Lint, build, 201 tests (100% coverage) verified independently. Zero issues found. Status → done.
