import path from 'path';
import fs from 'fs/promises';

import { LLMNoteSchema, type LLMNote } from '../src/lib/schemas.js';
import {
  SYSTEM_PROMPT,
  SYSTEM_PROMPT_2,
  SYSTEM_PROMPT_3,
} from '../src/lib/prompts.js';
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
};

const SYSTEM_PROMPTS: SystemPromptConfig[] = [
  { id: 'prompt_v1', text: SYSTEM_PROMPT },
  { id: 'prompt_v2', text: SYSTEM_PROMPT_2 },
  { id: 'prompt_v3', text: SYSTEM_PROMPT_3 },
];

const DEFAULT_MODELS = [
  'x-ai/grok-4.1-fast:free',
  'openai/gpt-oss-20b:free',
  "openai/gpt-4.1-mini",
  "z-ai/glm-4.5-air:free",
  "google/gemini-2.5-flash-lite",
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
    const result = await generateObject({
      model: openrouter(model),
      schema: LLMNoteSchema,
      prompt: `This is the system prompt: ${prompt}\n\nHere is the text to process:\n\n${content}`,
    });
    return JSON.stringify(result.object);
  } catch (error) {
    console.error('Error generating notes:', error);
    throw error;
  }
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
      });
    }
  }

  return results;
}

async function persistResults(
  results: EvalIterationResult[],
  outputPath: string,
) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  if (results.length === 0) {
    console.warn('No evaluation results to persist.');
    return;
  }

  const lines = results.map((result) => JSON.stringify(result));
  await fs.writeFile(outputPath, `${lines.join('\n')}\n`, 'utf-8');
  console.log(`Saved ${results.length} records to ${outputPath}`);
}

async function appendResult(
  result: EvalIterationResult,
  outputPath: string,
) {
  await fs.appendFile(outputPath, `${JSON.stringify(result)}\n`, 'utf-8');
}


async function run() {
  const dryRun = process.argv.includes('--dry-run');
  const concurrency = 10;

  console.log('Starting D2 evaluation harness');
  console.log('Eval config:', {
    contentDir: CONFIG.contentDir,
    promptCount: CONFIG.prompts.length,
    modelCount: CONFIG.models.length,
    outputPath: CONFIG.outputPath,
    dryRun,
    concurrency,
  });

  const contentItems = await loadContentItems(CONFIG.contentDir);

  if (contentItems.length === 0) {
    console.warn('No content items to evaluate. Exiting early.');
    return;
  }

  // Clear/create output file
  await fs.mkdir(path.dirname(CONFIG.outputPath), { recursive: true });
  await fs.writeFile(CONFIG.outputPath, '', 'utf-8');

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
