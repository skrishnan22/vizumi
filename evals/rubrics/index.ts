export { SUMMARY_QUALITY_RUBRIC, SUMMARY_QUALITY_SCHEMA } from './summary-quality.js';
export { GROUNDING_RUBRIC, GROUNDING_SCHEMA } from './grounding.js';
export { SECTION_QUALITY_RUBRIC, SECTION_QUALITY_SCHEMA } from './section-quality.js';
export { DIAGRAM_RELEVANCE_RUBRIC } from './diagram-relevance.js';
export { DIAGRAM_VISUAL_RUBRIC } from './diagram-visual.js';

export const JUDGE_CONFIG = {
  // Text-based judges
  textJudge: {
    model: 'openai/gpt-4o',
    temperature: 0,
    maxRetries: 2,
  },
  visionJudge: {
    model: 'google/gemini-2.5-flash',
    temperature: 0,
    maxRetries: 2,
  },
} as const;
