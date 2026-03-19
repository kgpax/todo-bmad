# Story 2.5: ESLint for Backend & Shared Packages

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want ESLint configured for the backend and shared packages with the same rigor as the frontend,
So that all three workspace packages have consistent code quality enforcement beyond what TypeScript's type checker alone catches.

## Acceptance Criteria

1. **Given** the backend package **When** `eslint.config.mjs` is inspected **Then** it configures `typescript-eslint` with recommended rules for TypeScript files in `src/`

2. **Given** the shared package **When** `eslint.config.mjs` is inspected **Then** it configures `typescript-eslint` with recommended rules for TypeScript files in `src/`

3. **Given** the backend ESLint config **When** `npm run lint -w packages/backend` is run **Then** all existing source files pass with 0 errors and 0 warnings

4. **Given** the shared ESLint config **When** `npm run lint -w packages/shared` is run **Then** all existing source files pass with 0 errors and 0 warnings

5. **Given** the root `package.json` **When** `npm run lint` is run **Then** it lints all three packages: shared, backend, and frontend

6. **Given** both new ESLint configs **When** generated output directories are inspected **Then** `dist/`, `coverage/`, and `drizzle/` (backend only) directories are excluded from linting

7. **Given** the existing frontend ESLint config **When** inspected after this story **Then** it is unchanged — no regressions to frontend linting

8. **Given** all three packages **When** `npm run lint` is run from the root **Then** the command exits 0 with no errors across any package

## Tasks / Subtasks

- [ ] Task 1: Install ESLint and typescript-eslint in backend package (AC: #1, #3)
  - [ ] 1.1 Install `eslint` and `typescript-eslint` as devDependencies in `packages/backend`: `npm install -D eslint typescript-eslint -w packages/backend`
  - [ ] 1.2 Create `packages/backend/eslint.config.mjs` using flat config with `typescript-eslint` recommended preset, targeting `src/**/*.ts`
  - [ ] 1.3 Exclude `dist/`, `coverage/`, `drizzle/`, and `data/` directories via `globalIgnores`
  - [ ] 1.4 Add `"lint": "eslint"` script to `packages/backend/package.json`
  - [ ] 1.5 Run `npm run lint -w packages/backend` and fix any errors

- [ ] Task 2: Install ESLint and typescript-eslint in shared package (AC: #2, #4)
  - [ ] 2.1 Install `eslint` and `typescript-eslint` as devDependencies in `packages/shared`: `npm install -D eslint typescript-eslint -w packages/shared`
  - [ ] 2.2 Create `packages/shared/eslint.config.mjs` using flat config with `typescript-eslint` recommended preset, targeting `src/**/*.ts`
  - [ ] 2.3 Exclude `dist/` and `coverage/` directories via `globalIgnores`
  - [ ] 2.4 Add `"lint": "eslint"` script to `packages/shared/package.json`
  - [ ] 2.5 Run `npm run lint -w packages/shared` and fix any errors

- [ ] Task 3: Update root lint script to cover all packages (AC: #5, #8)
  - [ ] 3.1 Update root `package.json` `lint` script to: `npm run lint -w packages/shared && npm run lint -w packages/backend && npm run lint -w packages/frontend`
  - [ ] 3.2 Run `npm run lint` from root and verify all three packages pass

- [ ] Task 4: Verify no regressions (AC: #7, #8)
  - [ ] 4.1 Run `npm run build` — production build clean
  - [ ] 4.2 Run `npm run test` — all tests pass with 100% coverage
  - [ ] 4.3 Run `npm run lint` — 0 errors across all packages

## Dev Notes

### Architecture Compliance

This is a DX-focused story similar to Story 2.4 (Remove shadcn Artifacts). It adds code quality tooling without changing any application behavior.

**Key constraints:**
- Use ESLint 9 flat config (`eslint.config.mjs`) — matches the frontend pattern
- Use `typescript-eslint` (the modern unified package) — NOT the legacy `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser` combo
- The frontend already uses ESLint 9 via `eslint-config-next` which bundles its own TypeScript handling. Do NOT change the frontend config.
- Named exports, `@/` alias, and other enforcement rules are not relevant to ESLint config files themselves

**ESLint config pattern for backend/shared (`eslint.config.mjs`):**

```javascript
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/", "coverage/", "drizzle/", "data/"],
  }
);
```

The `typescript-eslint` package's `config()` helper produces a valid ESLint flat config array. The `recommended` preset includes the parser, plugin, and sensible rules for TypeScript.

### What This Story Does NOT Include

- No changes to frontend ESLint configuration
- No addition of custom or stricter rules beyond `recommended` — that can be tightened later
- No ESLint for test files beyond what `recommended` already covers (test utilities like `jest.fn()` are handled by TypeScript types, not ESLint)
- No CI/CD integration — deferred to post-MVP
- No pre-commit hooks (e.g., lint-staged, husky) — deferred

### Previous Story Intelligence

**From Story 2.1 code review:**
- The frontend `eslint.config.mjs` was updated during the review to exclude `coverage/**` from linting (the direct trigger for this story)
- `eslint-config-next` uses `defineConfig` and `globalIgnores` from `"eslint/config"` — the backend/shared configs do NOT need these Next.js-specific imports; use `typescript-eslint`'s `config()` helper instead

**From Story 1.1 (scaffolding):**
- The monorepo uses npm workspaces; install dependencies with `-w packages/<name>`
- Root scripts use `npm run <script> -w packages/<name>` to target individual packages

### Project Structure Notes

**Files CREATED:**
```
packages/backend/eslint.config.mjs    (NEW — ESLint flat config)
packages/shared/eslint.config.mjs     (NEW — ESLint flat config)
```

**Files MODIFIED:**
```
packages/backend/package.json          (add lint script + eslint devDeps)
packages/shared/package.json           (add lint script + eslint devDeps)
package.json                           (update root lint script)
package-lock.json                      (auto-generated)
```

### References

- [Source: architecture.md#Implementation Patterns & Consistency Rules] — naming conventions, enforcement rules
- [Source: project-context.md#Definition of Done] — lint must pass with 0 errors
- [Source: architecture.md#Starter Template Evaluation] — npm workspaces monorepo setup

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
