import { z } from 'zod';

export const SUMMARY_QUALITY_RUBRIC = `You are an expert evaluator assessing AI-generated summaries.

## Your Task

Evaluate the quality of a generated summary compared to its source content.
Use chain-of-thought reasoning: analyze first, then score.

## Source Content
<source>
{{SOURCE}}
</source>

## Generated Summary (All Sections Combined)
<summary>
{{SUMMARY}}
</summary>

## Evaluation Process

### Step 1: Analyze Coherence
- Read through the summary sections in order
- Check if ideas flow logically from one section to the next
- Note any abrupt transitions or disconnected sections

### Step 2: Analyze Completeness
- Identify the 5-7 main points from the source
- Check which are present in the summary
- Note any significant omissions

### Step 3: Analyze Conciseness
- Compare summary length to source length
- Check for redundancy or unnecessary elaboration
- Check for overly terse sections that lose meaning

### Step 4: Analyze Clarity
- Read as if you don't know the source material
- Note any confusing phrasing or jargon without explanation
- Check if key terms are defined when needed

## Scoring Rubric

**Coherence** (logical flow and structure)
- Excellent flow; clear organization; sections build naturally —  5
- Good structure; minor awkward transitions —  4
- Adequate; some organizational issues or disconnected sections —  3
- Disjointed; hard to follow the thread —  2
- Incoherent; sections seem randomly ordered —  1

**Completeness** (coverage of key points)
- Captures all major points from source —  5
- Covers most key points; 1 minor omission —  4
- Covers main idea; misses 2-3 important details —  3
- Significant omissions; misses major points —  2
- Misses the main point entirely —  1

**Conciseness** (appropriate length and density)
- Perfect length; no fluff; no missing essentials —  5
- Good length; slight verbosity or terseness —  4
- Acceptable; could be ~20% tighter or more detailed —  3
- Too verbose (50%+ padding) or too brief (missing context) —  2
- Extremely bloated or skeletal —  1

**Clarity** (ease of understanding)
- Crystal clear; easy to understand without source —  5
- Clear; 1-2 minor ambiguities —  4
- Understandable with some effort —  3
- Confusing language; unclear explanations —  2
- Incomprehensible without reading source —  1

## Response Format

Respond with valid JSON only:
{
  "scores": {
    "coherence": <1-5>,
    "completeness": <1-5>,
    "conciseness": <1-5>,
    "clarity": <1-5>
  },
  "overall_score": <1-5>,
  "justification": "<1-2 sentence summary>"
}`;

export const SUMMARY_QUALITY_SCHEMA = z.object({
  scores: z.object({
    coherence: z.number().min(1).max(5),
    completeness: z.number().min(1).max(5),
    conciseness: z.number().min(1).max(5),
    clarity: z.number().min(1).max(5),
  }),
  overall_score: z.number().min(1).max(5),
  justification: z.string(),
});
