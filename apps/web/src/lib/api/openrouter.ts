import { createOpenAI } from '@ai-sdk/openai';
import { API_CONFIG } from '@/lib/constants';

const systemApiKey = process.env.OPENROUTER_API_KEY;
const systemClient = systemApiKey
  ? createOpenAI({
    baseURL: API_CONFIG.OPENROUTER_BASE_URL,
    apiKey: systemApiKey,
  })
  : null;

/**
 * Creates an OpenRouter API client for the provided API key
 *
 * For the system API key, returns a pre-created singleton to avoid
 * unnecessary object creation. For BYOK (Bring Your Own Key) users,
 * creates a fresh client each time to avoid unbounded cache growth.
 *
 * @param apiKey - The OpenRouter API key to use for authentication
 * @returns An OpenAI-compatible client configured for OpenRouter
 */
export function createOpenRouterClient(apiKey: string) {

  if (systemClient && apiKey === systemApiKey) {
    return systemClient;
  }


  return createOpenAI({
    baseURL: API_CONFIG.OPENROUTER_BASE_URL,
    apiKey,
  });
}
