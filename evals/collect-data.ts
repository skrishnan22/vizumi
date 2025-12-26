import path from 'path';
import fs from 'fs/promises';
import { parseArgs } from 'util';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { checkbox, confirm } from '@inquirer/prompts';
import pLimit from 'p-limit';

import { LLMNoteSchema, type LLMNote } from '../src/lib/schemas.js';
import { renderD2ToSvg } from '../src/lib/d2.js';
import { SYSTEM_PROMPT, SYSTEM_PROMPT_3, SYSTEM_PROMPT_WITH_D2_REF } from '../src/lib/prompts.js';
import { SYSTEM_PROMPT_OPTIMIZED } from '../src/lib/prompts-optimized.js';

dotenv.config({ path: '.env.local' });

const PROMPTS: Record<string, { id: string; name: string; text: string }> = {
  prompt_v1: { id: 'prompt_v1', name: 'Basic', text: SYSTEM_PROMPT_3 },
  prompt_v2: { id: 'prompt_v2', name: 'Optimized', text: SYSTEM_PROMPT_OPTIMIZED },
  prompt_v3: { id: 'prompt_v3', name: 'D2 Focussed', text: SYSTEM_PROMPT_WITH_D2_REF },
};

const MODELS: { id: string; name: string }[] = [
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },

  { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5' },

  { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },

  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2 flash (Free)' },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash' },
  // { id: 'google/gemma-3-27b-it:free', name: 'Google Gemma3' }, //provider issue

  { id: 'x-ai/grok-code-fast-1', name: 'Grok Code Fast 1' },
  { id: 'x-ai/grok-4.1-fast', name: 'Grok 4.1 Fast' },

  { id: 'moonshotai/kimi-k2-0905', name: 'Kimi K2 Moonshot' },
  { id: 'moonshotai/kimi-k2:free', name: 'Kimi K2 (Free)' },

  { id: 'z-ai/glm-4.7', name: 'Z.ai GLM 4.7' },
  { id: 'z-ai/glm-4.5-air:free', name: 'Z.ai GLM 4.5 Air (Free)' },
  { id: 'mistralai/devstral-2512:free', name: 'Mistral (Free)' },
  { id: 'deepseek/deepseek-chat-v3.1', name: 'DeepSeek Chat v3.1' },
  { id: 'qwen/qwen3-coder:free', name: 'Qwen 3 Coder(Free)' },
  { id: 'minimax/minimax-m2', name: 'Minmax  M2' },
];

const COLLECTED_DIR = path.join(process.cwd(), 'evals', 'collected');
const DATASETS_DIR = path.join(process.cwd(), 'evals', 'datasets');

// D2 compilation must be serialized (concurrency 1)
const d2Limit = pLimit(1);

interface CollectionMetadata {
  contentId: string;
  promptId: string;
  modelId: string;
  timestamp: string;
  durationMs: number;
  success: boolean;
  error?: string;
  blockCount: number;
  diagramCount: number;
  diagramsFailed: number;
}

interface CollectionResult {
  metadata: CollectionMetadata;
  output: LLMNote | null;
}

interface Dataset {
  id: string;
  filePath: string;
  content: string;
}

function parseCliArgs() {
  const { values } = parseArgs({
    options: {
      all: { type: 'boolean', short: 'a' },
      content: { type: 'string', short: 'c' },
      prompt: { type: 'string', short: 'p' },
      model: { type: 'string', short: 'm' },
      force: { type: 'boolean', short: 'f' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  return values;
}

function printHelp() {
  console.log(`
📦 Viz-Notes Data Collection

Usage: npm run collect -- [options]

Modes:
  (default)            Interactive mode - select via checkboxes
  -a, --all            Non-interactive - run all combinations

Filters (for non-interactive mode):
  -c, --content <id>   Filter by content ID
  -p, --prompt <id>    Filter by prompt ID
  -m, --model <id>     Filter by model ID

Options:
  -f, --force          Force re-run even if output exists
  -h, --help           Show this help

Examples:
  npm run collect                          # Interactive selection
  npm run collect -- --all                 # Run everything
  npm run collect -- --all -c idempotency  # All prompts/models for one content
  npm run collect -- --force               # Re-generate existing outputs
  `);
}

async function selectInteractive(datasets: Dataset[]): Promise<{
  selectedContent: Dataset[];
  selectedPrompts: { id: string; text: string }[];
  selectedModels: string[];
}> {
  // Print header to initialize terminal before first prompt
  console.log('\n📦 Viz-Notes Data Collection\n');

  const contentChoices = datasets.map((d) => ({
    name: `${d.id} (${Math.round(d.content.length / 1000)}k chars)`,
    value: d.id,
    checked: true,
  }));

  const selectedContentIds = await checkbox({
    message: 'Select content to process',
    choices: contentChoices,
    required: true,
  });

  const promptChoices = Object.entries(PROMPTS).map(([id, p]) => ({
    name: `${id} (${p.name})`,
    value: id,
    checked: true,
  }));

  const selectedPromptIds = await checkbox({
    message: 'Select prompts to use',
    choices: promptChoices,
    required: true,
  });

  const modelChoices = MODELS.map((m) => ({
    name: m.name,
    value: m.id,
    checked: true,
  }));

  const selectedModelIds = await checkbox({
    message: 'Select models to run',
    choices: modelChoices,
    required: true,
  });

  const totalJobs = selectedContentIds.length * selectedPromptIds.length * selectedModelIds.length;

  console.log(`\n📊 Ready to run ${totalJobs} jobs`);
  console.log(
    `   ${selectedContentIds.length} content × ${selectedPromptIds.length} prompts × ${selectedModelIds.length} models\n`
  );

  const proceed = await confirm({
    message: 'Proceed?',
    default: true,
  });

  if (!proceed) {
    console.log('Cancelled.');
    process.exit(0);
  }

  return {
    selectedContent: datasets.filter((d) => selectedContentIds.includes(d.id)),
    selectedPrompts: selectedPromptIds.map((id) => ({ id, text: PROMPTS[id].text })),
    selectedModels: selectedModelIds,
  };
}

async function loadDatasets(): Promise<Dataset[]> {
  const entries = await fs.readdir(DATASETS_DIR);
  const mdFiles = entries.filter((e) => e.endsWith('.md') && e !== '.md');

  return Promise.all(
    mdFiles.map(async (filename) => {
      const filePath = path.join(DATASETS_DIR, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      const id = path.basename(filename, '.md');
      return { id, filePath, content };
    })
  );
}

function getOutputDir(contentId: string, promptId: string, modelId: string): string {
  const safeModelId = modelId.replace(/\//g, '_');
  return path.join(COLLECTED_DIR, contentId, `${promptId}_${safeModelId}`);
}

async function outputExists(outputDir: string): Promise<boolean> {
  try {
    await fs.access(path.join(outputDir, 'output.json'));
    return true;
  } catch {
    return false;
  }
}

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function generateNotes(
  content: string,
  promptText: string,
  modelId: string
): Promise<LLMNote> {
  const result = await generateObject({
    model: openrouter(modelId),
    schema: LLMNoteSchema,
    system: promptText,
    prompt: `Here is the text to process:\n\n${content}`,
    maxRetries: 3,
  });

  return result.object;
}

async function renderDiagrams(
  output: LLMNote,
  outputDir: string
): Promise<{ success: number; failed: number }> {
  const diagramsDir = path.join(outputDir, 'diagrams');
  await fs.mkdir(diagramsDir, { recursive: true });

  const diagramBlocks = output.blocks.filter(
    (block) => block.visualType === 'diagram' && block.d2Code
  );

  const results = await Promise.all(
    diagramBlocks.map((block) =>
      d2Limit(async () => {
        const svgPath = path.join(diagramsDir, `${block.id}.svg`);
        const pngPath = path.join(diagramsDir, `${block.id}.png`);

        try {
          const result = await renderD2ToSvg(block.d2Code!);

          if (result.ok && result.svg) {
            await fs.writeFile(svgPath, result.svg, 'utf-8');
            await sharp(Buffer.from(result.svg)).png().toFile(pngPath);
            return { success: true };
          } else {
            await fs.writeFile(
              path.join(diagramsDir, `${block.id}.error.txt`),
              JSON.stringify(result) || 'Unknown error',
              'utf-8'
            );
            return { success: false };
          }
        } catch (error) {
          await fs.writeFile(
            path.join(diagramsDir, `${block.id}.error.txt`),
            error instanceof Error ? error.message : 'Unknown error',
            'utf-8'
          );
          return { success: false };
        }
      })
    )
  );

  const success = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return { success, failed };
}

// ============================================================
// Single Collection Run
// ============================================================

async function collectOne(
  dataset: Dataset,
  promptId: string,
  promptText: string,
  modelId: string,
  force: boolean
): Promise<CollectionResult> {
  const outputDir = getOutputDir(dataset.id, promptId, modelId);

  // Check if already exists
  if (!force && (await outputExists(outputDir))) {
    console.log(` Skipping (exists): ${dataset.id} / ${promptId} / ${modelId}`);
    return {
      metadata: {
        contentId: dataset.id,
        promptId,
        modelId,
        timestamp: '',
        durationMs: 0,
        success: true,
        blockCount: 0,
        diagramCount: 0,
        diagramsFailed: 0,
      },
      output: null,
    };
  }

  console.log(`Generating: ${dataset.id} / ${promptId} / ${modelId}`);

  await fs.mkdir(outputDir, { recursive: true });

  const startTime = Date.now();
  let output: LLMNote | null = null;
  let error: string | undefined;

  try {
    output = await generateNotes(dataset.content, promptText, modelId);

    // Save raw output
    await fs.writeFile(
      path.join(outputDir, 'output.json'),
      JSON.stringify(output, null, 2),
      'utf-8'
    );

    // Render diagrams
    const diagramResults = await renderDiagrams(output, outputDir);

    const metadata: CollectionMetadata = {
      contentId: dataset.id,
      promptId,
      modelId,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      success: true,
      blockCount: output.blocks.length,
      diagramCount: diagramResults.success,
      diagramsFailed: diagramResults.failed,
    };

    // Save metadata
    await fs.writeFile(
      path.join(outputDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );

    const failedInfo = diagramResults.failed > 0 ? `, ${diagramResults.failed} failed` : '';
    console.log(
      `Done: ${output.blocks.length} blocks, ${diagramResults.success} diagrams${failedInfo}`
    );

    return { metadata, output };
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error';
    console.log(`Failed: ${error}`);

    const metadata: CollectionMetadata = {
      contentId: dataset.id,
      promptId,
      modelId,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      success: false,
      error,
      blockCount: 0,
      diagramCount: 0,
      diagramsFailed: 0,
    };

    await fs.writeFile(
      path.join(outputDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );

    return { metadata, output: null };
  }
}

async function run() {
  const args = parseCliArgs();

  if (args.help) {
    printHelp();
    return;
  }

  const allDatasets = await loadDatasets();

  if (allDatasets.length === 0) {
    console.error('No datasets found in evals/datasets/');
    process.exit(1);
  }

  let selectedContent: Dataset[];
  let selectedPrompts: { id: string; text: string }[];
  let selectedModels: string[];

  if (args.all) {
    // Non-interactive mode: use all or filter by CLI args
    console.log('\n📦 Viz-Notes Data Collection (non-interactive)\n');

    selectedContent = allDatasets;
    selectedPrompts = Object.entries(PROMPTS).map(([id, p]) => ({ id, text: p.text }));
    selectedModels = MODELS.map((m) => m.id);

    // Apply filters if provided
    if (args.content) {
      selectedContent = selectedContent.filter((d) => d.id === args.content);
      if (selectedContent.length === 0) {
        console.error(`Content not found: ${args.content}`);
        console.log('Available:', allDatasets.map((d) => d.id).join(', '));
        process.exit(1);
      }
    }

    if (args.prompt) {
      selectedPrompts = selectedPrompts.filter((p) => p.id === args.prompt);
      if (selectedPrompts.length === 0) {
        console.error(`Prompt not found: ${args.prompt}`);
        console.log('Available:', Object.keys(PROMPTS).join(', '));
        process.exit(1);
      }
    }

    if (args.model) {
      selectedModels = selectedModels.filter((m) => m === args.model);
      if (selectedModels.length === 0) {
        console.error(` Model not found: ${args.model}`);
        console.log('Available:', MODELS.map((m) => m.id).join(', '));
        process.exit(1);
      }
    }

    console.log(
      `Running ${selectedContent.length} content × ${selectedPrompts.length} prompts × ${selectedModels.length} models`
    );
    console.log(
      `   = ${selectedContent.length * selectedPrompts.length * selectedModels.length} total jobs\n`
    );
  } else {
    // Interactive mode: show checkbox prompts
    const selection = await selectInteractive(allDatasets);
    selectedContent = selection.selectedContent;
    selectedPrompts = selection.selectedPrompts;
    selectedModels = selection.selectedModels;
  }

  // Flatten jobs into array
  type Job = {
    dataset: Dataset;
    promptId: string;
    promptText: string;
    modelId: string;
  };

  const jobs: Job[] = [];
  for (const dataset of selectedContent) {
    for (const prompt of selectedPrompts) {
      for (const modelId of selectedModels) {
        jobs.push({
          dataset,
          promptId: prompt.id,
          promptText: prompt.text,
          modelId,
        });
      }
    }
  }

  // LLM generation can run in parallel
  const LLM_CONCURRENCY = 5;
  const llmLimit = pLimit(LLM_CONCURRENCY);

  console.log(`\nRunning ${jobs.length} jobs with concurrency ${LLM_CONCURRENCY}...`);

  // Run collection in parallel
  const results = await Promise.all(
    jobs.map((job, index) =>
      llmLimit(async () => {
        console.log(
          `[${index + 1}/${jobs.length}] ${job.dataset.id} / ${job.promptId} / ${job.modelId}`
        );
        return collectOne(
          job.dataset,
          job.promptId,
          job.promptText,
          job.modelId,
          args.force ?? false
        );
      })
    )
  );

  // Count results
  let completed = 0;
  let skipped = 0;
  let failed = 0;

  for (const result of results) {
    if (result.output === null && result.metadata.timestamp === '') {
      skipped++;
    } else if (result.metadata.success) {
      completed++;
    } else {
      failed++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(' Collection Summary');
  console.log('='.repeat(50));
  console.log(`  Completed: ${completed}`);
  console.log(`  Skipped:   ${skipped}`);
  console.log(`  Failed:    ${failed}`);
  console.log(`  Output:    ${COLLECTED_DIR}`);
}

run().catch((error) => {
  console.error(' Fatal error:', error);
  process.exit(1);
});
