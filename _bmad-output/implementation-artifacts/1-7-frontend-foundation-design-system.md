# Story 1.7: Frontend Foundation & Design System

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see a polished, responsive page when I open the app,
So that I know the application is working and well-crafted.

## Acceptance Criteria

1. **Given** a fresh Next.js project **When** the default create-next-app starter template UI is removed **Then** the page renders a simple "Hello World" message within the styled layout

2. **Given** the page renders **When** viewed in a browser **Then** the Outfit font is loaded and applied from Google Fonts (Latin subset only)

3. **Given** the globals.css file **When** inspected **Then** CSS custom properties are defined for: colors (background, surface, text primary/secondary/placeholder, accent, error, success), shadows (resting, hover, focus), spacing (8px base multiples), border radii, and motion tokens (durations: fast 150ms, normal 250ms, slow 400ms, shake 300ms; easings: ease-out, ease-in, ease-in-out)

4. **Given** the responsive layout **When** viewed at mobile (320px), tablet (768px), and desktop (1024px) widths **Then** a centered narrow column (max-width ~600-640px) is displayed with appropriate padding at each breakpoint

5. **Given** the root layout **When** the page loads **Then** proper HTML metadata (title, description, viewport) and semantic landmarks (`<main>`) are present

6. **Given** Tailwind CSS and shadcn/ui **When** the project builds **Then** both are correctly configured with zero build errors

7. **Given** the no-title design principle **When** the page loads **Then** no app heading or title is rendered — just the "Hello World" within the responsive column

## Tasks / Subtasks

- [x] Task 1: Replace Geist fonts with Outfit in layout.tsx (AC: #2, #5)
  - [x] 1.1 Replace `Geist` and `Geist_Mono` imports with `Outfit` from `next/font/google`
  - [x] 1.2 Configure Outfit with `subsets: ["latin"]`, `display: "swap"`, and `variable: "--font-outfit"`
  - [x] 1.3 Update the `<html>` and `<body>` class to use the Outfit variable
  - [x] 1.4 Update metadata: title → "todo-bmad", description → "A minimal, polished todo app"
  - [x] 1.5 Ensure `<body>` has `antialiased` class for smooth font rendering

- [x] Task 2: Create the complete design token system in globals.css (AC: #3)
  - [x] 2.1 Remove the default create-next-app CSS (dark mode media query, default variables)
  - [x] 2.2 Define `:root` CSS custom properties for the warm color palette:
    - `--color-background`: warm off-white with cream undertone
    - `--color-surface`: slightly warmer shade for cards
    - `--color-text-primary`: warm charcoal
    - `--color-text-secondary`: medium warm gray (timestamps, metadata)
    - `--color-text-placeholder`: lighter warm gray
    - `--color-accent`: warm amber
    - `--color-error`: warm but noticeable error tone
    - `--color-success`: muted warm success tone
  - [x] 2.3 Define shadow tokens:
    - `--shadow-resting`: default card shadow
    - `--shadow-hover`: deeper shadow with lift (desktop only)
    - `--shadow-focus`: accent-colored ring
  - [x] 2.4 Define spacing tokens using 8px base:
    - `--spacing-1` through `--spacing-8` (8, 16, 24, 32, 40, 48, 56, 64)
  - [x] 2.5 Define border radius tokens:
    - `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-checkbox` (8px for rounded square checkbox)
  - [x] 2.6 Define motion tokens:
    - Durations: `--duration-fast: 150ms`, `--duration-normal: 250ms`, `--duration-slow: 400ms`, `--duration-shake: 300ms`
    - Easings: `--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1)`, `--ease-in: cubic-bezier(0.4, 0.0, 1, 1)`, `--ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1)`
  - [x] 2.7 Update the `@theme inline` block to register tokens with Tailwind v4 so utility classes are generated
  - [x] 2.8 Add `prefers-reduced-motion` media query foundation (setting durations to 0ms or minimal)
  - [x] 2.9 Apply `body` base styles using the design tokens (background, color, font-family)

- [x] Task 3: Implement responsive centered column layout (AC: #4, #7)
  - [x] 3.1 Update `page.tsx`: remove `<h1>` heading, render "Hello World" as plain text within the responsive column — no heading tag per the no-title design principle
  - [x] 3.2 Apply centered column container: max-width ~640px, auto horizontal margin
  - [x] 3.3 Mobile (base 320px+): full-width with 16-24px horizontal padding
  - [x] 3.4 Tablet (768px+): wider padding
  - [x] 3.5 Desktop (1024px+): centered with natural margins
  - [x] 3.6 Ensure the layout wraps content in a semantic `<main>` element

- [x] Task 4: Verify Tailwind CSS and shadcn/ui configuration (AC: #6)
  - [x] 4.1 Confirm `postcss.config.mjs` uses `@tailwindcss/postcss`
  - [x] 4.2 Confirm `components.json` (shadcn/ui) is properly configured with aliases
  - [x] 4.3 Confirm `src/lib/utils.ts` has the `cn()` helper (already exists)
  - [x] 4.4 Verify `@import "tailwindcss"` is present in globals.css
  - [x] 4.5 Ensure `@theme inline` block registers design tokens for Tailwind utility generation

- [x] Task 5: Verify all checks pass (run from project root)
  - [x] 5.1 Run `npm run dev` — dev server starts cleanly
  - [x] 5.2 Run `npm run test` — all tests pass (37 backend + 0 frontend, --passWithNoTests)
  - [x] 5.3 Run `npm run build` — production build completes with zero errors
  - [x] 5.4 Run `npm run test:e2e` — E2E tests pass (page loads, renders "Hello World")

## Dev Notes

### Architecture Compliance

This is the **first frontend story**. All previous stories (1.1–1.6) were backend and shared package work. The frontend currently has default create-next-app boilerplate that must be replaced with the project's design system foundation.

**Critical constraints:**
- Use the `Outfit` font — NOT Geist (the create-next-app default). Load via `next/font/google` with `subsets: ["latin"]` for performance.
- CSS custom properties for ALL design tokens — Tailwind v4 registers these via `@theme inline` to generate utility classes.
- No app heading/title rendered — the "no-title design" principle means the input field (Story 1.9) will be the visual anchor. For now, just render "Hello World" as plain text.
- Named exports only (Enforcement Rule #2) — EXCEPT `page.tsx` and `layout.tsx` which require `export default` per Next.js convention.
- Use `@/` import alias for all project-relative imports (Enforcement Rule #10).

[Source: architecture.md#Implementation Patterns & Consistency Rules, architecture.md#Enforcement Rules]

### Current Frontend State

The frontend was scaffolded by `create-next-app` in Story 1.1 and has NOT been modified since. Current state:

**Files that exist:**
- `src/app/layout.tsx` — Uses Geist/Geist_Mono fonts, default metadata ("Create Next App")
- `src/app/page.tsx` — Renders `<main><h1>Hello World</h1></main>`
- `src/app/globals.css` — Default create-next-app CSS with Geist font references and dark mode
- `src/lib/utils.ts` — shadcn `cn()` helper (keep as-is)
- `components.json` — shadcn/ui config (keep as-is)
- `postcss.config.mjs` — Tailwind v4 PostCSS plugin (keep as-is)
- `jest.config.js` — Jest config with jsdom and `@/` path mapping (keep as-is)

**Directories that do NOT exist yet:**
- `src/components/` — will be created in Stories 1.8 and 1.9
- `src/components/ui/` — shadcn primitives, will be added when needed
- `src/hooks/` — will be created in Story 1.9
- `src/config/` — will be created in Story 1.9

**E2E test exists** at `e2e/app.spec.ts` — tests that homepage returns HTTP 200 and contains "Hello World". This test MUST continue to pass (the page must still render "Hello World").

[Source: packages/frontend/ filesystem analysis]

### Design Token System — Exact Values

**Warm Color Palette (from UX spec — Warm Depth direction):**

| Token | Purpose | Suggested Value |
|-------|---------|-----------------|
| `--color-background` | Page background — warm off-white, cream undertone | `#faf8f5` or similar |
| `--color-surface` | Card surfaces — slightly warmer | `#ffffff` or similar |
| `--color-text-primary` | Body text — warm charcoal | `#2d2a26` or similar |
| `--color-text-secondary` | Timestamps, metadata — medium warm gray | `#8a8480` or similar |
| `--color-text-placeholder` | Input placeholder — lighter warm gray | `#b5b0ab` or similar |
| `--color-accent` | Warm amber — checkbox, focus ring, submit | `#d4a853` or similar |
| `--color-error` | Error — warm but noticeable | `#c4694a` or similar |
| `--color-success` | Success — muted warm tone | `#7a9a6d` or similar |

The exact hex values should be chosen during implementation to ensure WCAG 2.1 AA contrast compliance: 4.5:1 for normal text against background, 3:1 for large text. Use a contrast checker. The accent color must also have 3:1 contrast for focus indicators.

**Shadow Tokens:**

```css
--shadow-resting: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-hover: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-focus: 0 0 0 3px var(--color-accent);
```

**Spacing (8px base):**

```css
--spacing-1: 0.5rem;   /* 8px */
--spacing-2: 1rem;     /* 16px */
--spacing-3: 1.5rem;   /* 24px */
--spacing-4: 2rem;     /* 32px */
--spacing-5: 2.5rem;   /* 40px */
--spacing-6: 3rem;     /* 48px */
--spacing-7: 3.5rem;   /* 56px */
--spacing-8: 4rem;     /* 64px */
```

**Border Radii:**

```css
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px — also used for checkbox rounded square */
--radius-lg: 0.75rem;   /* 12px — cards */
```

**Motion Tokens (from UX spec):**

```css
--duration-fast: 150ms;    /* hover, opacity, focus ring */
--duration-normal: 250ms;  /* entrance, exit, callout fade */
--duration-slow: 400ms;    /* item migration, skeleton cycle */
--duration-shake: 300ms;   /* error shake animation */
--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);     /* entrances — elements arriving */
--ease-in: cubic-bezier(0.4, 0.0, 1, 1);         /* exits — elements leaving */
--ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);   /* migrations — elements repositioning */
```

[Source: ux-design-specification.md#Animation Consistency, ux-design-specification.md#Color System, ux-design-specification.md#Design System Foundation]

### Tailwind v4 Integration

Tailwind CSS v4 uses `@theme inline` in CSS to register design tokens. This replaces the old `tailwind.config.js`. When you define `--color-accent: #d4a853` inside `@theme inline`, Tailwind automatically generates `bg-accent`, `text-accent`, `border-accent` etc.

**Pattern:**
```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-text-primary: var(--text-primary);
  /* ... more token registrations */
  --font-sans: var(--font-outfit);
}
```

Define raw values in `:root`, then reference them in `@theme inline` to bridge CSS custom properties with Tailwind utilities. This gives you both: direct `var(--color-accent)` access AND Tailwind `bg-accent` utilities.

**Important:** There is no `tailwind.config.ts` file — Tailwind v4 does everything in CSS. The `components.json` references `tailwind.config.ts` but this is fine — shadcn/ui will still work because it reads the CSS-based config.

[Source: Tailwind CSS v4 documentation]

### Responsive Layout Implementation

The responsive centered column uses Tailwind utility classes:

```
Mobile (base):     px-4 (16px) or px-5 (20px) — full width
Tablet (768px+):   px-6 (24px) — wider padding  
Desktop (1024px+): centered with max-w-[640px] mx-auto
```

The `<main>` element wraps all page content as the semantic landmark. The column container sits inside `<main>`.

**Breakpoint behavior:**
- No layout reflow between breakpoints — single column throughout
- Content container has `max-w-[640px]` at all sizes
- Padding adjusts: 16-24px mobile → wider tablet → natural margins desktop

[Source: architecture.md#Frontend Architecture, ux-design-specification.md#Responsive Strategy]

### Next.js Font Configuration

Replace the Geist fonts with Outfit using `next/font/google`:

```typescript
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});
```

The `variable` option creates a CSS custom property `--font-outfit` that Tailwind v4 can consume via `@theme inline { --font-sans: var(--font-outfit); }`. The `display: "swap"` prevents invisible text during font load, supporting Lighthouse FCP targets.

Outfit is a **variable font** — no need to specify individual weights. All weights (100–900) are included automatically.

[Source: Next.js 16 documentation, ux-design-specification.md#Typography System]

### What This Story Does NOT Include

- No React components beyond the basic page (TodoInput, TodoItem etc. are Stories 1.8–1.9)
- No API client or data fetching
- No `useTodos` hook
- No ISR/server component data fetching (Story 1.8)
- No animation implementations (just motion token definitions)
- No dark mode implementation (just CSS custom property structure)
- No `src/components/ui/` shadcn primitives yet (will be added when needed)
- No unit tests for this story (no testable component logic — build verification only)

### Anti-Patterns to Avoid

- **Do NOT keep the Geist fonts** — replace entirely with Outfit
- **Do NOT keep the dark mode media query** from default create-next-app globals.css
- **Do NOT render an `<h1>` heading** — the no-title design principle means no app heading. Render "Hello World" as a `<p>` or text node within the layout
- **Do NOT create a `tailwind.config.ts`** — Tailwind v4 uses CSS-based configuration
- **Do NOT hardcode colors in components** — use CSS custom properties everywhere
- **Do NOT use Geist font CSS variables** (--font-geist-sans, --font-geist-mono) anywhere
- **Do NOT add components or hooks** — this story is layout and design system only
- **Do NOT modify any backend files** — frontend only
- **Do NOT break the existing E2E test** — page must still render "Hello World"

### Previous Story Intelligence

**From Story 1.6 (done):**
- All backend CRUD routes are complete (GET, POST, PATCH, DELETE)
- 37 tests pass across backend + shared packages
- E2E tests check for "Hello World" text on the homepage — MUST preserve this text
- E2E tests: 2 tests (HTTP 200, contains "Hello World")

**From Story 1.1 (done):**
- Monorepo scaffolded with npm workspaces
- Frontend created via `create-next-app` with TypeScript, Tailwind, ESLint, App Router, src directory
- shadcn/ui initialized (`components.json`, `cn()` utility, dependencies installed)
- `@todo-bmad/shared` workspace dependency configured
- Jest configured with jsdom environment and `@/` path mapping

### Git Intelligence

Recent commits show a pattern of backend-focused PRs (stories 1.1–1.6). This is the first frontend-focused story. All commits follow the `feat/{story-key}` branch naming convention and are merged via PR.

**Branch to create:** `feat/1-7-frontend-foundation-design-system`

### Naming Conventions (Enforced)

| Context | Convention | Example |
|---------|-----------|---------|
| TypeScript files | kebab-case | `globals.css`, `layout.tsx` |
| CSS custom properties | kebab-case with category prefix | `--color-accent`, `--shadow-resting`, `--duration-normal` |
| Exports | Named only (except Next.js page/layout) | `export default function RootLayout` |
| Imports | `@/` alias for project-relative | `import { cn } from "@/lib/utils"` |

### Project Structure Notes

```
packages/frontend/src/
├── app/
│   ├── layout.tsx       (MODIFIED — Outfit font, metadata, semantic HTML)
│   ├── page.tsx         (MODIFIED — remove heading, styled "Hello World" in responsive column)
│   └── globals.css      (MODIFIED — complete design token system, Tailwind v4 theme)
├── lib/
│   └── utils.ts         (UNCHANGED — shadcn cn() helper)
```

Only 3 files are modified. No new files. No new directories.

### References

- [Source: architecture.md#Frontend Architecture] — component structure, file locations
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — naming, enforcement rules
- [Source: architecture.md#Starter Template Evaluation] — Next.js 16, Tailwind v4, shadcn/ui setup
- [Source: ux-design-specification.md#Visual Design Foundation] — color system, typography, spacing
- [Source: ux-design-specification.md#Design Direction Decision] — Warm Depth direction, Outfit font
- [Source: ux-design-specification.md#Animation Consistency] — motion token values
- [Source: ux-design-specification.md#Responsive Design & Accessibility] — breakpoints, responsive strategy
- [Source: ux-design-specification.md#Defining Interaction] — no-title design principle
- [Source: epics.md#Story 1.7] — acceptance criteria
- [Source: project-context.md] — git branching, definition of done
- [Source: prd.md#Performance Targets] — Lighthouse 90+, FCP <1s, LCP <1.5s

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Debug Log References

No issues encountered. Implementation was straightforward.

### Completion Notes List

- Replaced Geist/Geist_Mono font imports with Outfit from next/font/google using `subsets: ["latin"]`, `display: "swap"`, `variable: "--font-outfit"`.
- Updated metadata title to "todo-bmad" and description to "A minimal, polished todo app".
- Removed all default create-next-app CSS from globals.css, replaced with full warm-depth design token system in `:root`.
- Defined all color, shadow, spacing, radius, and motion tokens per UX spec.
- Added `@theme inline` block to bridge CSS custom properties with Tailwind v4 utility classes.
- Added `prefers-reduced-motion` media query setting all durations to 0ms.
- Replaced `<h1>Hello World</h1>` with plain text "Hello World" inside responsive centered column using `max-w-[640px] mx-auto` with `px-4 md:px-6` padding.
- Verified postcss.config.mjs, components.json, and src/lib/utils.ts are correct — no changes needed.
- Chose `--color-accent: #c49a3c` (darker amber) to meet WCAG 2.1 AA 3:1 contrast ratio for focus indicators against the `#faf8f5` background.
- All 37 tests pass, build succeeds, 2 E2E tests pass.

### File List

packages/frontend/src/app/layout.tsx
packages/frontend/src/app/page.tsx
packages/frontend/src/app/globals.css

## Change Log

- 2026-03-17: Implemented frontend foundation and design system (Story 1.7) — replaced Geist fonts with Outfit, established warm-depth design token system in globals.css (colors, shadows, spacing, radii, motion), removed default create-next-app boilerplate, implemented responsive centered column layout.
