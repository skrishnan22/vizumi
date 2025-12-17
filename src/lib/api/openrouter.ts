import { createOpenAI } from '@ai-sdk/openai';
import { API_CONFIG } from '@/lib/constants';

// Cache to store client instances keyed by API key
const clientCache = new Map<string, ReturnType<typeof createOpenAI>>();

/**
 * Creates or retrieves a cached OpenRouter API client for the provided API key
 *
 * Uses a singleton pattern - multiple calls with the same API key will return
 * the same client instance, avoiding unnecessary object creation.
 *
 * @param apiKey - The OpenRouter API key to use for authentication
 * @returns An OpenAI-compatible client configured for OpenRouter
 */
export function createOpenRouterClient(apiKey: string) {
  const cacheKey = apiKey;

  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey)!;
  }

  const client = createOpenAI({
    baseURL: API_CONFIG.OPENROUTER_BASE_URL,
    apiKey,
  });

  clientCache.set(cacheKey, client);
  return client;
}
