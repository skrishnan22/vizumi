// evals/judges/vision-judge.ts

import { readFile } from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { JUDGE_CONFIG } from '../rubrics/index.js';

interface VisionJudgeOptions {
  maxRetries?: number;
  temperature?: number;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

/**
 * Call vision-capable LLM judge with text prompt + image and Zod schema
 * Uses direct OpenRouter API for proper multimodal support
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

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(
      'OPENROUTER_API_KEY is missing. Set it in .env.local or environment variables.'
    );
  }

  // Read and encode image as base64 data URL
  const imageBuffer = await readFile(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: JUDGE_CONFIG.visionJudge.model,
          temperature,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: textPrompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: dataUrl,
                  },
                },
              ],
            },
          ],
        }),
      });

      const data: OpenRouterResponse = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || `OpenRouter API error: ${response.status}`);
      }

      const content = data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in response');
      }

      // Parse and validate JSON response (strip markdown code blocks if present)
      const jsonStr = extractJson(content);
      const parsed = JSON.parse(jsonStr);
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

/**
 * Strip markdown code blocks from LLM response
 */
function extractJson(content: string): string {
  // Remove ```json ... ``` or ``` ... ``` wrappers
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  return content.trim();
}
