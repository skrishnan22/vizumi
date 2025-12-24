export const DIAGRAM_RELEVANCE_RUBRIC = `You are an expert evaluator assessing whether the right type of diagram was chosen.

## Your Task

For a given section summary, evaluate if the diagram type is appropriate.

## Section Summary
<summary>
{{SUMMARY}}
</summary>

## Diagram Information
- Visual Type: {{VISUAL_TYPE}}
- D2 Code:
\`\`\`
{{D2_CODE}}
\`\`\`

## Content-to-Diagram Mapping Reference

| Content Pattern | Best Diagram Types |
|----------------|-------------------|
| Sequential steps, processes | Linear flow, sequence diagram |
| Decision points, branching logic | Decision tree, flowchart |
| Hierarchies, taxonomies | Tree, hierarchy diagram |
| System components, architecture | Layered diagram, component diagram |
| Cycles, feedback loops | Cycle diagram, circular flow |
| Comparisons, alternatives | Side-by-side layout, comparison table |
| Cause and effect | Cause-effect chain, fishbone |
| State transitions | State machine diagram |
| Data transformations | Input-process-output diagram |

## Evaluation Process

### Step 1: Identify Content Pattern
What type of information is this summary presenting?
- Process/steps?
- Hierarchy/organization?
- Comparison?
- Cause-effect?
- Conceptual/abstract?

### Step 2: Assess Diagram Type Choice
- Is the chosen diagram type appropriate for this pattern?
- Would a different type be more effective?

### Step 3: Assess Necessity
- Does this content actually benefit from a diagram?
- Or would plain text be sufficient?

## Scoring Rubric

**Type Appropriateness** (right diagram for content)
- Perfect match - diagram type ideally represents the content pattern — 5
- Good match - appropriate type, minor alternatives might work equally well — 4
- Acceptable - works but another type would be better — 3
- Poor match - diagram type doesn't fit the content pattern — 2
- Wrong type - diagram misrepresents the content structure — 1

**Necessity** (diagram adds value)
- Diagram is essential - content is much clearer with visualization — 5
- Diagram helpful - adds meaningful visual structure — 4
- Diagram acceptable - neither helps nor hurts — 3
- Diagram unnecessary - content is simple enough without it — 2
- Diagram distracting - adds confusion, should be omitted — 1

**Content Match** (diagram represents the summary)
- Diagram perfectly captures key concepts from summary — 5
- Diagram captures most key concepts — 4
- Diagram partially represents summary content — 3
- Diagram misses main points of summary — 2
- Diagram is unrelated to summary content — 1

## Response Format

Respond with valid JSON only:
{
  "analysis": {
    "chosen_type_assessment": "<why the type is/isn't appropriate>",
    "necessity_notes": "<why diagram is/isn't needed>"
  },
  "scores": {
    "type_appropriateness": <1-5>,
    "necessity": <1-5>,
    "content_match": <1-5>
  },
  "overall_score": <1-5>,
  "justification": "<1-2 sentence summary>"
}`;
