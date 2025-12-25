// evals/judges/vision-judge.ts

import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { readFile } from 'fs/promises';
import { z } from 'zod';
import { JUDGE_CONFIG } from '../rubrics/index.js';

interface VisionJudgeOptions {
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
 * Call vision-capable LLM judge with text prompt + image and Zod schema
 * Note: Using generateText because generateObject doesn't support multimodal input
 */
export async function callVisionJudge<T extends z.ZodTypeAny>(
  textPrompt: string,
  imagePath: string,
  schema: T,
  options: VisionJudgeOptions = {}
): Promise<z.infer<T>> {
  const {
    maxRetries = JUDGE_CONFIG.visionJudge.maxRetries,
    temperature = JUDGE_CONFIG.visionJudge.temperature,
  } = options;

  const openrouter = getOpenRouterClient();

  async function encodeImageToBase64(imagePath: string): Promise<string> {
    const imageBuffer = await readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    return `data:image/jpeg;base64,${base64Image}`;
  }

  // Read image file as Uint8Array for the AI SDK
  // const imageBuffer = await readFile(imagePath);
  // const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
  const image = encodeImageToBase64(imagePath);
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await generateText({
        model: openrouter(JUDGE_CONFIG.visionJudge.model),
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: textPrompt },
              {
                type: 'image',
                image: image,
              },
            ],
          },
        ],
        temperature,
      });

      // Parse and validate JSON response
      const parsed = JSON.parse(result.text);
      const validated = schema.parse(parsed);
      return validated as z.infer<T>;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        console.log(`    ⚠️  Vision judge retry ${attempt}/${maxRetries}: ${lastError.message}`);
        await sleep(1000 * attempt);
      }
    }
  }

  throw new Error(`Vision judge failed after ${maxRetries} attempts: ${lastError?.message}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
