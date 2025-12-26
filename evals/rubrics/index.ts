export { SUMMARY_QUALITY_RUBRIC, SUMMARY_QUALITY_SCHEMA } from './summary-quality.js';
export { GROUNDING_RUBRIC, GROUNDING_SCHEMA } from './grounding.js';
export { SECTION_QUALITY_RUBRIC, SECTION_QUALITY_SCHEMA } from './section-quality.js';
export { DIAGRAM_QUALITY_RUBRIC, DIAGRAM_QUALITY_SCHEMA } from './diagram-quality.js';

export const JUDGE_CONFIG = {
  textJudge: {
    model: 'openai/gpt-4o',
    temperature: 0,
    maxRetries: 2,
  },
  visionJudge: {
    model: 'openai/gpt-4o',
    temperature: 0,
    maxRetries: 2,
  },
} as const;
