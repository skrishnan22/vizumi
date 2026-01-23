import { HEADERS, DEFAULT_MODELS, type ModelPreferenceKey } from '@/lib/constants';
import { createOpenRouterClient } from './openrouter';
import { env } from '@/env';

/**
 * Extract API key from request (user's key or system fallback)
 */
export function getApiKey(request: Request): string {
  const userKey = request.headers.get(HEADERS.API_KEY);
  if (userKey) return userKey;

  return env.OPENROUTER_API_KEY;
}

/**
 * Extract model from request header or use default for the feature
 */
export function getModel(request: Request, feature: ModelPreferenceKey): string {
  const headerModel = request.headers.get(HEADERS.MODEL);
  return headerModel || DEFAULT_MODELS[feature];
}

/**
 * Create OpenRouter client from request
 * Uses user's key if provided, otherwise falls back to system key
 */
export function getOpenRouterClient(request: Request) {
  const apiKey = getApiKey(request);
  return createOpenRouterClient(apiKey);
}
