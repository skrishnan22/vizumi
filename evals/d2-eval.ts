import path from 'path';
import fs from 'fs/promises';

import { LLMNoteSchema, ReflectionSchema, type LLMNote } from '../src/lib/schemas.js';
import { z } from 'zod';
import {
  SYSTEM_PROMPT,
  SYSTEM_PROMPT_2,
  SYSTEM_PROMPT_3,
  REFLECTION_PROMPT,
} from '../src/lib/prompts.js';
import { SYSTEM_PROMPT_OPTIMIZED } from '../src/lib/prompts-optimized.js';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import dotenv from 'dotenv';
import { renderD2ToSvg } from '../src/lib/d2.js';
import pLimit from 'p-limit';
// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });


console.log("OPENROUTER_API_KEY", process.env.OPENROUTER_API_KEY);
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

type SystemPromptConfig = {
  id: string;
  text: string;
};

type EvalConfig = {
  contentDir: string;
  prompts: SystemPromptConfig[];
  models: string[];
  outputPath: string;
};

type ContentItem = {
  id: string;
  filePath: string;
  text: string;
};

type EvalIterationMetadata = {
  contentId: string;
  promptId: string;
  modelId: string;
};

type EvalIterationResult = {
  metadata: EvalIterationMetadata;
  // rawResponse: string;
  jsonParsed: boolean;
  jsonParseError?: string;
  schemaValidated: boolean;
  schemaError?: string;
  parsedValue?: LLMNote;
  d2Checks: D2DiagramCheck[];
  timestamp: string;
};

type D2DiagramCheck = {
  blockId: string;
  title: string;
  visualType: string;
  success: boolean;
  error?: string;
  d2Code?: string;
};

const SYSTEM_PROMPTS: SystemPromptConfig[] = [
  { id: 'prompt_v1', text: SYSTEM_PROMPT },
  { id: 'prompt_v2', text: SYSTEM_PROMPT_OPTIMIZED },
  { id: 'prompt_v3', text: SYSTEM_PROMPT_3 },
];

const DEFAULT_MODELS = [
  'x-ai/grok-4.1-fast:free',
  // 'openai/gpt-oss-20b:free',
  "openai/gpt-4o-mini",
  "z-ai/glm-4.5-air:free",
  "google/gemini-2.5-flash-lite",
  "moonshotai/kimi-k2-thinking",
  "deepseek/deepseek-chat-v3.1"

];

const CONFIG: EvalConfig = {
  contentDir: path.join(process.cwd(), 'evals', 'datasets'),
  prompts: SYSTEM_PROMPTS,
  models: DEFAULT_MODELS,
  outputPath: path.join(process.cwd(), 'evals', 'results', 'd2-eval.jsonl'),
};

async function loadContentItems(contentDir: string): Promise<ContentItem[]> {
  const entries = await fs.readdir(contentDir);
  const markdownEntries = entries.filter((entry) => entry.endsWith('.md'));

  const items = await Promise.all(
    markdownEntries.map(async (filename) => {
      const filePath = path.join(contentDir, filename);
      const text = await fs.readFile(filePath, 'utf-8');
      const id = path.basename(filename, path.extname(filename));
      return { id, filePath, text };
    }),
  );

  if (items.length === 0) {
    console.warn(
      `No markdown files found in ${contentDir}. Add dataset files before running evaluations.`,
    );
  }

  return items;
}


async function generateNotes(
  _metadata: EvalIterationMetadata,
  content: string,
  prompt: string,
  model: string,
  dryRun: boolean,
  useReflection: boolean,
  index: number,
  total: number,
): Promise<string> {
  if (dryRun) {
    // TODO: Replace this placeholder with a real call to the model client.
    const mock = {
      blocks: [
        {
          id: 'block-1',
          title: 'Placeholder block',
          summary: 'This is a mock summary for content length ' + content.length,
          visualType: 'diagram',
          d2Code: 'x -> y',
        },
      ],
      _debugPromptPrefix: prompt.slice(0, 16),
    };

    return JSON.stringify(mock);
  }

  try {
    const firstPass = await generateObject({
      model: openrouter(model),
      schema: LLMNoteSchema,
      system: prompt,
      prompt: `Here is the text to process:\n\n${content}`,
      maxRetries: 5,
    });

    const initialNotes = firstPass.object;

    if (!useReflection) {
      return JSON.stringify(initialNotes);
    }

    console.log(`[${index + 1}/${total}] Applying reflection...`);
    return await applyReflection(initialNotes, model, index, total);
  } catch (error) {
    console.error('Error generating notes:', error);
    throw error;
  }
}

async function applyReflection(initialNotes: LLMNote, model: string, index: number, total: number): Promise<string> {
  const d2Limit = pLimit(1);

  await Promise.all(
    initialNotes.blocks.map((block) =>
      d2Limit(async () => {
        if (block.d2Code) {
          try {
            const check = await renderD2ToSvg(block.d2Code);
            if (!check.ok) {
              // Inject error into the block for the LLM to see
              block.__d2_error__ = check.error;
            }
          } catch (e) {
            block.__d2_error__ = `validation error: ${e}`;
          }
        }
      })
    )
  );

  // 3. Reflection Pass
  // Filter to only blocks with errors to save tokens
  const blocksWithErrors = initialNotes.blocks.filter((b: any) => b.__d2_error__);

  if (blocksWithErrors.length === 0) {
    // console.log('  > No D2 errors found, skipping reflection.');
    return JSON.stringify(initialNotes);
  }

  // console.log(`  > Reflection pass on ${blocksWithErrors.length} blocks...`);

  // Only pass the JSON with injected errors, NO original content
  const reflectionInput = `
GENERATED NOTES (Partial Draft - Only blocks with errors):
${JSON.stringify({ blocks: blocksWithErrors }, null, 2)}
`;
  console.log(`[${index + 1}/${total}] Reflection input:\n${reflectionInput}`);
  const secondPass = await generateObject({
    model: openrouter(model),
    schema: ReflectionSchema,
    system: REFLECTION_PROMPT,
    prompt: reflectionInput,
    maxRetries: 5,
  });

  const corrections = secondPass.object.corrections;
  console.log(`[${index + 1}/${total}] Reflection output:\n${JSON.stringify(corrections, null, 2)}`);
  // Merge corrections back into initialNotes
  if (corrections.length > 0) {
    // Create a map for faster lookup
    const correctionMap = new Map(corrections.map(c => [c.blockId, c]));

    initialNotes.blocks = initialNotes.blocks.map(block => {
      const correction = correctionMap.get(block.id);
      if (correction) {

        return {
          ...block,
          d2Code: correction.d2Code,
          visualType: correction.visualType || block.visualType,
          // Remove the error field since it's theoretically fixed
          __d2_error__: undefined
        };
      }
      return block;
    });
  }

  return JSON.stringify(initialNotes);
}


function validateLLMResponse(raw: string): {
  jsonParsed: boolean;
  jsonParseError?: string;
  schemaValidated: boolean;
  schemaError?: string;
  value?: LLMNote;
} {
  try {
    const json = JSON.parse(raw);
    const parsed = LLMNoteSchema.safeParse(json);

    if (!parsed.success) {
      return {
        jsonParsed: true,
        schemaValidated: false,
        schemaError: parsed.error.message,
      };
    }

    return {
      jsonParsed: true,
      schemaValidated: true,
      value: parsed.data,
    };
  } catch (error) {
    return {
      jsonParsed: false,
      schemaValidated: false,
      jsonParseError:
        error instanceof Error ? error.message : 'Unknown parse error',
    };
  }
}

async function evaluateD2Diagrams(index: number, total: number, note?: LLMNote,): Promise<D2DiagramCheck[]> {
  if (!note) {
    return [];
  }

  console.log(`[${index + 1}/${total}] Evaluating D2 diagrams`);

  const diagramBlocks = note.blocks.filter(
    (block) => block.visualType === 'diagram',
  );
  const results: D2DiagramCheck[] = [];

  for (const block of diagramBlocks) {
    const code = block.d2Code?.trim();

    if (!code) {
      results.push({
        blockId: block.id,
        title: block.title,
        visualType: block.visualType,
        success: false,
        error: 'Missing d2Code for diagram block.',
      });
      continue;
    }

    const renderResult = await renderD2ToSvg(code);

    if (renderResult.ok) {
      results.push({
        blockId: block.id,
        title: block.title,
        visualType: block.visualType,
        success: true,
      });
    } else {
      results.push({
        blockId: block.id,
        title: block.title,
        visualType: block.visualType,
        success: false,
        error: renderResult.error,
        d2Code: block.d2Code,
      });
    }
  }

  return results;
}


async function appendResult(
  result: EvalIterationResult,
  outputPath: string,
) {
  await fs.appendFile(outputPath, `${JSON.stringify(result)}\n`, 'utf-8');
}

const EvalIterationResultSchema = z.object({
  metadata: z.object({
    contentId: z.string(),
    promptId: z.string(),
    modelId: z.string(),
  }),
});

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as NodeJS.ErrnoException).code === 'string'
  );
}

async function loadCompletedSignatures(outputPath: string): Promise<Set<string>> {
  const signatures = new Set<string>();
  try {
    const content = await fs.readFile(outputPath, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim());
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        const result = EvalIterationResultSchema.safeParse(json);

        if (result.success) {
          const { metadata } = result.data;
          const signature = `${metadata.contentId}|${metadata.promptId}|${metadata.modelId}`;
          signatures.add(signature);
        } else {
          console.warn('Skipping invalid line in results file:', result.error.message);
        }
      } catch (e) {
        console.warn('Failed to parse line in output file:', e);
      }
    }
  } catch (error) {
    if (isErrnoException(error) && error.code === 'ENOENT') {

      return signatures;
    }
    console.warn('Error reading existing results:', error);
  }
  return signatures;
}


async function run() {
  const dryRun = process.argv.includes('--dry-run');
  const useReflection = process.argv.includes('--reflection');
  const concurrency = 10;

  console.log('Starting D2 evaluation harness');
  console.log('Eval config:', {
    contentDir: CONFIG.contentDir,
    promptCount: CONFIG.prompts.length,
    modelCount: CONFIG.models.length,
    outputPath: CONFIG.outputPath,
    dryRun,
    useReflection,
    concurrency,
  });

  const contentItems = await loadContentItems(CONFIG.contentDir);

  if (contentItems.length === 0) {
    console.warn('No content items to evaluate. Exiting early.');
    return;
  }

  // Clear/create output file
  await fs.mkdir(path.dirname(CONFIG.outputPath), { recursive: true });
  // await fs.writeFile(CONFIG.outputPath, '', 'utf-8'); // REMOVED: Do not clear file to allow resuming

  const completedSignatures = await loadCompletedSignatures(CONFIG.outputPath);
  if (completedSignatures.size > 0) {
    console.log(`Found ${completedSignatures.size} completed jobs in ${CONFIG.outputPath}. Resuming...`);
  }

  // Flatten jobs into array
  type Job = {
    content: ContentItem;
    prompt: SystemPromptConfig;
    model: string;
  };

  const jobs: Job[] = [];
  for (const content of contentItems) {
    for (const prompt of CONFIG.prompts) {
      for (const model of CONFIG.models) {
        const signature = `${content.id}|${prompt.id}|${model}`;
        if (completedSignatures.has(signature)) {
          continue;
        }
        jobs.push({ content, prompt, model });
      }
    }
  }

  console.log(`Total jobs: ${jobs.length}`);

  const limit = pLimit(concurrency);
  const d2Limit = pLimit(1);

  const promises = [];
  for (let index = 0; index < jobs.length; index++) {
    const job = jobs[index];
    promises.push(
      limit(async () => {
        const metadata = {
          contentId: job.content.id,
          promptId: job.prompt.id,
          modelId: job.model,
        };

        console.log(
          `[${index + 1}/${jobs.length}] Evaluating content=${metadata.contentId} prompt=${metadata.promptId} model=${metadata.modelId}`,
        );

        try {
          const rawResponse = await generateNotes(
            metadata,
            job.content.text,
            job.prompt.text,
            job.model,
            dryRun,
            useReflection,
            index,
            jobs.length,
          );

          const validation = validateLLMResponse(rawResponse);
          const d2Checks = await d2Limit(() => evaluateD2Diagrams(index, jobs.length, validation.value));

          const result: EvalIterationResult = {
            metadata,
            // rawResponse,
            jsonParsed: validation.jsonParsed,
            jsonParseError: validation.jsonParseError,
            schemaValidated: validation.schemaValidated,
            schemaError: validation.schemaError,
            // parsedValue: validation.value,
            d2Checks,
            timestamp: new Date().toISOString(),
          };

          await appendResult(result, CONFIG.outputPath);

          console.log(
            `[${index + 1}/${jobs.length}] ✓ Saved. parsed=${validation.jsonParsed} schema=${validation.schemaValidated}${validation.schemaError ? ` error=${validation.schemaError}` : ''}`,
          );

          return { status: 'fulfilled', value: result };
        } catch (error) {
          console.error(
            `[${index + 1}/${jobs.length}] ✗ Failed:`,
            error instanceof Error ? error.message : error,
          );
          return { status: 'rejected', reason: error };
        }
      }),
    );
  }

  // Wait for all jobs
  const results = await Promise.allSettled(promises);
  console.log("all jobs completed", results);
  // Count successes and failures
  const fulfilled = results.filter((r) => r.status === 'fulfilled').length;
  const rejected = results.filter((r) => r.status === 'rejected').length;

  console.log(`\nCompleted ${fulfilled}/${jobs.length} evaluation iterations.`);
  if (rejected > 0) {
    console.warn(`Failed: ${rejected} iterations.`);
  }

  // Load results from file for stats
  const fileContent = await fs.readFile(CONFIG.outputPath, 'utf-8');
  const savedResults = fileContent
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line) as EvalIterationResult);

  const d2ChecksTotal = savedResults.reduce(
    (sum, result) => sum + result.d2Checks.length,
    0,
  );
  const d2Failures = savedResults.reduce(
    (sum, result) =>
      sum + result.d2Checks.filter((check) => !check.success).length,
    0,
  );
  console.log(
    `D2 diagrams evaluated: ${d2ChecksTotal}. Failures: ${d2Failures}.`,
  );
  console.log(`Results saved to ${CONFIG.outputPath}`);
}

run().catch((error) => {
  console.error('Eval run failed:', error);
  process.exitCode = 1;
});
