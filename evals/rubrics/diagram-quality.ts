// evals/rubrics/diagram-quality.ts

import { z } from 'zod';

export const DIAGRAM_QUALITY_RUBRIC = `You are an expert evaluator assessing diagram quality for a visual summary.

## Your Task

Evaluate whether the diagram is the right choice AND well-executed.

## Section Summary (what the diagram should represent)
<summary>
{{SUMMARY}}
</summary>

## Diagram
You are seeing the rendered diagram image.

## Content-to-Diagram Type Reference

| Content Pattern | Best Diagram Types |
|----------------|-------------------|
| Sequential steps, processes | Linear flow, sequence diagram |
| Decision points, branching logic | Decision tree, flowchart |
| Hierarchies, taxonomies | Tree, hierarchy diagram |
| System components, architecture | Layered diagram, component diagram |
| Cycles, feedback loops | Cycle diagram, circular flow |
| Comparisons, alternatives | Side-by-side layout |
| Cause and effect | Cause-effect chain |
| State transitions | State machine diagram |

## Evaluation Criteria

### 1. Type Appropriateness
Is this the right KIND of diagram for the content?
- What pattern does the summary describe (process, hierarchy, comparison, etc.)?
- Does the diagram type match that pattern?

### 2. Content Accuracy
Does the diagram correctly represent the summary?
- Are the key concepts from the summary present?
- Are relationships/connections accurate?
- Is anything missing or invented?

### 3. Visual Execution
Is the diagram well-constructed?
- Readable labels (not cut off, not overlapping)
- Clean layout (logical flow, not cluttered)
- Appropriate complexity (3-8 elements typically ideal)

### 4. Label Quality
Are labels meaningful?
- Descriptive and specific (good: "Validate Input", "User Authentication")
- NOT generic (bad: "Step 1", "Box A", "Item")

### 5. Value-Add
Does the diagram enhance understanding?
- Adds visual insight beyond just reading the text
- NOT just summary text pasted into boxes

## Scoring (1-5 for each)

| Score | Meaning |
|-------|---------|
| 5 | Excellent - couldn't be better |
| 4 | Good - minor issues |
| 3 | Acceptable - works but has clear problems |
| 2 | Poor - significant issues |
| 1 | Failing - wrong, broken, or useless |

## Response Format

Respond with valid JSON only:
{
  "analysis": {
    "content_pattern": "<process|hierarchy|comparison|cause-effect|cycle|architecture|other>",
    "type_assessment": "<is diagram type appropriate for this pattern?>",
    "accuracy_assessment": "<does diagram match summary content?>",
    "visual_assessment": "<layout, readability observations>",
    "label_assessment": "<are labels meaningful or generic?>",
    "value_assessment": "<does it add understanding beyond text?>"
  },
  "scores": {
    "type_appropriateness": <1-5>,
    "content_accuracy": <1-5>,
    "visual_execution": <1-5>,
    "label_quality": <1-5>,
    "value_add": <1-5>
  },
  "overall": <1-5>,
  "justification": "<1-2 sentence summary>"
}`;

export const DIAGRAM_QUALITY_SCHEMA = z.object({
  analysis: z.object({
    content_pattern: z.string(),
    type_assessment: z.string(),
    accuracy_assessment: z.string(),
    visual_assessment: z.string(),
    label_assessment: z.string(),
    value_assessment: z.string(),
  }),
  scores: z.object({
    type_appropriateness: z.number().min(1).max(5),
    content_accuracy: z.number().min(1).max(5),
    visual_execution: z.number().min(1).max(5),
    label_quality: z.number().min(1).max(5),
    value_add: z.number().min(1).max(5),
  }),
  overall: z.number().min(1).max(5),
  justification: z.string(),
});
