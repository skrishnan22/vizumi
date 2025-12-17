import { HEADERS, DEFAULT_MODELS, ModelPreferenceKey } from '@/lib/constants';
import { createOpenRouterClient } from './openrouter';

/**
 * Extract API key from request (user's key or system fallback)
 *
 * @throws Error if no API key is available
 */
export function getApiKey(request: Request): string {
  const userKey = request.headers.get(HEADERS.API_KEY);
  if (userKey) return userKey;

  const systemKey = process.env.OPENROUTER_API_KEY;
  if (!systemKey) {
    throw new Error('No API key available - missing OPENROUTER_API_KEY environment variable');
  }
  return systemKey;
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
