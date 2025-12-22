
export const LLM_MODELS = {
  GENERATION: 'x-ai/grok-code-fast-1',
  D2_FIX: 'openai/gpt-4o-mini',
  DEEP_DIVE: 'x-ai/grok-4.1-fast',
} as const;

// ============================================================================
// Free Tier & Model Preferences
// ============================================================================

export const FREE_TIER_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
] as const;

export type FreeTierModel = (typeof FREE_TIER_MODELS)[number];

export const DEFAULT_MODELS = {
  generate: 'x-ai/grok-4-fast',
  deepDive: 'x-ai/grok-4-fast',
  d2Fix: 'openai/gpt-4o-mini',
} as const;

export type ModelPreferenceKey = keyof typeof DEFAULT_MODELS;

export const HEADERS = {
  API_KEY: 'X-OpenRouter-Key',
  MODEL: 'X-Model',
} as const;

// Available models for user selection
export const AVAILABLE_MODELS = [
  { id: 'x-ai/grok-4-fast', label: 'X-AI Grok 4 Fast' },
  { id: 'openai/gpt-4o-mini', label: 'OpenAI GPT-4o Mini' },
  { id: 'google/gemini-2.5-flash', label: 'Google Gemini 2.5 Flash' },
  { id: 'anthropic/claude-sonnet-4.5', label: 'Anthropic Claude Sonnet 4.5' },
] as const;

// ============================================================================
// API Configuration
// ============================================================================

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
  // Security: Prevent excessive input that could be used for injection or DoS
  MAX_CONTENT_LENGTH: 50000, // ~12k tokens - prevents prompt injection via volume
  MAX_TITLE_LENGTH: 200,
  MAX_SUMMARY_LENGTH: 5000,
  MAX_D2_CODE_LENGTH: 10000,
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
