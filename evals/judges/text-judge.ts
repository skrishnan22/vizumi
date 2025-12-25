// evals/judges/text-judge.ts

import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { JUDGE_CONFIG } from '../rubrics/index.js';

interface JudgeOptions {
  maxRetries?: number;
  temperature?: number;
}

function getOpenRouterClient() {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(
      'OPENROUTER_API_KEY is missing. Set it in .env.local or environment variables.'
    );
  }

  return createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
  });
}

/**
 * Call text-based LLM judge with rubric and Zod schema
 */
export async function callTextJudge<T extends z.ZodTypeAny>(
  prompt: string,
  schema: T,
  options: JudgeOptions = {}
): Promise<z.infer<T>> {
  const {
    maxRetries = JUDGE_CONFIG.textJudge.maxRetries,
    temperature = JUDGE_CONFIG.textJudge.temperature,
  } = options;

  const openrouter = getOpenRouterClient();

  const result = await generateObject({
    model: openrouter(JUDGE_CONFIG.textJudge.model),
    schema,
    prompt,
    temperature,
    maxRetries,
  });

  return result.object;
}
