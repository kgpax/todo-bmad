# Notes

## `/bmad-create-prd`

**Model used:** Opus 4.6

- It found my `requirements.md` document and asked me if (a) I want to use that as input and (b) whether I have any other supporting documentation it should include.
- It recognised that the system to build was of low complexity with no industry regulatory or compliance considerations
- I told it that I wanted SSG rather than SPA
- It asked my goals (e.g. "why a TODO app, there are hundreds of them?"), so I was clear that this is an experiment working with bmad
- I decided to have a look at the advanced elicitation features just out of curiosity, but nothing there felt relevant at this stage.
- I had to tell it not to overfocus on the "testing bmad workflow" motivation so that it can focus solely on the product output
- I like how they humanise the user journeys
- I skipped the "domain-specific" and "innovation" steps as it identified that there was little to no need for it given the simplicstic requirements
- At one point it was talking about referencing a web_app CSV, so I had to ask what that was (turns out it's a `project-types.csv` file in the bmad folders which hints at considerations for different types of application). I felt it was a bit of an abstraction leak to talk about a CSV file that I hadn't prompted it with.
- After it listed the NFRs, I noticed that we hadn't discussed security so I asked it to ensure that we consider XSS and other injection attack vectors as part of NFR.
- I liked how it re-reviewed the entire PRD at the end to find duplicatations and contradictions and addressed them automatically.
- At the end, I switched model (from Opus 4.6 to GPT-5.4) and asked it to validate the PRD

**Conclusion:** This was quite an enjoyable experience and not as long or "document heavy" as I had feared, although much of that is probably owing to the simplicity of the requirement

## `/bmad-validate-prd`

**Model used:** GPT-5.4

- It picked up on nuances such as the lack of definition or mention of:
  - Caching strategies & request size criteria
  - Focus indicator criteria
  - Lack of verification method for security related NFRs
- The concern is that many of the requirements were not measurable or testable enough for downstream bmad workflows
- I was presented with the options to review detailed findins, use the edit workflow for systematic improvements or fix the simple items immediately
  - I started with the latter - it seemed to shore up the main "measurability" gaps that it raised concerns with
- I realised at the end that I forgot to start a new chat session for this, meaning that the previous context was all still present. I wish bmad automatically forced (or encouraged) a clean session when using new personas and workflows.
- After it had updated the PRD, it didn't prompt me for the next stage - I had to ask it "what happens next?"

**Conclusion:** I'm glad I ran this (optional) step - it probably helped that a different model was used to capture areas which the same model might have missed

## `/bmad-create-ux-design`

**Model:** Opus 4.6

- I triggered this optional step as I was curious about what I could define with it, given that I have no design mockups
- It once again asked me whether I have any additional documentation I would like to include
- I told it that I wanted aesthetically pleasing visuals incorporating animations and transitions on interaction, and that given the minimal nature of the UI, I want what little we do have to look and feel stunning
- In this instance, it showed me as a preview in the agent chat what it would like to write into the ux document, vs actually just writing it; this was different to before, and was annoying as it had no word-wrap and I had to scroll horizontally to read most of the content
- I really like how it is able to articulate a great sounding plan from small amounts of guidance
- It probed about the emotional tone of the aesthetics, offering different options for how motion is presented
- As somebody who is keen about UX and design (without necessarily being creative enough), I enjoyed being able to direct this part of the planning phase
- When it proposed accent colours and possible alternatives, I asked if that would be something easy to change at a later stage; the first time I asked about potentially deferring a decision
- IT CREATES HTML MOCKUPS TO REVIEW AND SELECT FROM!!!!
- I told it what design direction I preferred but indicated that I wanted to include an aspect from another one. I was expecting it to re-jig my preferred design to show me how that would look, but it just went ahead and wrote up my choices without altering the design options. Maybe that's how it works, or maybe I should have been explicit about wanting to see how that looked
- When mapping out the journeys, it failed to "complete" one of the mermaid diagrams, so I had to prompt it to try again (which took a few times to realise that an apostrophe was causing the diagram code to be invalid)
- I had to push it to not rely on CI for its testing strategy, instead asking that all testing can be performed locally

**Conclusion:** This step was much more involved than I was expecting, but it was enjoyable for me. I'm surprised that this is optional, given how much more guidance and clarity has been established here.

## `/bmad-create-architecture`

**Model:** Opus 4.6

- When it came to technology stack, I indicated preferences for the FE but that I had a lower level of experience and expertise in BE and database technologies.
  - I stated that my requirements were that the chosen technologies were easily portable (i.e., didn't require to be cloud-hosted) and easily testable
- It wanted to perform web searches to understand the latest versions of frameworks and to compare different options against each other, but at this stage it seemed to have gotten itself stuck
  - I told it to try and resume, but it took that as my rejecting its request to search the web
  - As it happens, the recommendations it made based on its built-in knowledge were good enough, but it does seem that failure recovery isn't a very good experience
- When it presented the proposed database schema, it suggested a 1,024 character limit for the todo text. I suggested that we should only need 128 characters and asked it to update _all_ documentation around that, to see if it would correct any contradictory statements in the PRD
  - Interestingly, it doesn't update it itself but it does flag in the architecture doc that this needs updating in the PRD... I wonder when that gets picked up on?
- The proposed frontend strategy was to staticly render an empty (skeleton loader) UI and the load the todo's via client-side hydration, since I requested SSG. After reading this back, I decided that I would instead like to fetch todos on the server instead and serve them in the static HTML. The agent identified that this would be a shift to Next.js with ISR instead of SSG, so I asked it to make that change
- Along a similar line, I asked it to drop the requirement for "optimistic updates" since I figured that this was overly complex for the MVP of such a simple app
- After requesting changes to the above requirements, I asked again if it can update the PRD and other documents to reflect these changes, and this time it seemed to start doing them
  - It was quite nice to be able to review them as diffs in the markdown files

**Conclusion:** Going through this step and having the technicalities of the decisions I'd made so far played back to me allowed me to adjust some of the expectations, and it was nice to see how well the agent handled those changes. It also goes to show how easy it would be for a change in requirements even at this stage to lead to conflicting information in the documentation produced so far.

## `/bmad-create-epics-and-stories`

**Model:** Opus 4.6

- Whilst the epic breakdown was good, I felt that the story breakdown packed too much into the "setup" stories
  - I asked that the monorepo setup, BE scaffolding and FE scaffoling work be split into their own stories and not also include the delivery of BE API endpoints or FE components
- I tried to guide the agent to ensuring that story output (i.e., the PRs) were small and focussed on a single concern (app scaffolding, BE API creation or FE component creation)
- This is where the wall of text hits hard
- For the UI related stories, I had to ask the agent to ensure that E2E and animations were done as part of the relevant stories rather than being a specific story after the others
  - The agent kept on trying to bundle the E2E work all together as part of a single story

**Conclusion:** This felt like the stage to pay the most attention to, as it helps inform how the development PRs and testing capabilities will look due to my describing how to split and organise the work.

## `/bmad-check-implementation-readiness`

**Model:** Opus 4.6

- Four issues found (none critical)
  - One major (but non-blocking) finding related to story 1.9 being quite large, but having looked at it I didn't see much value in splitting it

**Conclusion:** Not much to do for this step, although it was good to know that the implementation plan done so far has been deemed in good shape.

## `/bmad-sprint-planning`

**Model:** Opus 4.6

- Not much to say on this one; it created the `sprint-status.yaml` file

**Conclusion:** N/A

## `/bmad-create-story`

**Model:** Opus 4.6

- After it created the first story, I asked whether we need to specify that each story be implemented in its own branch
  - It suggested the creation of a `project-context.md` file where such constitutional rules can be applied
- Interestingly, the story called for using Zod v4 whereas the architecture doc originally specified Zod v3
  - I think this is because it used the internet to research Zod during the `bmad-create-story` step and it was not able to do that (for whatever reason) during `bmad-create-architecture`
  - This goes to show how important it is to allow it to find current documentation beyond its own knowledge cut-off date
- I asked the architect agent to update the architecture document to reflect Zod v4, and asked the scrum master agent to re-update the story

**Conclusion:** Nothing particularly special here, although I did use the opportunity to talk directly to specific agents using `@architect` and `@sm`

## `/bmad-dev-story`

**Model:** Sonnet 4.6

- Nothing really to comment on here; feels like this agent just implemented what the scrum master had defined in the `bmad-create-story` step
- Whilst most of the things it did without having to ask permission (presumably because I allow-listed most of it), any `npx` commands had to be manually approved each time. I guess this make sense from a security perspective, but it does mean that you can't leave this kind of "firsttime setup heavy" thing running in the background
- When creating the frontend, it seeme to get confused and tried to create it twice, forcing it to delete the directory and then recreate it
- When installing `shadcn` it got stuck because the installation used an interactive prompt which it was just left hanging on; it did eventually realise this and opted to install it more manually
- After having asked during architecture for all of the boilerplate "default starter template" files to be removed from the frontend, it had left in all of the `.svg` files, so I had to ask it remove them explicitly
- When I ran `npm test`, I got an error in the backend because there were no tests to run; I pointed it to the error to see what it could do
- I asked it to write a suitable PR description which I could copy and use for teh PR

**Conclusion:** It was interesting watching it go through the development process and to see how many times it either got a little stuck or had to iterate on things, but for the most part it was able to complete the whole story without intervention. A couple of times I had to prompt it to do something afterwards.

## `/bmad-code-review`

**Model:** Opus 4.6

- It picked up on a few medium issues
  - Changes made outside of the original story (e.g., the bits I asked it to do)
  - Inconsistency in package nameing `frontent` vs `@todo-bmad/backend`
  - Incomplete file list in story due to files that I had manually added like `README.md`
- I also asked it to remove the `test:e2e` script since we don't have `playwright` yet

**Conclusion:** Useful to have a different model run another pair of eyes over the code; I'm not sure I would have spotted the `frontend` vs `@todo-bmad/backend` inconsistency

## Iteratively running `/mbad-create-story`, `/bmad-dev-story` and `/bmad-code-review` for remaning stories

**Model:** Opus 4.6 for creating story and code review, Sonnet 4.6 for implementation

- Had to prompt a little to guide test structure, moving common setup/teardown logic to `beforeEach` and `afterEach`
- It had a problem getting the CORS tests to pass, and iterated on this quite extensivley and fixed itself without the need for intervention
- When manually running `npm run dev`, I got errors starting the frontend app that were not picked up in any tests; had to ask that a test be written which could assert the FE was running correctly
  - It wrote a unit test which didn't work because of sandboxing, and then it wrote a custom script to test that the page was accessible
  - None of this was working reliably, so I asked it to write a playwright test instead
- It had a really big problem resolving some node modules being used by the global CSS (presumably used by tailwindcss)
  - For these, I had to intervene and manually run the dev server and then tell it the error messages, as it wasn't doing a very good job of running the server and getting the error messages itself
  - It was a long-running game of whack-a-mole; every time it addressed a node module, it would reveal another one it couldn't find
  - I opted to move away from Turbopack (which I always seem to have problems with) and using Webpack instead
    - It started to hallucinate the correct way to do that :(
- There were perpetual problems running e2e tests in the sandbox, so I asked the agent to add a note to `project-context.md` to tell it to run them outside of the sandbox
  - Despite this rule, subsequent dev agents would fail to run the e2e tests because they tried to run it in a sandbox
  - I asked the agent to harden this constraint in `project-context.md`, and it tried to push it to being a manual user step
  - I told the agent that the running of e2e tests outside of a sandbox should be a requirement component of the DoD
- In story 1-6, it failed to create and switch to a branch... something that was done without fail in other stories up to that point. I only caught it just prior to committing
  - It goes to show how the non-determinism of agents means that we can't get too complacent when watching them work
  - I asked it to ensure that this critical step is not missed again... let's see how that goes
- After a couple of frontend stories, I realised that linting was not a part of the DoD, so I added it
  - This picked up on a linting issue related to random messages causing unstable server render/client hydration HTML

**Conclusion:** This was the most involved I got. Most stories were implemented without problem, but there were some technical issues with module resolution and network permissions within the sandbox which really got the agent stuck
