# bmad help request
_Exported on 13/03/2026 at 20:14:44 GMT from Cursor (2.6.19)_

---

**User**

/bmad-help

---

**Cursor**

Now let me check what artifacts already exist to understand where you are in the workflow.

Hey Kevin! Let me assess where you are and recommend next steps.

---

**Current Status:** You have a fresh BMAD project with a requirements document (`requirements/requirements.md`) describing a full-stack Todo application. No planning or implementation artifacts have been generated yet, so you're at the very beginning of the BMM workflow.

---

## Recommended Next Steps

### Phase 1 - Analysis (Optional)

Since this is a straightforward Todo app, Phase 1 is entirely optional. That said, these could still be useful if you want to explore the space first:

- **Brainstorm Project (BP)** -- `bmad-brainstorming`
  Agent: 📊 Mary (Business Analyst)
  Expert-guided facilitation through brainstorming techniques

- **Create Brief (CB)** -- `bmad-bmm-create-product-brief`
  Agent: 📊 Mary (Business Analyst)
  A guided experience to nail down your product idea

Given that you already have a solid requirements document, you can likely skip Phase 1 entirely.

---

### Phase 2 - Planning (Next Required Step)

- **Create PRD (CP)** -- `bmad-bmm-create-prd` **[REQUIRED - Start Here]**
  Agent: 📋 John (Product Manager)
  Expert-led facilitation to produce your Product Requirements Document. Your existing `requirements/requirements.md` provides excellent input for this step.

After the PRD is created, these optional but recommended steps are available:

- **Validate PRD (VP)** -- `bmad-bmm-validate-prd`
  Agent: 📋 John (Product Manager)
  Validate PRD is comprehensive, lean, well-organized, and cohesive

- **Create UX (CU)** -- `bmad-bmm-create-ux-design`
  Agent: 🎨 Sally (UX Designer)
  Guidance through realizing the UX plan -- strongly recommended since a UI is a primary piece of this project

---

### What I Recommend

Since you already have clear requirements, your best path forward is:

1. **Start with** `bmad-bmm-create-prd` to formalize your requirements into a proper PRD. Reference your existing `requirements/requirements.md` as input.
2. Then optionally validate with `bmad-bmm-validate-prd`
3. Then `bmad-bmm-create-ux-design` (recommended for a UI-focused app like this)

Run each workflow in a **fresh context window** for best results. For validation workflows, consider using a different high-quality LLM if available, for an independent perspective.

---

**User**

/bmad-create-prd 

---

**Cursor**

**Create Mode: Creating a new PRD from scratch.**

Let me initialize the workflow. First, checking for existing state and discovering input documents.

Now let me load the PRD template for document setup.

Welcome Kevin! I've analyzed your workspace for the **todo-bmad** PRD workflow. Here's what I found:

**Input Documents Discovered:**

- Product briefs: 0 files (none found)
- Research: 0 files (none found)
- Brainstorming: 0 files (none found)
- Project docs: 0 files (none found -- greenfield project)

**However**, I did discover a requirements file that looks like excellent input material:

- `requirements/requirements.md` -- a detailed product requirements description for the Todo app covering core functionality, frontend/backend expectations, non-functional requirements, and scope boundaries.

Before I set up the PRD workspace and load this as an input document, I want to confirm:

1. **Should I include `requirements/requirements.md` as input?** It contains a solid foundation describing your Todo app vision.
2. **Do you have any other documents** you'd like me to include -- notes, sketches, reference material, anything else?

---

**User**

Yes, please use @requirements/requirements.md.  There is not other documentation.

---

**Cursor**

Let me set up the PRD workspace now.

Your PRD workspace is ready.

**Document Setup:**
- Created: `_bmad-output/planning-artifacts/prd.md` from template
- Initialized frontmatter with workflow state

**Input Documents Loaded:**
- Product briefs: 0 files (none found)
- Research: 0 files (none found)
- Brainstorming: 0 files (none found)
- Project docs: 0 files (none found -- greenfield project)
- Requirements: 1 file -- `requirements/requirements.md` loaded

Your requirements document provides a strong starting point -- it covers the product vision, core user interactions, frontend/backend expectations, non-functional requirements, and explicit scope boundaries. We'll build on all of that in the discovery phase.

---

**[C] Continue** -- Save this and move to Project Discovery (Step 2 of 11)

---

**User**

c

---

**Cursor**

**Progress: Step 2 of 13** -- Project Discovery

From Step 1, I have loaded:
- Product briefs: 0
- Research: 0
- Brainstorming: 0
- Project docs: 0
- Requirements: 1 (`requirements/requirements.md`)

This is a greenfield project -- I'll help you define the full product vision.

---

I've read through your requirements document and have a solid picture of what you're building. Let me share what I'm seeing:

You're describing a **full-stack web application** -- a single-page Todo app with a responsive frontend, a backend API for persistence, and CRUD operations on tasks. The signals are clear: browser-based, SPA-like behavior with instant UI updates, responsive across desktop and mobile, and a well-defined REST-style API behind it.

Domain-wise, this falls squarely into **general productivity/task management** -- no regulated industries, no compliance concerns, no special domain knowledge required. It's deliberately minimal by design, which is a strength.

Complexity is **low** -- standard requirements, basic security considerations, and a focus on user experience and performance. Your requirements document is already very clear about what's in scope and what's explicitly deferred.

Here's my proposed classification:

- **Project Type:** Web App (full-stack SPA with backend API)
- **Domain:** General (productivity/task management)
- **Complexity:** Low
- **Project Context:** Greenfield

Does that match how you see it, or would you adjust anything?

---

**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Product Vision (Step 2b of 13)

---

**User**

I'd like it to be an SSG app rather than an SPA

---

**Cursor**

Good call. So you're thinking a **statically generated site** rather than a client-side SPA -- something like a Next.js, Astro, or similar framework where pages are pre-rendered, with the dynamic todo interactions handled client-side as needed?

That shifts a few things:
- The initial page load would be a pre-rendered static page rather than a JavaScript-bootstrapped shell
- SEO and performance get a boost out of the box
- The dynamic CRUD interactions would still happen client-side against the backend API, but the app shell itself is static

Let me update the classification:

- **Project Type:** Web App (SSG with backend API)
- **Domain:** General (productivity/task management)
- **Complexity:** Low
- **Project Context:** Greenfield

Does that capture it, or is there more nuance to how you're thinking about the SSG approach?

---

**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Product Vision (Step 2b of 13)

---

**User**

C

---

**Cursor**

**Progress: Step 2b of 13** -- Product Vision Discovery

We've established this is a **Web App (SSG with backend API)** in the **general productivity/task management** domain with **low complexity**. Now let's explore what makes this product special.

Your requirements doc paints a picture of deliberate minimalism -- a Todo app that "feels like a complete, usable product despite its deliberately minimal scope." I'd like to dig into that a bit more so I can understand the vision behind the product.

A few questions to help me get there:

- **What's the real goal here?** Is this primarily a learning/portfolio project to demonstrate full-stack skills, a personal productivity tool you actually want to use daily, or something else entirely?

- **What would make this feel "right"?** You mention users should be able to interact without any onboarding or explanation. What does that ideal first-30-seconds experience look like to you?

- **Why a Todo app specifically, and why now?** There are thousands of them out there -- what's driving you to build this one?

---

**User**

My goal here is to build a minimal but functional application to test the workflow of bmad.  I'd like the app to be functionally lean, visually elegant and extremely intuitive to users.

---

**Cursor**

That's a really clear framing. So the Todo app is essentially the vehicle -- the real purpose is putting the BMAD workflow through its paces end-to-end. The app itself should be a clean, polished artifact that demonstrates what comes out the other side of that process.

What I'm hearing:

- **Vision:** Build a lean, elegant Todo app as a proving ground for the BMAD methodology. The product should be simple enough to not get lost in feature complexity, but real enough to exercise every phase of the workflow meaningfully.

- **What Makes It Special:** It's not trying to compete with other Todo apps. The differentiator is craftsmanship within constraints -- functionally minimal, visually polished, and so intuitive it requires zero explanation. Quality over quantity.

- **Core Insight:** A deliberately small scope lets you focus on execution quality at every layer -- clean architecture, elegant UI, smooth interactions -- rather than getting bogged down in feature debates. The simplicity is the point.

Does that capture it, or is there anything I'm missing about what you're after?

---

**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Executive Summary (Step 2c of 13)

---

**User**

Yep, that sounds good

---

**Cursor**

**Progress: Step 2c of 13** -- Executive Summary Generation

Based on our classification and vision discovery, here's the Executive Summary I've drafted. Please review and let me know if you'd like any changes:

---

## Executive Summary

A full-stack Todo application designed as a lean, functional proving ground for the BMAD methodology. The product targets a single user managing personal tasks through a statically generated web interface backed by a persistent API. The scope is deliberately minimal -- create, view, complete, and delete tasks -- to keep focus on execution quality rather than feature breadth. Every interaction should be immediately understandable, with zero onboarding required.

### What Makes This Special

This isn't competing with existing Todo apps. The value lies in craftsmanship within tight constraints: a functionally lean surface with visually elegant presentation and effortless usability. The core insight is that a small, well-defined scope enables high quality at every layer -- clean architecture, polished UI, smooth interactions -- without getting lost in feature complexity. Success means the app feels like a complete, finished product despite its intentionally narrow feature set.

## Project Classification

- **Project Type:** Web App -- statically generated frontend (SSG) with a backend API for data persistence
- **Domain:** General productivity / task management
- **Complexity:** Low -- standard requirements, no regulatory or compliance concerns
- **Project Context:** Greenfield -- new product built from scratch

---

Review the content above and let me know what you'd like to do.

**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Success Criteria (Step 3 of 13)

---

**User**

a

---

**Cursor**

**Advanced Elicitation Options**
*Applying to: Executive Summary section*

I've analyzed the context -- a lean Executive Summary for a minimal todo app focused on craftsmanship. Here are 5 methods suited to sharpening this content:

Choose a number (1-5), [r] to Reshuffle, [a] List All, or [x] to Proceed:

1. **Critique and Refine** -- Systematic review to identify strengths and weaknesses, then improve. Standard quality check for a first draft.
2. **Occam's Razor Application** -- Find the simplest sufficient expression by eliminating unnecessary complexity. Fitting for a product that prizes leanness.
3. **User Persona Focus Group** -- Gather user personas to react to the summary and surface unmet needs or misaligned messaging.
4. **First Principles Analysis** -- Strip away assumptions and rebuild from fundamental truths. Good for ensuring nothing is taken for granted.
5. **Cross-Functional War Room** -- PM + engineer + designer tackle the summary together, revealing trade-offs between feasibility, desirability, and viability.

**r.** Reshuffle the list with 5 new options
**a.** List all methods with descriptions
**x.** Proceed / No Further Actions

---

**User**

x

---

**Cursor**

Returning to the Executive Summary step. Here's the current content for your approval:

---

## Executive Summary

A full-stack Todo application designed as a lean, functional proving ground for the BMAD methodology. The product targets a single user managing personal tasks through a statically generated web interface backed by a persistent API. The scope is deliberately minimal -- create, view, complete, and delete tasks -- to keep focus on execution quality rather than feature breadth. Every interaction should be immediately understandable, with zero onboarding required.

### What Makes This Special

This isn't competing with existing Todo apps. The value lies in craftsmanship within tight constraints: a functionally lean surface with visually elegant presentation and effortless usability. The core insight is that a small, well-defined scope enables high quality at every layer -- clean architecture, polished UI, smooth interactions -- without getting lost in feature complexity. Success means the app feels like a complete, finished product despite its intentionally narrow feature set.

## Project Classification

- **Project Type:** Web App -- statically generated frontend (SSG) with a backend API for data persistence
- **Domain:** General productivity / task management
- **Complexity:** Low -- standard requirements, no regulatory or compliance concerns
- **Project Context:** Greenfield -- new product built from scratch

---

**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Success Criteria (Step 3 of 13)

---

**User**

c

---

**Cursor**

**Progress: Step 3 of 13** -- Success Criteria Definition

Your requirements document already mentions a few success indicators -- the ability to complete core task-management actions without guidance, stability across refreshes and sessions, and clarity of the overall user experience. That's a solid start.

Let me dig deeper on a few fronts:

**User Success:**
You've said "zero onboarding" and "immediately understandable." Let me push on that -- what does a successful 30-second experience look like specifically? For instance:
- User opens the app, adds a todo, and completes it -- all within the first minute, with no confusion?
- Is there a specific emotional response you're targeting? "This just works" simplicity? Delight at the visual polish?

**Business/Project Success:**
Since this is primarily a BMAD workflow test, success here is a bit different from a typical product. What would make you say the *project itself* succeeded?
- The BMAD process produced a clean, implementable set of artifacts?
- The finished app actually runs, looks good, and works end-to-end?
- Something else?

**Technical Success:**
Your requirements mention "interactions should feel instantaneous." How would you think about technical quality?
- Page loads under a certain threshold?
- Clean, maintainable codebase that a developer could pick up easily?
- Test coverage or deployment readiness?

What resonates, and what would you add or adjust?

---

**User**

I want users to be able to use this to quickly and intuitively make todos without having to overthink anything, without having to wonder what to do next or where to start.

Don't overfocus on the BMAD objective... please instead focus on the outcome being a lean, intuitive and responsive todo application that users can easily and quickly make use of.

I'm looking for the app to be highly responsive - page load and interaction times to be < 1s, measuring against lighthouse scores.  Accessibility must be a first class consideration.  The whole app should be fully tested with unit, integration and E2E tests offering at least 80% coverage.

---

**Cursor**

Good direction -- keeping the focus squarely on the product. Here's what I'm hearing distilled into success criteria and scope. Review this draft:

---

## Success Criteria

### User Success

- A new user can add their first todo within seconds of opening the app, with no instructions or onboarding required.
- The interface communicates its purpose and interaction model instantly -- users never wonder "what do I do here?"
- Completing, creating, and deleting tasks feels effortless and immediate. No friction, no unnecessary steps.
- Completed tasks are visually distinct at a glance, giving users a clear sense of progress.
- The experience is equally intuitive on desktop and mobile devices.

### Business Success

- The delivered application is a polished, production-quality product that demonstrates clean execution across the full stack.
- The codebase is well-structured, maintainable, and easy for any developer to understand and extend.
- The app can be deployed and used immediately as a real, functional tool.

### Technical Success

- Page load times and interaction response times under 1 second, validated by Lighthouse performance scores.
- Lighthouse accessibility score of 90+ -- accessibility is a first-class design constraint, not an afterthought.
- Comprehensive test suite covering unit, integration, and E2E tests with a minimum of 80% code coverage.
- All tests pass reliably with no flaky tests.
- Clean separation between frontend and backend with a well-defined API contract.

### Measurable Outcomes

| Metric | Target |
|---|---|
| Time to first todo created (new user) | < 30 seconds |
| Page load (Lighthouse Performance) | 90+ |
| Lighthouse Accessibility | 90+ |
| Interaction response time | < 1 second |
| Test coverage (unit + integration + E2E) | >= 80% |
| Cross-device usability | Desktop + mobile fully functional |

## Product Scope

### MVP - Minimum Viable Product

- Create, view, complete, and delete todo items
- Each todo has a text description, completion status, and creation timestamp
- Persistent storage via backend API (data survives refresh and sessions)
- SSG frontend with client-side API interaction for dynamic operations
- Responsive layout for desktop and mobile
- Accessible markup and interactions (WCAG 2.1 AA)
- Empty, loading, and error states handled gracefully
- Full test suite (unit, integration, E2E) at 80%+ coverage

### Growth Features (Post-MVP)

- User accounts and authentication
- Task prioritization or ordering
- Due dates and reminders
- Search or filtering of tasks
- Keyboard shortcuts for power users

### Vision (Future)

- Multi-user support and collaboration
- Shared task lists
- Notifications and reminders
- Third-party integrations (calendar, email)
- Offline-first with sync

---

Does this capture what you're after, or would you adjust anything?

**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to User Journey Mapping (Step 4 of 13)

---

**User**

c

---

**Cursor**

**Progress: Step 4 of 13** -- User Journey Mapping

Given the deliberately minimal scope of this app -- single user, no auth, no admin panel -- the user types are fairly focused. But let's make sure we cover the interactions properly.

I see one primary user type here: **the task manager** -- someone who opens the app to capture and track personal todos. There's no admin, no multi-user, no API consumer in the MVP scope.

But even with a single user type, there are distinct journeys worth mapping:

1. **First visit / empty state** -- opening the app for the first time with no todos
2. **Adding and managing tasks** -- the core happy path of creating, completing, deleting
3. **Returning after time away** -- coming back to an existing list, picking up where they left off
4. **Error recovery** -- what happens when the API is down or something goes wrong

Let me ask you a few things before I draft the narratives:

- **Who's the person using this?** Are you picturing a specific type of user -- a busy professional, a student, someone managing household tasks -- or is it deliberately generic?
- **How do they arrive at the app?** Is this bookmarked, a daily-driver tab, something they open from a phone home screen?
- **What's the emotional state when they open it?** Are they in a rush to capture something before they forget, or are they reviewing what's on their plate?

These details will make the journeys feel real rather than abstract.

---

**User**

No specific user persona; this is meant to be lightweight and applicable to anybody

They will likely bookmark this app, so no need to overthink how they arrive at it

The emotional state is that they have something on their mind that they want to note down as a todo, and want minimal friction to achieve that.

---

**Cursor**

Perfect -- universal audience, bookmarked access, and the driving emotion is "I need to capture this thought before it slips away." Here's the draft:

---

## User Journeys

### Journey 1: First Visit -- The Empty Canvas

Sam opens the app for the first time from a link a friend shared. The page loads instantly and they see a clean, uncluttered interface. There's no sign-up wall, no tutorial overlay, no decision to make. A single input area invites them to type. Sam has a thought nagging them -- "pick up dry cleaning" -- so they type it and hit enter. The todo appears immediately in a list below. They add two more. Within 15 seconds of arriving, Sam has a working todo list and already trusts the tool. They bookmark it and close the tab.

**Reveals:** Empty state must clearly communicate purpose without instructions. Input must be prominent and obvious. First interaction must feel instant and rewarding.

### Journey 2: Quick Capture -- The Rushing Thought

It's mid-afternoon and Sam suddenly remembers they need to call the vet. They open the bookmarked app on their phone. The page loads fast -- their existing todos are already there. They tap the input, type "call vet," and submit. The new todo appears at the top of the list. Total time: under 10 seconds. Sam locks their phone and gets back to what they were doing.

**Reveals:** Speed is everything for capture. The input must be immediately focused or easily reachable. The list must load with existing data ready. Mobile experience must be as frictionless as desktop.

### Journey 3: Review and Tidy -- The Satisfying Cleanup

Sam opens the app on their laptop at the end of the day. They see five todos. Two are done -- they tap the checkboxes and the items visually shift to a completed state, clearly distinct from the remaining active tasks. One item is no longer relevant, so they delete it. The list now shows two active todos and two completed ones. Sam feels a small sense of accomplishment and clarity about what's left. They close the tab knowing tomorrow's priorities are clear.

**Reveals:** Completing and deleting must be single-action operations. Completed tasks must be visually differentiated instantly. The list should give a clear at-a-glance sense of what's done vs. what's pending.

### Journey 4: Something Goes Wrong -- The Graceful Stumble

Sam opens the app but their internet connection is flaky. The page itself loads fine (it's statically generated), but when they try to add a todo, the save fails. Instead of a cryptic error or silent failure, they see a clear, friendly message that the action couldn't be completed. Sam waits a moment, tries again, and this time it works. Their todo appears and the error state clears. At no point did Sam lose data or wonder what happened.

**Reveals:** Error states must be human-readable and non-alarming. Failed operations should be clearly communicated with an obvious path to retry. The static shell should always render even if the API is unavailable. No silent failures.

### Journey Requirements Summary

| Capability | Revealed By |
|---|---|
| Prominent, obvious input for new todos | Journey 1, 2 |
| Meaningful empty state (no instructions needed) | Journey 1 |
| Instant visual feedback on all actions | Journey 1, 2, 3 |
| Fast page load with existing data ready | Journey 2 |
| Mobile-first responsive design | Journey 2 |
| Single-action complete and delete | Journey 3 |
| Clear visual distinction for completed tasks | Journey 3 |
| Graceful error handling with retry path | Journey 4 |
| Static shell renders regardless of API state | Journey 4 |
| No data loss on transient failures | Journey 4 |

---

Does this feel right for the scope and tone, or would you adjust any of the journeys?

**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Domain Requirements (Step 5 of 13)

---

**User**

That all sounds great

---

**Cursor**

Glad it resonates. Ready to save and move on when you are.

**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Domain Requirements (Step 5 of 13)

---

**User**

c

---

**Cursor**

**Progress: Step 5 of 13** -- Domain-Specific Requirements (Optional)

The domain complexity from our discovery is **low** (general productivity / task management). There are no regulatory, compliance, or specialized domain constraints to worry about here -- no HIPAA, no PCI-DSS, no industry-specific standards.

We can safely skip this step and move straight to Innovation.

- **[C]** Skip this step and move to Innovation
- **[D]** Do domain exploration anyway

---

**User**

c

---

**Cursor**

**Progress: Step 6 of 13** -- Innovation Discovery (Optional)

Looking at this product through the innovation lens -- I'm not detecting genuine innovation signals here. The web_app project type CSV flags things like "New interaction patterns" and "WebAssembly use," and nothing in our conversations has pointed in that direction.

And that's completely fine. This product is an excellent execution of an existing concept, not a breakthrough innovation. The value proposition is craftsmanship and polish, not novelty. Many of the best products aren't innovative -- they're just *really well made*.

Would you like to explore innovative angles anyway, or skip this and move on?

**Select:** [A] Advanced Elicitation -- Let's try to find innovative angles [C] Continue -- Skip innovation section and move to Project Type Analysis (Step 7 of 13)

---

**User**

c

---

**Cursor**

**Progress: Step 7 of 13** -- Project-Type Deep Dive

For the `web_app` project type, the CSV guides me to explore these key questions. Some we've already covered, so let me confirm what I know and fill in the gaps:

- **SPA or MPA?** -- Already decided: SSG with client-side API interactions. Covered.
- **Accessibility?** -- Already decided: first-class, WCAG 2.1 AA, Lighthouse 90+. Covered.

That leaves a few open questions:

1. **Browser support** -- Are you targeting modern evergreen browsers only (Chrome, Firefox, Safari, Edge latest), or do you need to support older versions? Any IE consideration?

2. **SEO** -- With SSG you get good SEO for free, but does SEO actually matter here? Is this a publicly discoverable app, or more of a personal utility where search indexing is irrelevant?

3. **Real-time features** -- Based on the requirements, this seems like a straightforward request/response model with no real-time needs (no live collaboration, no push updates). Is that correct?

---

**User**

What is the CSV you refer to?

---

**Cursor**

Good question. The BMAD workflow uses a data file called `project-types.csv` that contains guidance for different project types (web app, mobile app, API backend, SaaS, etc.). Each row includes key discovery questions, required sections, and sections to skip for that specific project type.

For the `web_app` type, it suggests exploring:
- SPA vs MPA architecture
- Browser support
- SEO needs
- Real-time requirements
- Accessibility

It also flags sections to skip for web apps (like native device features and CLI commands), so we don't waste time on irrelevant areas.

It's just a structured guide to make sure we ask the right questions for your specific type of project. The questions I asked above came from that guidance.

So -- back to those three open questions:

1. **Browser support** -- Modern evergreen browsers only, or broader support needed?
2. **SEO** -- Does discoverability via search engines matter, or is this a personal utility?
3. **Real-time** -- Confirm no real-time/push requirements?

---

**User**

We should support all modern browsers where possible.  Do not worry about legacy browsers like IE.  

SEO isn't super important for this but we should include the minimum expected for an SSG web application.

There isn't really any scope for realtime features at this time.

---

**Cursor**

Clear answers. Let me draft the web app-specific requirements based on everything we've discussed. Skipping native features and CLI sections per the project type guidance.

---

## Web App Specific Requirements

### Project-Type Overview

Statically generated (SSG) web application with a backend API for data persistence. The frontend is pre-rendered at build time, delivering fast initial page loads and reliable rendering. Dynamic interactions (CRUD operations on todos) are handled client-side via API calls. No real-time or push features required.

### Browser Support

| Browser | Support Level |
|---|---|
| Chrome (latest 2 versions) | Full |
| Firefox (latest 2 versions) | Full |
| Safari (latest 2 versions) | Full |
| Edge (latest 2 versions) | Full |
| Mobile Safari (iOS) | Full |
| Chrome Mobile (Android) | Full |
| Internet Explorer | Not supported |

### Responsive Design

- Mobile-first responsive layout
- Fully functional and visually polished at all breakpoints: mobile (320px+), tablet (768px+), desktop (1024px+)
- Touch targets sized appropriately for mobile interaction (minimum 44x44px)
- No horizontal scrolling at any supported viewport width

### Performance Targets

| Metric | Target |
|---|---|
| Lighthouse Performance score | 90+ |
| First Contentful Paint | < 1s |
| Largest Contentful Paint | < 1.5s |
| Time to Interactive | < 1.5s |
| Cumulative Layout Shift | < 0.1 |
| API interaction response (perceived) | < 1s |

### SEO Baseline

Minimum expected for an SSG application -- not a priority, but included for good practice:
- Semantic HTML with proper heading hierarchy
- Meta title and description tags
- Open Graph tags for basic social sharing
- Proper use of `<main>`, `<nav>`, `<header>`, `<footer>` landmarks
- Server-rendered content (inherent to SSG)

### Accessibility

- WCAG 2.1 AA compliance as a design constraint
- Lighthouse Accessibility score of 90+
- Keyboard navigable -- all actions achievable without a mouse
- Screen reader compatible with proper ARIA labels where semantic HTML is insufficient
- Sufficient color contrast ratios (minimum 4.5:1 for normal text)
- Focus indicators visible on all interactive elements
- No information conveyed by color alone

### Implementation Considerations

- SSG framework handles build-time rendering; client-side JavaScript hydrates for dynamic API interactions
- API client should handle network failures gracefully with user-visible error states
- Static assets should be optimized (minified, compressed, cache-controlled)
- No WebSocket or Server-Sent Events required -- standard HTTP request/response is sufficient

---

Does this capture the web app requirements accurately, or would you adjust anything?

**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Scoping (Step 8 of 13)

---

**User**

c

---

**Cursor**

**Progress: Step 8 of 13** -- Scoping Exercise

Let me review everything we've built so far and assess the scope landscape.

**Synthesis of what's established:**
- A deliberately minimal full-stack todo app (SSG + backend API)
- Single user type, four clear journeys covering happy path, quick capture, review/tidy, and error recovery
- Hard technical targets: Lighthouse 90+, sub-1s interactions, WCAG 2.1 AA, 80%+ test coverage
- Scope already outlined in Step 3 with MVP, Growth, and Vision tiers

**My assessment:** This is a small, well-bounded MVP. The scope is already intentionally tight, which is a strength. The risk isn't scope creep -- it's over-engineering a simple product.

Before I formalize the scoping section, a few quick questions:

1. **MVP philosophy** -- This reads as an "experience MVP" to me -- the goal isn't to validate a market hypothesis or generate revenue, it's to deliver a polished, complete experience within tight boundaries. Does that match your thinking?

2. **Resource assumptions** -- Is this a solo developer project, or should we plan for a small team? And is there a target timeline you're working toward?

3. **Biggest technical risk** -- From where I sit, the riskiest part is getting *all* the quality targets (Lighthouse performance + accessibility + 80% test coverage) to land simultaneously. Nothing individually hard, but the combination requires discipline. Would you agree, or do you see a different risk?

---

**User**

1. Yes
2. Solo developer
3. That sounds fine, but I'm sure it's nothing we can't handle 💪

---

**Cursor**

That's the spirit. Here's the scoping section draft:

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP -- deliver a polished, complete experience within deliberately tight boundaries. The goal is not market validation or revenue generation, but demonstrating that a minimal feature set executed with discipline produces a product that feels finished and trustworthy.

**Resource Requirements:** Solo developer. The tight scope makes this viable as a single-person project. The constraint reinforces the lean philosophy -- every feature must justify its inclusion.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Journey 1: First Visit (empty state to first todo)
- Journey 2: Quick Capture (add a todo in under 10 seconds)
- Journey 3: Review and Tidy (complete and delete todos)
- Journey 4: Error Recovery (graceful handling of failures)

**Must-Have Capabilities:**
- Create, view, complete, and delete todo items
- Text description, completion status, and creation timestamp per todo
- Persistent backend API storage
- SSG frontend with client-side hydration for dynamic operations
- Mobile-first responsive design (320px to desktop)
- WCAG 2.1 AA accessible markup and interactions
- Empty, loading, and error states
- Unit, integration, and E2E tests at 80%+ coverage
- Lighthouse Performance and Accessibility scores of 90+

### Post-MVP Features

**Phase 2 (Growth):**
- User accounts and authentication
- Task prioritization or ordering
- Due dates and reminders
- Search or filtering
- Keyboard shortcuts for power users

**Phase 3 (Expansion):**
- Multi-user support and collaboration
- Shared task lists
- Notifications and reminders
- Third-party integrations (calendar, email)
- Offline-first with sync

### Risk Mitigation Strategy

**Technical Risks:** The primary risk is achieving all quality targets simultaneously -- Lighthouse performance, accessibility compliance, and 80% test coverage. Mitigation: bake these into the development workflow from day one rather than retrofitting. Write tests alongside features, run Lighthouse audits early and often, and use accessible markup as the default rather than an add-on.

**Market Risks:** Not applicable -- this is not a market-facing product competing for users.

**Resource Risks:** Solo developer means no parallelization. If time becomes constrained, the phased roadmap provides natural cut points. The MVP is scoped tightly enough that a single developer can deliver it without cutting corners on quality.

---

Does this capture the scoping decisions accurately?

**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Functional Requirements (Step 9 of 13)

---

**User**

c

---

**Cursor**

**Progress: Step 9 of 13** -- Functional Requirements Synthesis

This is a critical step -- the functional requirements become the **capability contract** for everything downstream. UX design, architecture, and epic breakdown will all trace back to what we define here. If a capability isn't listed, it won't exist in the final product.

I've synthesized capabilities from everything we've discussed -- executive summary, success criteria, all four user journeys, web app requirements, and scoping decisions. Here's my draft:

---

## Functional Requirements

### Task Management

- FR1: User can create a new todo by entering a text description
- FR2: User can view all existing todos in a single list
- FR3: User can mark a todo as complete
- FR4: User can unmark a completed todo to restore it to active
- FR5: User can delete a todo permanently
- FR6: Each todo displays its text description, completion status, and creation timestamp

### Task Visualization

- FR7: User can distinguish completed todos from active todos at a glance
- FR8: User can see an appropriate empty state when no todos exist
- FR9: User can see a loading state while data is being fetched
- FR10: User can see the total count of active and/or completed todos

### Data Persistence

- FR11: Todos persist across browser sessions and page refreshes
- FR12: System stores each todo with its text, completion status, and creation timestamp
- FR13: System exposes a CRUD API for todo operations

### Error Handling

- FR14: User can see a clear error message when an operation fails
- FR15: User can retry a failed operation without losing their input
- FR16: System renders the application shell even when the API is unavailable

### Responsive Experience

- FR17: User can perform all todo operations on mobile devices
- FR18: User can perform all todo operations on desktop devices
- FR19: User can perform all todo operations using only a keyboard
- FR20: User can interact with the application using assistive technologies (screen readers)

---

I've kept these implementation-agnostic and testable. A few things I want to flag for your review:

- **FR4 (unmark/restore):** Your requirements didn't explicitly mention un-completing a todo. Should a user be able to reverse a completion, or is completing a one-way action?
- **FR10 (counts):** I included a count capability since it supports the "at-a-glance progress" success criterion. Worth keeping, or is the visual distinction alone sufficient?

What do you think -- anything to add, remove, or adjust?

**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Non-Functional Requirements (Step 10 of 13)

---

**User**

FR4 - let's allow unmarking - a user might accidently check a todo that they didn't mean to
FR10 - let's drop this and keep the UI minimal

---

**Cursor**

Good calls -- keeping un-complete for error recovery, dropping the count to stay lean. Updated draft:

---

## Functional Requirements

### Task Management

- FR1: User can create a new todo by entering a text description
- FR2: User can view all existing todos in a single list
- FR3: User can mark a todo as complete
- FR4: User can unmark a completed todo to restore it to active
- FR5: User can delete a todo permanently
- FR6: Each todo displays its text description, completion status, and creation timestamp

### Task Visualization

- FR7: User can distinguish completed todos from active todos at a glance
- FR8: User can see an appropriate empty state when no todos exist
- FR9: User can see a loading state while data is being fetched

### Data Persistence

- FR10: Todos persist across browser sessions and page refreshes
- FR11: System stores each todo with its text, completion status, and creation timestamp
- FR12: System exposes a CRUD API for todo operations

### Error Handling

- FR13: User can see a clear error message when an operation fails
- FR14: User can retry a failed operation without losing their input
- FR15: System renders the application shell even when the API is unavailable

### Responsive Experience

- FR16: User can perform all todo operations on mobile devices
- FR17: User can perform all todo operations on desktop devices
- FR18: User can perform all todo operations using only a keyboard
- FR19: User can interact with the application using assistive technologies (screen readers)

---

19 FRs across 5 capability areas. Tight and complete for a lean MVP. Anything else, or ready to proceed?

**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Non-Functional Requirements (Step 10 of 13)

---

**User**

c

---

**Cursor**

**Progress: Step 10 of 13** -- Non-Functional Requirements

NFRs define *how well* the system performs, not what it does. We've already captured a lot of quality targets in the Web App Requirements section (Lighthouse scores, performance targets, accessibility). This step is about consolidating and filling any gaps.

Let me assess which NFR categories are relevant for this product:

- **Performance:** Yes -- sub-1s interactions and Lighthouse 90+ are explicit success criteria
- **Accessibility:** Yes -- WCAG 2.1 AA is a first-class constraint
- **Security:** Minimal -- no auth, no sensitive data in MVP, but basic hygiene matters
- **Scalability:** Not relevant for MVP -- single user, no growth targets
- **Integration:** Not relevant -- no external system connections

Here's my draft, keeping it focused on what actually matters:

---

## Non-Functional Requirements

### Performance

- NFR1: All user-initiated actions (create, complete, delete) must reflect in the UI within 1 second
- NFR2: Initial page load must achieve a Lighthouse Performance score of 90+
- NFR3: First Contentful Paint under 1 second, Largest Contentful Paint under 1.5 seconds
- NFR4: Cumulative Layout Shift below 0.1 -- no unexpected visual jumps during load or interaction
- NFR5: Static assets must be minified, compressed, and served with appropriate cache headers

### Accessibility

- NFR6: Application must meet WCAG 2.1 AA compliance
- NFR7: Lighthouse Accessibility score of 90+
- NFR8: All interactive elements must be reachable and operable via keyboard alone
- NFR9: All content and controls must be compatible with screen readers
- NFR10: Color contrast ratios must meet minimum 4.5:1 for normal text, 3:1 for large text
- NFR11: Focus indicators must be visible on all interactive elements
- NFR12: No information may be conveyed by color alone

### Security

- NFR13: API inputs must be validated and sanitized to prevent injection attacks
- NFR14: API responses must not expose internal system details in error messages
- NFR15: HTTPS must be used for all client-server communication

### Testing

- NFR16: Minimum 80% code coverage across unit, integration, and E2E tests combined
- NFR17: All tests must pass reliably with no flaky tests in the suite
- NFR18: E2E tests must cover all four core user journeys

---

I included a Testing category since you called out comprehensive testing as a hard requirement. Does this capture the quality bar you're after, or would you adjust anything?

**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Polish Document (Step 11 of 13)

---

**User**

I think we should actually add a consideration for security and preveting XSS & injection attacks

---

**Cursor**

Absolutely -- good call. Since users are typing freeform text that gets stored and rendered, XSS and injection protection is essential. Let me update the Security section:

---

### Security

- NFR13: API inputs must be validated and sanitized to prevent injection attacks
- NFR14: User-supplied text must be escaped/sanitized before rendering to prevent cross-site scripting (XSS)
- NFR15: API responses must not expose internal system details in error messages
- NFR16: HTTPS must be used for all client-server communication
- NFR17: API must reject malformed or oversized requests to prevent abuse

---

That tightens up the security posture around the actual attack surface -- user input flowing through the API and back into the DOM. Anything else, or ready to proceed?

**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Polish Document (Step 11 of 13)

---

**User**

c

---

**Cursor**

**Progress: Step 11 of 13** -- Document Polish

I've loaded the complete PRD and the PRD purpose guidelines. Let me share my review findings before making changes.

**Document Quality Review:**

1. **Duplication found:** The scope is defined twice -- once in "Product Scope" (Step 3) and again in "Project Scoping & Phased Development" (Step 8). The MVP items, Growth features, and Vision features are nearly identical in both. I'll consolidate into a single, comprehensive section.

2. **Overlapping quality targets:** Performance targets appear in three places -- "Measurable Outcomes" table, "Web App > Performance Targets" table, and NFRs. Accessibility details similarly appear in both "Web App > Accessibility" and NFRs. I'll keep the detailed specifications in the NFRs and Web App sections, and streamline the Measurable Outcomes table to be a quick-reference summary that doesn't repeat the details.

3. **Executive Summary tone:** You asked me earlier not to overfocus on the BMAD angle. The opening sentence still leads with "proving ground for the BMAD methodology." I'll reframe to lead with the product itself.

4. **Section ordering:** The journey requirements summary table and the Web App section both feed into FRs nicely. I'll ensure the flow reads: vision → criteria → journeys → web app specifics → scoping → FRs → NFRs, with smooth transitions.

5. **No brainstorming reconciliation needed** -- no brainstorming input documents were used.

Here's the polished document:

Here's a summary of what changed in the polish:

**Changes made:**
1. **Executive Summary reframed** -- removed the "proving ground for BMAD" framing; now leads with what the product is
2. **Scope sections consolidated** -- merged the duplicate "Product Scope" (Step 3) and "Project Scoping" (Step 8) into a single coherent section. The MVP, Growth, and Vision features now appear once
3. **Consistent phase naming** -- "Growth Features (Post-MVP)" and "Vision (Future)" are now consistently labeled "Phase 2: Growth" and "Phase 3: Expansion"
4. **Removed redundant sentence** -- cut "The constraint reinforces the lean philosophy -- every feature must justify its inclusion" from Resource Requirements (already conveyed by the MVP philosophy)
5. **Preserved all essential content** -- every FR, NFR, journey, success criterion, and technical specification is intact

**What I deliberately kept:**
- Performance targets appear in both the Web App section (as detailed benchmarks) and NFRs (as testable requirements). These serve different audiences -- the Web App section is a technical reference, NFRs are the formal quality contract. Cross-referencing rather than consolidating is appropriate here.
- The Measurable Outcomes table stays as a quick-reference dashboard even though individual metrics are detailed elsewhere.

Does this look right to you?

**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Complete PRD (Step 12 of 13)

---

**User**

c

---

**Cursor**

**Your PRD for todo-bmad is complete!**

Here's what we built together across 12 steps:

| Section | Content |
|---|---|
| Executive Summary | Product vision, differentiator |
| Project Classification | Web App (SSG + API), low complexity, greenfield |
| Success Criteria | User, business, technical success + measurable outcomes |
| User Journeys | 4 narrative journeys covering first visit, quick capture, review/tidy, error recovery |
| Web App Requirements | Browser support, responsive design, performance targets, SEO baseline, accessibility, implementation considerations |
| Project Scoping | Experience MVP strategy, 3-phase roadmap, risk mitigation |
| Functional Requirements | 19 FRs across 5 capability areas |
| Non-Functional Requirements | 20 NFRs covering performance, accessibility, security, testing |

The document lives at `_bmad-output/planning-artifacts/prd.md` and is ready for downstream work.

---

**Recommended next steps** (run each in a fresh context window):

1. **Validate the PRD** (optional but recommended) -- `bmad-bmm-validate-prd`
   Agent: John (Product Manager) -- validates the PRD is comprehensive, lean, and cohesive. Consider using a different LLM for an independent perspective.

2. **Create UX Design** (optional, recommended for UI-focused apps) -- `bmad-bmm-create-ux-design`
   Agent: Sally (UX Designer) -- guided workflow to plan UX patterns and design specifications.

3. **Create Architecture** (required next) -- `bmad-bmm-create-architecture`
   Agent: Winston (Architect) -- guided workflow to document technical decisions. This is the next required step in the BMAD workflow.

The PRD is now the foundation for everything that follows. All design, architecture, and development work should trace back to it -- and it can be updated as you continue planning.

---

**User**

/bmad-validate-prd 

---

**Cursor**

I'll load the PRD validation workflow and follow it step by step against the completed `prd.md`.

I'm setting up the validation context now: locating the PRD, loading its source inputs, and preparing the validation report.

**Validate Mode: Validating an existing PRD against BMAD standards.**

Found PRD: `_bmad-output/planning-artifacts/prd.md` — using it for validation.

**I've loaded the following documents from your PRD frontmatter:**
- `requirements/requirements.md`

Are there any additional reference documents you'd like me to include in this validation?

These could include:
- Additional research or context documents
- Project documentation not tracked in frontmatter
- Standards or compliance documents
- Competitive analysis or benchmarks

Please provide paths to any additional documents, or type `none` to proceed.

---

**User**

none

---

**Cursor**

No extra references, so I'll initialize the validation report next to the PRD and prepare the validation setup summary.

**Setup Complete!**

**PRD to Validate:** `_bmad-output/planning-artifacts/prd.md`

**Input Documents Loaded:**
- PRD: `prd.md` ✓
- Product Brief: 0 (none found)
- Research: 0 (none found)
- Additional References: 0 (none)

**Validation Report:** `_bmad-output/planning-artifacts/validation-report-20260313-165255.md`

**Ready to begin validation.**

**Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Format Detection

---

**User**

c

---

**Cursor**

I'll move into format detection and validate the PRD structure before checking the content itself.

I’ve classified the PRD structure as BMAD-standard enough to continue, and I’m recording the format findings in the validation report before moving into density validation.

**Format Detected:** BMAD Standard

Proceeding to systematic validation checks.

I'm running the density scan now: checking for filler, wordiness, and redundant phrasing, then I’ll record the result and continue automatically.

**Information Density Validation Complete**

Severity: Pass

**Proceeding to next validation check...**

**Product Brief Coverage: Skipped** (No Product Brief provided)

**Proceeding to next validation check...**

I’ve reached the measurability pass. The functional requirements are clean, but several NFRs are strong in intent and still need tighter measurement or verification language by BMAD standards.

**Measurability Validation Complete**

Total Violations: 12 (Critical)

**Proceeding to next validation check...**

I’m checking the traceability chain now: vision to success, success to journeys, and journeys to FRs. The main risk here is unsupported success criteria, not orphaned functional requirements.

**Traceability Validation Complete**

Total Issues: 4 (Warning)

**Proceeding to next validation check...**

**Implementation Leakage Validation Complete**

Total Violations: 0 (Pass)

**Proceeding to next validation check...**

**Domain Compliance Validation Skipped**

Domain: General (productivity/task management) (low complexity)

**Proceeding to next validation check...**

I'm checking the PRD against the `web_app` expectations from the project type matrix now: required sections present, excluded sections absent, then I’ll record the compliance result.

**Project-Type Compliance Validation Complete**

Project Type: Web App (SSG with backend API)  
Compliance: 100%

**Proceeding to next validation check...**

**SMART Requirements Validation Complete**

FR Quality: 100% with acceptable scores (Pass)

**Proceeding to next validation check...**

I’m in the holistic pass now, evaluating the PRD as a full document rather than by section. The main story is strong; the biggest quality drag remains NFR precision and a few traceability gaps.

**Holistic Quality Assessment Complete**

Overall Rating: 4/5 - Good

**Proceeding to final validation checks...**

I’m doing the final completeness gate now: checking for leftover template markers, section completeness, and whether the frontmatter has everything the workflow expects.

**Completeness Validation Complete**

Overall Completeness: 89% (Warning)

**Proceeding to final step...**

I’ve reached the final synthesis step. I’m loading the completed report, marking it finished, and then I’ll give you a concise validation summary with options for what to do next.

**✓ PRD Validation Complete**

**Overall Status:** Warning

**Quick Results:**

| Check | Result |
|---|---|
| Format | BMAD Standard |
| Information Density | Pass |
| Measurability | Critical |
| Traceability | Warning |
| Implementation Leakage | Pass |
| Domain Compliance | N/A - low complexity domain |
| Project-Type Compliance | 100% |
| SMART Quality | 100% acceptable, 89% strong |
| Holistic Quality | 4/5 - Good |
| Completeness | 89% |

**Critical Issues:** 1
- The main issue is **NFR measurability**. Several non-functional requirements are strong in intent but not yet precise enough for BMAD downstream use. The biggest gaps are missing thresholds, missing measurement methods, and missing operating context.

**Warnings:** 3
- Some business and technical success criteria do not trace cleanly to user journeys.
- `Project Scoping & Phased Development` contains the scope content, but it does not explicitly use the expected `Product Scope` heading.
- Frontmatter is missing an explicit `date` field.

**Strengths:**
- Clean BMAD structure overall
- Strong information density with no filler-pattern violations
- No meaningful implementation leakage
- Functional requirements are solid and SMART overall
- Web app-specific coverage is complete and well aligned
- The document is cohesive and strong for both human readers and LLM downstream use

**Holistic Quality:** 4/5 - Good

**Top 3 Improvements:**
1. Tighten NFR measurability
2. Strengthen traceability for non-journey outcomes
3. Promote scope as a first-class required section

**Recommendation:**
The PRD is usable, but it has issues that should be addressed before relying on it as the sole downstream source of truth. The biggest payoff is tightening the flagged NFRs.

**What would you like to do next?**

**[R] Review Detailed Findings** - Walk through validation report section by section  
**[E] Use Edit Workflow** - Use validation report with Edit workflow for systematic improvements  
**[F] Fix Simpler Items** - Immediate fixes for simple issues  
**[X] Exit** - Exit and suggest next steps

---

**User**

f

---

**Cursor**

The simple fixes I can make right away are:

- Add a `date` field to the PRD frontmatter
- Rename or cross-reference `## Project Scoping & Phased Development` so it explicitly satisfies `Product Scope`
- Tighten the obvious NFR wording gaps the validator flagged:
  - define cache header expectations
  - define screen reader compatibility criteria
  - define focus indicator visibility criteria
  - define oversized request limits
  - define what “no flaky tests” means
  - add measurement context to the flagged performance and security NFRs

Reply with any of:
- `1` for frontmatter date
- `2` for scope header fix
- `3` for NFR tightening
- `all` for everything above

---

**User**

all

---

**Cursor**

I’m applying the full simple-fix set now to the PRD, then I’ll update the validation report to reflect what was corrected and bring you back to the menu.

I’ve identified the exact PRD edits: frontmatter date, scope header alignment, and precision updates for the flagged NFRs. Applying them now.

The PRD fixes are in place. I’m adding a note to the validation report so it’s clear which findings have already been addressed since the original pass.

I applied all of the simple fixes to ` _bmad-output/planning-artifacts/prd.md`:

- added `date` to frontmatter
- promoted scope to an explicit `## Product Scope` section
- tightened the flagged NFRs with thresholds, context, and verification language

I also noted those changes in ` _bmad-output/planning-artifacts/validation-report-20260313-165255.md`.

The remaining likely issue is the **traceability warning** around business/technical success criteria not mapping cleanly to journeys. The measurability/completeness situation should now be much better, but I haven’t rerun the full validator yet.

**What would you like to do next?**

**[R] Review Detailed Findings** - Walk through validation report section by section  
**[E] Use Edit Workflow** - Systematically address the remaining issues  
**[F] Fix Simpler Items** - Make more immediate fixes  
**[X] Exit** - Exit and suggest next steps

---

**User**

x

---

**Cursor**

**Validation Report Saved:** `_bmad-output/planning-artifacts/validation-report-20260313-165255.md`

**Summary:** Warning — the PRD is strong and usable, and I already fixed the straightforward issues. The main remaining improvement area is traceability between some business/technical success criteria and the rest of the document.

Natural next step: rerun `/bmad-validate-prd` once to confirm the fixes cleared the measurability/completeness findings, or move on to architecture with `bmad-bmm-create-architecture` if you're comfortable carrying the remaining warning forward.

---

**User**

How would you fix the traceability issue?

---

**Cursor**

I’d fix it by adding **one lightweight secondary persona** and **1-2 short operational journeys** to ` _bmad-output/planning-artifacts/prd.md`.

Right now the PRD has only the end-user journeys, so the validator can trace user-facing capabilities well, but it can’t trace these success criteria cleanly:
- maintainable / easy-to-extend codebase
- deployable and immediately usable app
- reliable non-flaky test suite
- clear frontend/backend separation

The cleanest fix is:

1. Add a secondary actor
`Developer/Maintainer` or `Solo Builder`

2. Add a short journey like:
`Journey 5: Confident Change`
The maintainer returns after some time, understands the system quickly, runs tests, makes a small change, and verifies nothing regressed.

3. Add a short journey like:
`Journey 6: Confident Release`
The maintainer deploys the app, verifies the frontend and API work together, and confirms the release is stable.

That gives those success criteria a traceable home without bloating the product scope.

I’d map them like this:

- `maintainable, easy-to-extend codebase` -> `Journey 5`
- `clear frontend/backend separation with API contract` -> `Journey 5`
- `all tests pass reliably with no flaky tests` -> `Journey 5` and `Journey 6`
- `deployable and immediately usable` -> `Journey 6`

If you want to keep user journeys strictly end-user only, the alternative is to add a small section like `## Traceability Notes` or `### Non-User Success Traceability`, but that may not satisfy this validator as directly.

My recommendation: use the **secondary maintainer persona + 2 short journeys** approach. It’s the smallest fix and it improves the PRD itself, not just the validation result.

If you want, I can draft the exact text to add.

---

**User**

I don't think we should include these.  They relate to maintenance of the project rather than requirements of it, and I think that as long as we state that we should follow good solid development practices, then that should be enough guidance

---

**Cursor**

I agree.

Those items are **delivery and engineering quality expectations**, not core user requirements, and forcing them into user journeys would weaken the PRD rather than improve it. A validator can prefer perfect traceability, but in this case it’s pushing the document in the wrong direction.

The clean position is:

- Keep user journeys focused on real product actors and product use
- Treat maintainability, test reliability, API separation, and deployability as **engineering standards / quality constraints**
- Capture them in `Non-Functional Requirements`, architecture, and implementation practices rather than inventing maintainer personas

If you wanted to make that intent more explicit without changing the substance, the best refinement would be one short note in the PRD such as:

> Technical success criteria define engineering quality expectations for implementation and delivery, not end-user journey outcomes.

That would clarify why those items do not map to user journeys.

So my recommendation is:
- **Do not add fake maintainer journeys**
- **Keep the remaining traceability warning**
- Optionally add a short clarification sentence if you want to make the rationale explicit

If you want, I can add that clarification line to the PRD.

---

**User**

Yes please

---

**Cursor**

I’m adding a short clarification to the PRD so the technical success criteria are clearly framed as engineering quality expectations rather than user-journey outcomes.

Added the clarification to ` _bmad-output/planning-artifacts/prd.md` under `Technical Success`.

If you want, I can also add a matching note to the validation report so future readers understand why that warning was intentionally accepted.

---

**User**

Yes please

---

**Cursor**

I’m adding a short note to the validation report to record that the remaining traceability warning was reviewed and intentionally accepted.

Added that rationale to ` _bmad-output/planning-artifacts/validation-report-20260313-165255.md`.

At this point the PRD and validation report are aligned: the remaining traceability warning is documented as an intentional decision rather than an overlooked gap.

---

**User**

What happens next?

---

**Cursor**

I’m checking the BMAD workflow state from the artifacts you now have so I can tell you the concrete next step, not just the generic sequence.

You’re past PRD creation and validation, so the workflow moves into **solutioning**.

**What happens next:**

- **Optional, recommended:** `bmad-bmm-create-ux-design`
  Agent: Sally (UX Designer)
  Use this if you want the UI/interaction design spelled out before architecture.

- **Next required step:** `bmad-bmm-create-architecture`
  Agent: Winston (Architect)
  This is the formal next required BMAD step. It turns the PRD into technical decisions, structure, and implementation direction.

- **After architecture:** `bmad-bmm-create-epics-and-stories`
  Agent: John (Product Manager)
  This breaks the approved PRD + architecture into implementable work.

- **Then:** `bmad-bmm-check-implementation-readiness`
  Agent: Winston (Architect)
  This validates that PRD, UX, architecture, and stories are aligned before build execution.

My practical recommendation for this project:

1. Run `bmad-bmm-create-ux-design`
2. Run `bmad-bmm-create-architecture`
3. Run `bmad-bmm-create-epics-and-stories`

Run each in a **fresh context window**. If you want to stay lean, you can skip UX and go straight to architecture, but for this app’s “elegant and intuitive” goal, UX is worth doing.

