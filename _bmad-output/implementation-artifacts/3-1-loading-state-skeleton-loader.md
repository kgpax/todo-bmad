# Story 3.1: Loading State & Skeleton Loader

Status: cancelled

## Cancellation Summary

**Cancelled 2026-03-20** — React Suspense streaming via `loading.tsx` was implemented and tested. It improved FCP (~1.7 s → ~0.8 s) but caused an LCP regression (consistent ~1.7 s → variable 1.7–2.4 s), dropping desktop Lighthouse performance from a stable 93–94 to 87–93 and failing the enforced 90 floor in ~70% of runs. The two-phase streaming render introduced V8 JIT and CPU scheduler variability that made LCP unreliable.

Kevin decided the performance regression was not acceptable: the skeleton loader did not offer enough user value to justify a consistently slower LCP. All implementation was fully reverted. The `loading.tsx` streaming approach is recorded as a rejected architectural decision in `project-context.md`.

**Downstream impact:** Stories 3-3 (Initial Load Error) and 3-4 (Graceful Degradation) reference the SkeletonLoader and `loading.tsx`. These stories need their approaches revisited — the SkeletonLoader component may still be useful in client-side error/retry flows, but the `loading.tsx` Suspense boundary mechanism is off the table. See the ADR in `project-context.md` for details.

## Story

As a user,
I want to see a calm, composed loading state while my todos are being fetched,
So that I know my data is on its way and the app feels alive rather than frozen.

## Acceptance Criteria

1. **Given** the initial page load **When** the server-side API fetch takes any perceptible time **Then** a SkeletonLoader component is displayed in the list area while the page streams.

2. **Given** the SkeletonLoader **When** displayed **Then** it shows 3-4 placeholder rows mimicking TodoItem layout (rounded rectangle for checkbox area + wider rectangle for text area).

3. **Given** the SkeletonLoader **When** animating **Then** it displays a slow breathing pulse animation (~2.5s opacity oscillation cycle).

4. **Given** a user with `prefers-reduced-motion` enabled **When** the SkeletonLoader is displayed **Then** it shows a static low-opacity state instead of the breathing pulse.

5. **Given** the list container **When** the SkeletonLoader is active **Then** `aria-busy="true"` is set on the list container with an `aria-label` indicating loading state.

6. **Given** the API fetch completes successfully **When** data arrives **Then** the SkeletonLoader is replaced by the real todo list content (React Suspense streaming swap).

7. **Given** the SkeletonLoader component **When** unit tests are run **Then** tests pass for render output, pulse animation class, reduced-motion variant, and ARIA attributes.

8. **Given** E2E test for loading state **When** the API response is delayed **Then** the skeleton loader appears, and once data arrives, real content replaces it.

9. **Given** streaming is now enabled via `loading.tsx` **When** Lighthouse performance scores are run at least 3 times and consistently exceed the current floor of 90 **Then** the enforced `REQUIRED_PERFORMANCE_SCORE` in `scripts/lighthouse.js` is raised to match the stable baseline and `project-context.md` is updated accordingly.

## Tasks / Subtasks

- [ ] Task 1: Create SkeletonLoader component (AC: #2, #3, #4, #5)
  - [ ] 1.1 Create `packages/frontend/src/components/skeleton-loader.tsx` with 3-4 skeleton rows matching TodoItem card layout
  - [ ] 1.2 Add `@keyframes skeleton-pulse` to `globals.css` for breathing animation (~2.5s opacity oscillation cycle)
  - [ ] 1.3 Apply `prefers-reduced-motion` handling — static low-opacity state, no animation
  - [ ] 1.4 Add `aria-busy="true"` and `aria-label="Loading todos"` to the skeleton list container
  - [ ] 1.5 Each skeleton row: card with `--shadow-resting`, `--radius-lg` (12px), checkbox placeholder (rounded rect ~20x20px with `--radius-checkbox`), text placeholder (wider rounded rect), matching TodoItem spacing (`p-4`, `gap-3`)

- [ ] Task 2: Create `loading.tsx` route file (AC: #1, #6)
  - [ ] 2.1 Create `packages/frontend/src/app/loading.tsx` as a server component that renders `<SkeletonLoader />` wrapped in the same layout shell as `page.tsx` (`<main>` + centered `max-w-[640px]` column + padding matching page.tsx)
  - [ ] 2.2 Include the TodoInput placeholder skeleton above the list skeleton to match the full page layout
  - [ ] 2.3 Verify that adding `loading.tsx` creates the Suspense boundary that enables streaming — the skeleton should appear immediately while `page.tsx` awaits `fetchTodos()`

- [ ] Task 3: Unit tests for SkeletonLoader (AC: #7)
  - [ ] 3.1 Create `packages/frontend/src/components/skeleton-loader.test.tsx`
  - [ ] 3.2 Test: renders correct number of skeleton rows (3-4)
  - [ ] 3.3 Test: each row has expected structure (checkbox placeholder + text placeholder)
  - [ ] 3.4 Test: container has `aria-busy="true"` and `aria-label="Loading todos"`
  - [ ] 3.5 Test: container has `role="list"` for consistency with real list
  - [ ] 3.6 Test: skeleton rows have `data-testid` attributes for E2E targeting
  - [ ] 3.7 100% coverage — no untested branches

- [ ] Task 4: E2E test for loading state (AC: #8)
  - [ ] 4.1 Add skeleton-related locators and methods to `e2e/pages/todo-page.ts` POM
  - [ ] 4.2 Add a test case (in an appropriate journey spec or a new spec) that delays the API response and verifies skeleton appears, then real content replaces it
  - [ ] 4.3 Verify `aria-busy` transitions from `true` to absent/false when content loads

- [ ] Task 5: Lighthouse threshold increase (AC: #9)
  - [ ] 5.1 Run `npm run test:lighthouse` at least 3 times after streaming is working
  - [ ] 5.2 If desktop performance consistently exceeds 90 (e.g., stable at 95+ or 100), raise `REQUIRED_PERFORMANCE_SCORE` in `scripts/lighthouse.js`
  - [ ] 5.3 Update performance thresholds documented in `project-context.md` to match the new floor
  - [ ] 5.4 Record before/after scores and rationale in Dev Agent Record

- [ ] Task 6: Definition of Done verification
  - [ ] 6.1 `npm run lint` — 0 errors
  - [ ] 6.2 `npm run build` — clean build
  - [ ] 6.3 `npm run test` — all pass, 100% coverage maintained
  - [ ] 6.4 `npm run test:e2e` — all pass (with `required_permissions: ["all"]`)
  - [ ] 6.5 `npm run test:lighthouse` — all scores meet thresholds (with `required_permissions: ["all"]`), including any raised performance floor from Task 5.

## Dev Notes

### Critical Architecture Context

**This story enables React Suspense streaming**, which is a prerequisite for improving desktop Lighthouse performance. Story 2-6 documented that desktop LCP is ~1.7s because the dynamic route blocks on the API fetch before sending any HTML. Adding `loading.tsx` wraps the page in a `<Suspense>` boundary, allowing Next.js to:
1. Send the static shell (layout, fonts, CSS, skeleton) immediately
2. Stream the actual page content once `fetchTodos()` resolves

This should significantly improve FCP and LCP on desktop.

### Implementation Approach: `loading.tsx`

Next.js App Router's `loading.tsx` file convention automatically creates a Suspense boundary around the `page.tsx` content. When placed in `app/loading.tsx`:

```
// Next.js internally does:
<Layout>
  <Suspense fallback={<Loading />}>
    <Page />
  </Suspense>
</Layout>
```

The `loading.tsx` is a **server component** by default. It should render the full page skeleton including both the input area skeleton and the list skeleton, wrapped in the same layout structure as `page.tsx`.

**`loading.tsx` must replicate the outer `<main>` + centered column structure from `page.tsx`** so the skeleton visually matches the real page. Specifically:
```tsx
<main className="min-h-screen px-4 md:px-6">
  <div className="max-w-[640px] mx-auto">
    <div className="pt-8 md:pt-12 lg:pt-16 flex flex-col gap-4">
      {/* Input skeleton + List skeleton here */}
    </div>
  </div>
</main>
```

### SkeletonLoader Component Design

The skeleton must mimic the TodoItem card layout precisely:

**TodoItem card structure** (from existing `todo-item.tsx`):
- Container: `rounded-xl p-4` with `box-shadow: var(--shadow-resting)`, `bg-surface`
- Layout: flexbox row with `gap-3`, items center-aligned
- Left: Checkbox (~20x20px rounded square with `--radius-checkbox`)
- Center: Text content area (flexible width)
- Right: Delete button area (~16x16px)

**Each skeleton row should have:**
- Same card container: `rounded-xl p-4`, `--shadow-resting`, `bg-surface`
- Checkbox placeholder: `w-5 h-5 rounded-[var(--radius-checkbox)]` with skeleton color
- Text placeholder: `h-4 flex-1 max-w-[70%] rounded-md` with skeleton color (vary widths: 70%, 55%, 80%, 60% to look natural)
- Timestamp placeholder: `h-3 w-16 rounded-md` with skeleton color

**Skeleton color:** Use `var(--color-text-placeholder)` at ~20% opacity for the placeholder shapes. This maintains the warm palette.

**Input skeleton:** Above the list, render a skeleton matching the TodoInput card: same `rounded-xl p-4 md:p-5` with `--shadow-resting`, containing a single wide placeholder bar.

### Animation: Breathing Pulse

**Keyframes** (add to `globals.css`):
```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}
```

**Application:** Apply `animation: skeleton-pulse 2.5s ease-in-out infinite` to each skeleton placeholder shape. The card containers should NOT pulse — only the gray placeholder bars inside them.

**Reduced motion:** The existing `prefers-reduced-motion` media query in `globals.css` sets all `--duration-*` tokens to 0ms, but the skeleton pulse doesn't use those tokens. Add explicit handling:
```css
@media (prefers-reduced-motion: reduce) {
  .skeleton-pulse {
    animation: none;
    opacity: 0.3;
  }
}
```

### ARIA Attributes

- Skeleton list container: `role="list"`, `aria-busy="true"`, `aria-label="Loading todos"`
- Individual skeleton rows: `role="listitem"` for structural consistency
- When the real content loads (Suspense swap), the `TodoList` component already has `role="list"` and `aria-live="polite"` — no `aria-busy` needed since loading is complete

### Existing Code: Do NOT Modify

- **`todo-page.tsx`**: Receives `initialTodos` as props — no changes needed. The skeleton is handled at the route level by `loading.tsx`, not inside the client component.
- **`use-todos.ts`**: Initializes from `initialTodos` — no changes needed for this story.
- **`todo-list.tsx`**: Already has `role="list"` and `aria-live="polite"` — no changes needed.
- **`page.tsx`**: No changes needed — it continues to be the async server component that fetches data.

### Test Strategy

**Unit tests (`skeleton-loader.test.tsx`):**
- Use `@testing-library/react` with `render()` + `screen` queries
- Test DOM structure: correct number of skeleton rows, presence of placeholder shapes
- Test ARIA: `aria-busy="true"`, `aria-label="Loading todos"`, `role="list"`
- Test animation class presence on placeholder elements
- Do NOT assert on CSS class names (per project-context.md rules) — use `data-` attributes if state needs verification
- Note: Testing `prefers-reduced-motion` in unit tests is tricky. Test that the animation CSS class is applied; the media query behavior is verified visually / via E2E.

**E2E tests:**
- Use the **existing POM pattern** (`e2e/pages/todo-page.ts`)
- Add skeleton locators to the POM (e.g., `getSkeletonLoader()`, `isSkeletonVisible()`)
- To test the loading state, the E2E test needs to **delay the backend API response**. Options:
  - Use Playwright's `page.route()` to intercept the API call and add a delay
  - Or configure the backend with a delay for testing
  - Recommended: `page.route()` is the cleanest approach for E2E
- Verify: skeleton appears → real content replaces it → `aria-busy` is gone

### Performance Impact & Threshold Increase

Adding `loading.tsx` enables streaming, which should:
- **Improve FCP**: The skeleton HTML is sent immediately, not blocked by the API fetch
- **Improve LCP**: If the skeleton elements are the LCP candidates, they arrive faster; if not, the real content still streams sooner than a full-block render
- **Improve desktop Lighthouse score**: Story 2-6 documented desktop at 93-94 due to 1.7s LCP from blocked streaming. This story directly addresses that root cause.

**Lighthouse performance threshold increase:** The current enforced performance floor is **90** (set in Story 2-6 due to desktop LCP blocking). After implementing streaming via `loading.tsx`, run `npm run test:lighthouse` at least **3 times** to establish a stable baseline. If desktop performance scores are **consistently** at or above a higher value (e.g., 95 or 100), **raise `REQUIRED_PERFORMANCE_SCORE` in `scripts/lighthouse.js`** to that stable floor and update the corresponding thresholds documented in `project-context.md`. Record the before/after scores and new threshold in the Dev Agent Record.

### Project Structure Notes

- New files follow the established flat components directory pattern
- `skeleton-loader.tsx` + `skeleton-loader.test.tsx` go in `packages/frontend/src/components/`
- `loading.tsx` goes in `packages/frontend/src/app/` (Next.js file convention)
- Named exports only (except `loading.tsx` which requires `export default` per Next.js convention)
- Use `@/` import alias for project-relative imports

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — component structure, file locations, ISR rendering strategy
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns] — naming conventions, enforcement rules, test placement
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#SkeletonLoader] — 3-4 rows, breathing pulse ~2.5s, reduced-motion variant, aria-busy
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Animation Consistency] — motion tokens, prefers-reduced-motion behavior
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1] — acceptance criteria, BDD scenarios
- [Source: _bmad-output/implementation-artifacts/2-6-root-start-lighthouse-performance.md#Debug Log] — desktop LCP ~1.7s root cause, React Suspense streaming as fix
- [Source: project-context.md#Definition of Done] — lint, build, test, e2e, lighthouse gates, 100% coverage
- [Source: project-context.md#Code Quality Rules] — no CSS class assertions in tests, no suppressHydrationWarning, POM pattern for E2E

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking (2026-03-20)

### Debug Log References

**Attempt 1 — Suspended (2026-03-20): React Suspense streaming causes Lighthouse LCP regression**

Implemented the full story (Tasks 1–5) using `loading.tsx` as specified. Discovered a critical Lighthouse performance regression that caused the story to be abandoned mid-implementation:

- **Approach:** `packages/frontend/src/app/loading.tsx` + `SkeletonLoader` component.
- **FCP result:** Improved from ~1.7 s → ~0.8 s ✅
- **LCP result:** Regressed from consistent ~1.7 s to variable 1.7–2.4 s ❌
- **Desktop Lighthouse score:** Dropped from consistent 93–94 → 87–93 (failing the 90 threshold ~70% of runs).

**Root cause of LCP regression:**

React Suspense streaming creates a two-phase browser render:
1. Phase 1 — Skeleton HTML arrives immediately; browser renders it (FCP at ~0.8 s).
2. Phase 2 — Real content arrives as a streaming chunk after `fetchTodos()` resolves; React processes `$RC()` streaming update and inserts real content into DOM (LCP).

Phase 2 is dominated by JavaScript bundle execution time (React hydration in headless Chrome). V8 JIT + CPU scheduler variability on the local machine caused LCP to range from 1.7 s to 2.4 s across runs. Before streaming, LCP and FCP were the same event (single-phase render), so LCP was consistent at 1.7 s.

**Without** `loading.tsx`: Desktop Lighthouse = 93 consistently.
**With** `loading.tsx`: Desktop Lighthouse = 87–93 (fails ≥90 threshold ~70% of runs).

**Decision:** Kevin decided to abandon the `loading.tsx` streaming approach to preserve the 90 performance floor. The story was fully reverted to a clean state identical to the pre-story baseline.

### Completion Notes List

_Not completed — story reverted. See Debug Log for details._

### File List
