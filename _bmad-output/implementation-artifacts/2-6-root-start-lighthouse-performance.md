# Story 2.6: Root production start & Lighthouse performance gates

Status: backlog

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a single root command to run the built backend and frontend together, and Lighthouse audits that include performance against the production build,
So that local verification matches how users experience the app and CI can enforce performance without relying on the dev server.

## Acceptance Criteria

1. **Given** a clean machine state after `npm run build` **When** `npm run start` is run from the repository root **Then** both the backend (`node` on compiled output) and the frontend (`next start`) start together (e.g. via the same workspace pattern as root `dev`) and the app is usable at `http://localhost:3000` with the API reachable at the default port (`3001` unless overridden by env).

2. **Given** root `package.json` **When** scripts are inspected **Then** `start` is documented (in README or Dev Notes for implementer) as requiring a prior successful `npm run build` — it does not silently rebuild.

3. **Given** `scripts/lighthouse.js` **When** it is responsible for bringing the app up (no suitable server already listening on the audit URL) **Then** it runs `npm run build` from the repository root **before** starting the production stack, so audits always target artifacts from the current working tree; then it starts the **production** stack (not `npm run dev`), waits for `http://localhost:3000`, runs audits, then stops the stack it started (without killing unrelated processes where feasible).

4. **Given** a Lighthouse run **When** scores are collected **Then** the **performance** category is included alongside accessibility, best-practices, and SEO for both Desktop and Mobile audit configurations.

5. **Given** Lighthouse performance scores on the production build **When** the gate is implemented **Then** the **target** performance threshold is **100** (parity with other categories). **If** stable scores at 100 are not achievable on Desktop and/or Mobile within this story, **then** the implementer may **lower** the enforced floor as part of the same development work, documents the chosen value(s) and reason (e.g. environment noise, framework baseline) in this file’s Dev Agent Record and in a short comment next to the constant, and the script exits non-zero only when scores fall below that agreed floor.

6. **Given** existing non-performance gates **When** Lighthouse finishes **Then** accessibility, best-practices, and SEO still must meet the current required threshold (100) unless this story explicitly documents a negotiated change (default: keep 100).

7. **Given** `README.md` (or project-context DoD section if that is the canonical developer entrypoint) **When** updated **Then** it mentions `npm run start` for running built packages and states that `npm run test:lighthouse` runs a fresh root `npm run build` then audits that production build (unless documented exception, e.g. pre-existing server — see Dev Notes).

## Tasks / Subtasks

- [ ] Task 1: Root `start` script (AC: #1, #2)
  - [ ] 1.1 Add root `package.json` script mirroring `dev`: run `start` in `packages/backend` and `packages/frontend` via `concurrently` (same style as existing `dev` line).
  - [ ] 1.2 Verify after `npm run build` that todos load and mutations work against default ports.
  - [ ] 1.3 Document the build-then-start sequence in README (and adjust project-context DoD if it references only dev for Lighthouse).

- [ ] Task 2: Lighthouse uses production stack + performance category (AC: #3, #4, #5, #6)
  - [ ] 2.1 When the script owns the server lifecycle: run root `npm run build` (blocking, inherit stdio so failures surface), then change startup from `npm run dev` to `npm run start`; extend cleanup to terminate production processes (e.g. `next start`, backend `node dist/...`) in addition to or instead of dev-only `pkill` patterns — avoid overly broad kills.
  - [ ] 2.2 Add `performance` to audited categories and to score parsing / console output.
  - [ ] 2.3 Run `npm run test:lighthouse` locally (with full permissions / headless Chrome as today) — build is expected to run inside that flow — aim for a **performance** threshold of **100**; if that is not realistically achievable, adjust the constant(s) during this story and record baseline scores plus rationale in the Dev Agent Record.
  - [ ] 2.4 Keep accessibility / best-practices / SEO at required 100 unless review explicitly lowers them.

- [ ] Task 3: Definition of Done alignment (AC: #7)
  - [ ] 3.1 Update any story DoD bullets that still say Lighthouse runs only against dev or omit performance.
  - [ ] 3.2 Run full existing checks: `npm run lint`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run test:lighthouse`.

## Dev Notes

### Current state (pre-story)

- Root `package.json` has `dev` and `build` but no aggregated `start`.
- `packages/backend` has `"start": "node dist/index.js"`; `packages/frontend` has `"start": "next start"`.
- `scripts/lighthouse.js` starts `npm run dev`, audits only `accessibility`, `best-practices`, `seo`, and uses `REQUIRED_SCORE = 100` for those categories.

### Implementation hints

- **Env:** Client bundle uses `NEXT_PUBLIC_API_URL` (see `packages/frontend/src/lib/api.ts`); default `http://localhost:3001` matches backend `PORT` default — no change required for local prod start unless ports differ in CI later.
- **Performance threshold:** Default target is **100**. Try to meet it (including reasonable app or config tweaks in this story). If not achievable, lower the enforced minimum in code, document why in the Dev Agent Record and beside the constant; the constant in code is the source of truth for CI.
- **“Server already running” branch:** If port 3000 is already up, document behavior (skip start vs fail fast). Prefer matching current script semantics: if pre-existing server, audit without start/stop and log a **prominent** warning that scores may not match the current tree (no rebuild/restart was performed). Optionally still run `npm run build` to surface compile errors early even when not restarting the server — story implementer chooses; if build runs, note in README that it does not hot-swap the already-running process.

### What this story does NOT include

- Docker or process managers (pm2, etc.).
- Changing Lighthouse to a different runner (e.g. LHCI) — out of scope unless trivial.
- Open-ended performance work beyond what’s needed to meet the enforced floor (whether that floor stays at 100 or is adjusted during this story).

### References

- `package.json` (root scripts)
- `scripts/lighthouse.js`
- `packages/frontend/src/lib/api.ts` (API URL env)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
