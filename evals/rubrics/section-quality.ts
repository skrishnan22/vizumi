import { z } from 'zod';

export const SECTION_QUALITY_RUBRIC = `You are an expert evaluator assessing how well content has been chunked into sections.

## Your Task

Evaluate whether the section split is logical, complete, and well-balanced.

## Source Content (with original structure visible)
<source>
{{SOURCE}}
</source>

## Generated Sections
<sections>
{{SECTIONS}}
</sections>

## Evaluation Process

### Step 1: Identify Source Structure
- Count major topics/themes in the source
- Note any natural break points (headers, topic shifts)

### Step 2: Compare to Generated Sections
- Do sections align with natural topic boundaries?
- Is any major topic missing?
- Is any topic awkwardly split across sections?
- Are there redundant sections covering the same thing?

### Step 3: Assess Balance
- Are sections roughly similar in scope/importance?
- Is the number of sections appropriate (not too many, not too few)?

## Scoring Rubric

**Logical Boundaries** (sections break at natural points)
- Every section aligns perfectly with a natural topic boundary — 5
- Good alignment, 1 slightly awkward break — 4
- Adequate, 2-3 sections could be merged or split differently — 3
- Poor alignment, topics split awkwardly — 2
- Random chunking with no logical basis — 1

**Coverage** (all topics represented)
- Every major topic from source has a corresponding section — 5
- All major topics covered, 1 minor topic missing — 4
- Most topics covered, 1 major topic missing — 3
- Several major topics missing — 2
- Most content not represented — 1

**Balance** (sections are similar in scope)
- All sections are similar in scope and importance — 5
- Mostly balanced, 1 section notably larger/smaller — 4
- Some imbalance, 2-3 sections disproportionate — 3
- Significant imbalance — 2
- Completely unbalanced — 1

**No Overlap** (sections are distinct)
- Each section covers distinct content, no redundancy — 5
- Minimal overlap (1-2 minor repeated points) — 4
- Some overlap, 1 topic repeated across sections — 3
- Significant overlap, multiple redundant sections — 2
- Major redundancy, same content in multiple sections — 1

## Response Format

Respond with valid JSON only:
{
  "scores": {
    "logical_boundaries": <1-5>,
    "coverage": <1-5>,
    "balance": <1-5>,
    "no_overlap": <1-5>
  },
  "overall_score": <1-5>,
  "justification": "<1-2 sentence summary>"
}`;

export const SECTION_QUALITY_SCHEMA = z.object({
  scores: z.object({
    logical_boundaries: z.number().min(1).max(5),
    coverage: z.number().min(1).max(5),
    balance: z.number().min(1).max(5),
    no_overlap: z.number().min(1).max(5),
  }),
  overall_score: z.number().min(1).max(5),
  justification: z.string(),
});
