
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

// Model definitions with grouping
export type ModelInfo = {
  id: string;
  label: string;
  description?: string;
};

export const FREE_MODELS: ModelInfo[] = [
  { id: 'google/gemini-2.0-flash-exp:free', label: 'Gemini 2.0 Flash', description: 'Fast & capable' },
  { id: 'meta-llama/llama-4-scout:free', label: 'Llama 4 Scout', description: 'Meta\'s latest' },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', label: 'Mistral Small 3.1', description: 'Balanced performance' },
  { id: 'qwen/qwen3-14b:free', label: 'Qwen 3 14B', description: 'Strong reasoning' },
];

export const PAID_MODELS: ModelInfo[] = [
  { id: 'x-ai/grok-4-fast', label: 'Grok 4 Fast', description: 'Best quality' },
  { id: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4', description: 'Excellent reasoning' },
  { id: 'openai/gpt-4.1-mini', label: 'GPT-4.1 Mini', description: 'Fast & affordable' },
  { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash', description: 'Great value' },
];

// Combined flat list for backward compatibility
export const AVAILABLE_MODELS = [...PAID_MODELS, ...FREE_MODELS] as const;

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
  THEME_ID: 100,
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
