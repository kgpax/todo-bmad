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
