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
