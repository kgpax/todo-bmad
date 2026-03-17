# bmad help request

_Exported on 17/03/2026 at 7:45:45 GMT from Cursor (2.6.19)_

---

**User**

/bmad-help

---

**Cursor**

Now let me scan for existing artifacts to determine what's been completed.

Let me check the readiness report to confirm status.

Hey Kevin! Here's where your **todo-bmad** project stands:

---

## Completed Workflows

| Phase         | Workflow                       | Status                                               |
| ------------- | ------------------------------ | ---------------------------------------------------- |
| 2-planning    | Create PRD                     | Done (`prd.md`)                                      |
| 2-planning    | Validate PRD                   | Done (`validation-report-20260313-165255.md`)        |
| 2-planning    | Create UX                      | Done (`ux-design-specification.md`)                  |
| 3-solutioning | Create Architecture            | Done (`architecture.md`)                             |
| 3-solutioning | Create Epics & Stories         | Done (`epics.md`)                                    |
| 3-solutioning | Check Implementation Readiness | Done (`implementation-readiness-report-20260316.md`) |

Your readiness report came back clean -- **0 critical issues, 0 blockers**. All planning artifacts are aligned and implementation-ready.

---

## What's Next: Phase 4 - Implementation

### Required -- Next Step

**Sprint Planning** (SP)

- Skill: `bmad-bmm-sprint-planning`
- Agent: Bob, 🏃 Scrum Master
- This kicks off implementation by producing a sequenced development plan that the implementation agents will follow story by story.

### After Sprint Planning, the implementation cycle is:

1. **Create Story** (CS) -- `bmad-bmm-create-story` -- Bob, 🏃 Scrum Master _(required)_
   Prepares the next story from the sprint plan with full context for the developer agent.

2. **Validate Story** (VS) -- `bmad-bmm-create-story` (Validate Mode) -- Bob, 🏃 Scrum Master _(optional)_
   Validates story readiness before development begins.

3. **Dev Story** (DS) -- `bmad-bmm-dev-story` -- Amelia, 💻 Developer Agent _(required)_
   Executes the story implementation.

4. **Code Review** (CR) -- `bmad-bmm-code-review` -- Amelia, 💻 Developer Agent _(optional)_
   Reviews code; routes back to Dev Story if fixes are needed, otherwise on to the next story.

5. Repeat from Create Story until the epic is complete, then optionally run **Retrospective** (ER).

---

**Recommendation:** Open a fresh context window and run `bmad-bmm-sprint-planning` to get started. The readiness report also noted one optional suggestion -- consider whether to split Story 1.9 during sprint planning, but it's non-blocking either way.

---

**User**

/bmad-sprint-planning

---

**Cursor**

Now let me load all the inputs required by the workflow.

Now I have everything I need. Let me parse all the epics and stories, then generate the sprint status file.

No existing `sprint-status.yaml` found and no story files in the implementation artifacts folder, so all items start at `backlog` status. Let me create the implementation artifacts directory and write the file.

Now let me validate the file.

All validations pass. Here's the summary, Kevin:

---

## Sprint Status Generated Successfully

- **File Location:** `_bmad-output/implementation-artifacts/sprint-status.yaml`
- **Total Epics:** 4
- **Total Stories:** 19
- **Epics In Progress:** 0
- **Stories Completed:** 0

All statuses are legal and the file structure is valid. Every epic in the epics file is represented, every story has an entry, and every epic has a corresponding retrospective entry.

---

## Next Steps

1. **Review** the generated `sprint-status.yaml` to confirm it looks right
2. **Create the first story** -- open a fresh context window and run `bmad-bmm-create-story` to prepare Story 1.1 (Project Scaffolding & Shared API Contract) for development. Bob the Scrum Master will build the full-context story file.
3. Agents will update statuses in this file as they work through the cycle: **Create Story** -> **Dev Story** -> **Code Review** -> repeat
