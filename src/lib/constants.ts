
export const LLM_MODELS = {
  GENERATION: 'x-ai/grok-code-fast-1',
  D2_FIX: 'openai/gpt-4o-mini',
  DEEP_DIVE: 'x-ai/grok-4.1-fast',
} as const;


export const API_CONFIG = {
  OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
} as const;

export const TIMEOUTS = {
  D2_FIX_MS: 10000,
} as const;

export const MAX_DURATIONS_SECS = {
  GENERATE: 60,
  RENDER_D2: 30,
  DEEP_DIVE: 60,
} as const;

export const LIMITS = {
  MAX_D2_FIX_ATTEMPTS: 2,
  MAX_URL_CONTENT_SIZE: 5 * 1024 * 1024,
} as const;

export const D2_CONFIG = {
  PADDING: 24,
  THEME_ID: 101,
  SKETCH_MODE: true,
  NO_XML_TAG: true,
  STROKE_WIDTH: 2,
  STROKE_COLOR: '#1e1e1e',
  FILL_PATTERN: 'lines',
} as const;

export const D2_THEME_COLORS = [
  '#ffec99', // Yellow/Orange - Warm
  '#a5d8ff', // Blue - Cool
  '#b2f2bb', // Green - Nature
  '#ffc9c9', // Red/Pink - Urgent
  '#e5dbff', // Purple - Mystic
] as const;

export const FEATURE_FLAGS = {
  USE_ENHANCED_PROMPT: true,
} as const;

export const EVAL_CONFIG = {
  CONCURRENCY: 10,
  MAX_RETRIES: 5,
  D2_CONCURRENCY: 1,
} as const;
