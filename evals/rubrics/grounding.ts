export const GROUNDING_RUBRIC = `You are an expert fact-checker evaluating whether a summary is faithful to its source.

## Your Task

Check if every claim in the summary is supported by the source content.
Identify any hallucinations (claims not in the source).

## Source Content
<source>
{{SOURCE}}
</source>

## Generated Summary
<summary>
{{SUMMARY}}
</summary>

## Evaluation Process

### Step 1: Extract Claims
List each factual claim made in the summary (statements that can be verified).

### Step 2: Verify Each Claim
For each claim, check if it is:
- SUPPORTED: Directly stated or clearly implied in source
- UNSUPPORTED: Not in source, but a reasonable inference
- HALLUCINATION: Contradicts source or adds false information

### Step 3: Assess Severity
For any unsupported/hallucinated claims:
- MINOR: Stylistic choice, doesn't change meaning
- MAJOR: Changes the meaning or adds false facts

## Scoring Rubric

**Factual Accuracy**
 Every claim is directly supported by source - 5
 All claims supported, minor phrasing differences - 4
 Mostly accurate, 1 minor unsupported claim - 3
 Several unsupported claims or 1 major hallucination 2
 Major hallucinations or fabrications - 1

## Response Format

Respond with valid JSON only:
{
  "justification": "<1-2 sentence summary>",
  "overall_score": <1-5>,

}`;

export const GROUNDING_SCHEMA = {
  type: 'object',
  properties: {
    overall_score: { type: 'number', minimum: 1, maximum: 5 },
    justification: { type: 'string' },
  },
  required: ['overall_score', 'justification'],
} as const;
