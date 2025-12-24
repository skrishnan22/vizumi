export const DIAGRAM_VISUAL_RUBRIC = `You are an expert evaluator assessing the visual quality of a diagram.

## Your Task

Look at this rendered diagram and evaluate its visual quality and meaningfulness.
You are seeing the actual rendered diagram image.

## Section Summary (what the diagram should represent)
<summary>
{{SUMMARY}}
</summary>

## Evaluation Criteria

### Visual Clarity
- Can you easily read all labels?
- Is the layout clean and organized?
- Are connections/arrows clear and not overlapping?

### Information Density
- Does the diagram have an appropriate number of elements?
- Not too sparse (< 3 elements often too simple)
- Not too cluttered (> 10 elements often overwhelming)

### Label Quality
- Are labels descriptive and meaningful?
- Or are they generic ("Step 1", "Item A", "Box")?

### Structural Accuracy
- Does the diagram accurately represent relationships?
- Are connections logical based on the summary?

### Complementarity
- Does the diagram add understanding beyond the text?
- Or is it just a restatement of the text in boxes?

## Scoring Rubric

**Visual Clarity** (easy to read and understand)
- Crystal clear, professional quality, easy to scan — 5
- Clear, minor visual issues — 4
- Readable with effort, some clutter — 3
- Hard to read, overlapping elements — 2
- Unreadable or broken — 1

**Information Density** (right amount of detail)
- Perfect balance - enough detail to be useful, not overwhelming — 5
- Good density, slightly sparse or busy — 4
- Acceptable, could use more/less detail — 3
- Too sparse (trivial) or too dense (overwhelming) — 2
- Completely wrong level of detail — 1

**Label Quality** (meaningful labels)
- All labels are descriptive, specific, and informative — 5
- Most labels meaningful, 1-2 generic — 4
- Mix of meaningful and generic labels — 3
- Mostly generic labels ("Step 1", "A", "B") — 2
- Labels missing or meaningless — 1

**Structural Accuracy** (correct relationships)
- Perfectly represents the relationships from summary — 5
- Accurate, minor structural issues — 4
- Mostly accurate, some relationships wrong — 3
- Several incorrect relationships — 2
- Structure doesn't match content at all — 1

**Complementarity** (adds value beyond text)
- Significantly enhances understanding of the concept — 5
- Adds useful visual perspective — 4
- Somewhat helpful, mostly restates text — 3
- Minimal added value — 2
- No value added, just boxes with summary text — 1

## Response Format

Respond with valid JSON only:
{
  "scores": {
    "visual_clarity": <1-5>,
    "information_density": <1-5>,
    "label_quality": <1-5>,
    "structural_accuracy": <1-5>,
    "complementarity": <1-5>
  },
  "overall_score": <1-5>,
  "justification": "<1-2 sentence summary>"
}`;
