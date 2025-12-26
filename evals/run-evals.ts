// evals/run-evals.ts

import path from 'path';
import fs from 'fs/promises';
import { parseArgs } from 'util';
import { checkbox, confirm } from '@inquirer/prompts';
import dotenv from 'dotenv';

import { callTextJudge } from './judges/text-judge.js';
import { callVisionJudge } from './judges/vision-judge.js';
import {
  SUMMARY_QUALITY_RUBRIC,
  SUMMARY_QUALITY_SCHEMA,
  GROUNDING_RUBRIC,
  GROUNDING_SCHEMA,
  SECTION_QUALITY_RUBRIC,
  SECTION_QUALITY_SCHEMA,
  DIAGRAM_QUALITY_RUBRIC,
  DIAGRAM_QUALITY_SCHEMA,
  JUDGE_CONFIG,
} from './rubrics/index.js';

dotenv.config({ path: '.env.local' });

// ============================================================
// Configuration
// ============================================================

const COLLECTED_DIR = path.join(process.cwd(), 'evals', 'collected');
const DATASETS_DIR = path.join(process.cwd(), 'evals', 'datasets');
const CONCURRENCY = 3; // Number of outputs to evaluate in parallel

// ============================================================
// Type Definitions
// ============================================================

interface OutputPath {
  path: string;
  contentId: string;
  promptId: string;
  modelId: string;
  hasEvals: boolean;
}

interface CollectionMetadata {
  contentId: string;
  promptId: string;
  modelId: string;
  timestamp: string;
  durationMs: number;
  success: boolean;
  blockCount: number;
  diagramCount: number;
  diagramsFailed: number;
  evals?: EvalResults;
}

interface LLMNoteBlock {
  id: string;
  title: string;
  summary: string;
  visualType: string;
  d2Code?: string;
  imageQuery?: string;
}

interface LLMNote {
  blocks: LLMNoteBlock[];
}

interface SummaryQualityResult {
  scores: {
    coherence: number;
    completeness: number;
    conciseness: number;
    clarity: number;
  };
  overall_score: number;
  justification: string;
}

interface GroundingResult {
  overall_score: number;
  justification: string;
}

interface SectionQualityResult {
  scores: {
    logical_boundaries: number;
    coverage: number;
    balance: number;
    no_overlap: number;
  };
  overall_score: number;
  justification: string;
}

interface DiagramQualityResult {
  blockId: string;
  analysis: {
    content_pattern: string;
    type_assessment: string;
    accuracy_assessment: string;
    visual_assessment: string;
    label_assessment: string;
    value_assessment: string;
  };
  scores: {
    type_appropriateness: number;
    content_accuracy: number;
    visual_execution: number;
    label_quality: number;
    value_add: number;
  };
  overall: number;
  justification: string;
}

interface EvalResults {
  timestamp: string;
  judgeModels: {
    text: string;
    vision: string;
  };
  summaryQuality: SummaryQualityResult;
  grounding: GroundingResult;
  sectionQuality: SectionQualityResult;
  diagrams: DiagramQualityResult[];
  composite: {
    score: number;
    weights: Record<string, number>;
    diagramAvg: number | null;
  };
}

// ============================================================
// CLI Argument Parsing
// ============================================================

function parseCliArgs() {
  const { values } = parseArgs({
    options: {
      all: { type: 'boolean', short: 'a' },
      content: { type: 'string', short: 'c' },
      prompt: { type: 'string', short: 'p' },
      model: { type: 'string', short: 'm' },
      force: { type: 'boolean', short: 'f' },
      'dry-run': { type: 'boolean' },
      concurrency: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  return values;
}

function printHelp() {
  console.log(`
📊 Viz-Notes Eval Runner

Usage: npx tsx evals/run-evals.ts [options]

Modes:
  (default)            Interactive mode - select via checkboxes
  -a, --all            Non-interactive - run all unevaluated outputs

Filters (for non-interactive mode):
  -c, --content <id>   Filter by content ID
  -p, --prompt <id>    Filter by prompt ID
  -m, --model <id>     Filter by model ID

Options:
  -f, --force          Force re-evaluate even if evals exist
  --dry-run            Show what would be evaluated without running
  --concurrency <n>    Number of outputs to eval in parallel (default: 3)
  -h, --help           Show this help

Examples:
  npx tsx evals/run-evals.ts                    # Interactive selection
  npx tsx evals/run-evals.ts --all              # Eval all unevaluated
  npx tsx evals/run-evals.ts --all --force      # Re-eval everything
  npx tsx evals/run-evals.ts --all -c llm-explainer  # One content only
  `);
}

// ============================================================
// Discovery
// ============================================================

async function discoverOutputs(): Promise<OutputPath[]> {
  const outputs: OutputPath[] = [];

  const contentDirs = await fs.readdir(COLLECTED_DIR);

  for (const contentId of contentDirs) {
    const contentPath = path.join(COLLECTED_DIR, contentId);
    const stat = await fs.stat(contentPath);
    if (!stat.isDirectory()) continue;

    const outputDirs = await fs.readdir(contentPath);

    for (const outputDir of outputDirs) {
      const outputPath = path.join(contentPath, outputDir);
      const metadataPath = path.join(outputPath, 'metadata.json');

      try {
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        const metadata: CollectionMetadata = JSON.parse(metadataContent);

        // Skip failed generations
        if (!metadata.success) continue;

        // Parse promptId and modelId from directory name
        // Format: prompt_vN_{modelProvider}_{modelName}
        // Example: prompt_v1_google_gemini-2.5-flash-lite
        const match = outputDir.match(/^(prompt_v\d+)_(.+)$/);
        if (!match) continue;

        const [, promptId, modelId] = match;

        outputs.push({
          path: outputPath,
          contentId: metadata.contentId,
          promptId,
          modelId: modelId.replace(/_/g, '/'), // Restore slashes in model ID
          hasEvals: !!metadata.evals,
        });
      } catch (error) {
        console.warn(`⚠️  Skipping ${outputPath}: ${error}`);
      }
    }
  }

  return outputs;
}

// ============================================================
// Interactive Selection
// ============================================================

async function selectInteractive(outputs: OutputPath[]): Promise<OutputPath[]> {
  console.log('\n📊 Viz-Notes Eval Runner\n');

  // Group by content, prompt, model for better UI
  const contentIds = [...new Set(outputs.map((o) => o.contentId))];
  const promptIds = [...new Set(outputs.map((o) => o.promptId))];
  const modelIds = [...new Set(outputs.map((o) => o.modelId))];

  // Select content
  const selectedContentIds = await checkbox({
    message: 'Select content to evaluate',
    choices: contentIds.map((id) => ({
      name: id,
      value: id,
      checked: true,
    })),
    required: true,
  });

  // Select prompts
  const selectedPromptIds = await checkbox({
    message: 'Select prompts to evaluate',
    choices: promptIds.map((id) => ({
      name: id,
      value: id,
      checked: true,
    })),
    required: true,
  });

  // Select models
  const selectedModelIds = await checkbox({
    message: 'Select models to evaluate',
    choices: modelIds.map((id) => ({
      name: id,
      value: id,
      checked: true,
    })),
    required: true,
  });

  const filtered = outputs.filter(
    (o) =>
      selectedContentIds.includes(o.contentId) &&
      selectedPromptIds.includes(o.promptId) &&
      selectedModelIds.includes(o.modelId)
  );

  console.log(`\n📊 Found ${filtered.length} outputs to evaluate\n`);

  const proceed = await confirm({
    message: 'Proceed?',
    default: true,
  });

  if (!proceed) {
    console.log('Cancelled.');
    process.exit(0);
  }

  return filtered;
}

// ============================================================
// Individual Judges
// ============================================================

async function runSummaryJudge(source: string, llmOutput: LLMNote): Promise<SummaryQualityResult> {
  const combinedSummary = llmOutput.blocks.map((b) => b.summary).join('\n\n');

  const prompt = SUMMARY_QUALITY_RUBRIC.replace('{{SOURCE}}', source).replace(
    '{{SUMMARY}}',
    combinedSummary
  );

  return callTextJudge(prompt, SUMMARY_QUALITY_SCHEMA);
}

async function runGroundingJudge(source: string, llmOutput: LLMNote): Promise<GroundingResult> {
  const combinedSummary = llmOutput.blocks.map((b) => b.summary).join('\n\n');

  const prompt = GROUNDING_RUBRIC.replace('{{SOURCE}}', source).replace(
    '{{SUMMARY}}',
    combinedSummary
  );

  return callTextJudge(prompt, GROUNDING_SCHEMA);
}

async function runSectionJudge(source: string, llmOutput: LLMNote): Promise<SectionQualityResult> {
  const sectionsText = llmOutput.blocks.map((b) => `## ${b.title}\n${b.summary}`).join('\n\n');

  const prompt = SECTION_QUALITY_RUBRIC.replace('{{SOURCE}}', source).replace(
    '{{SECTIONS}}',
    sectionsText
  );

  return callTextJudge(prompt, SECTION_QUALITY_SCHEMA);
}

async function runDiagramJudge(
  blockSummary: string,
  pngPath: string,
  blockId: string
): Promise<DiagramQualityResult> {
  const prompt = DIAGRAM_QUALITY_RUBRIC.replace('{{SUMMARY}}', blockSummary);

  const result = await callVisionJudge(prompt, pngPath, DIAGRAM_QUALITY_SCHEMA);

  return {
    blockId,
    ...result,
  };
}

// ============================================================
// Composite Score Calculation
// ============================================================

function calculateComposite(
  summary: SummaryQualityResult,
  grounding: GroundingResult,
  section: SectionQualityResult,
  diagrams: DiagramQualityResult[]
): {
  score: number;
  weights: Record<string, number>;
  diagramAvg: number | null;
} {
  // Calculate average diagram score
  const diagramAvg =
    diagrams.length > 0 ? diagrams.reduce((sum, d) => sum + d.overall, 0) / diagrams.length : null;

  // Define weights
  let weights: Record<string, number>;
  if (diagramAvg === null) {
    // No diagrams - redistribute weight
    weights = {
      summary: 0.35,
      grounding: 0.35,
      section: 0.3,
      diagram: 0,
    };
  } else {
    weights = {
      summary: 0.25,
      grounding: 0.25,
      section: 0.2,
      diagram: 0.3,
    };
  }

  const score =
    summary.overall_score * weights.summary +
    grounding.overall_score * weights.grounding +
    section.overall_score * weights.section +
    (diagramAvg ?? 0) * weights.diagram;

  return {
    score: Math.round(score * 100) / 100,
    weights,
    diagramAvg: diagramAvg ? Math.round(diagramAvg * 100) / 100 : null,
  };
}

// ============================================================
// Single Output Evaluation
// ============================================================

async function evalSingleOutput(output: OutputPath): Promise<void> {
  console.log(`  🔄 Evaluating: ${output.contentId} / ${output.promptId} / ${output.modelId}`);

  try {
    // Load source content
    const sourceContent = await fs.readFile(
      path.join(DATASETS_DIR, `${output.contentId}.md`),
      'utf-8'
    );

    // Load LLM output
    const llmOutputContent = await fs.readFile(path.join(output.path, 'output.json'), 'utf-8');
    const llmOutput: LLMNote = JSON.parse(llmOutputContent);

    // Run text judges in parallel
    const [summaryResult, groundingResult, sectionResult] = await Promise.all([
      runSummaryJudge(sourceContent, llmOutput),
      runGroundingJudge(sourceContent, llmOutput),
      runSectionJudge(sourceContent, llmOutput),
    ]);

    // Run vision judges sequentially for diagrams
    const diagramResults: DiagramQualityResult[] = [];
    for (const block of llmOutput.blocks) {
      if (block.visualType === 'diagram' && block.d2Code) {
        const pngPath = path.join(output.path, 'diagrams', `${block.id}.png`);

        console.log(`    🔍 Looking for PNG: ${pngPath}`);

        try {
          await fs.access(pngPath);
          console.log(`    ✅ Found PNG for ${block.id}`);
          const result = await runDiagramJudge(block.summary, pngPath, block.id);
          diagramResults.push(result);

          // Small delay between vision calls
          await sleep(200);
        } catch (error) {
          console.log(`    ⚠️  Skipping diagram ${block.id}: PNG not found at ${pngPath}`, error);
        }
      }
    }

    // Calculate composite score
    const composite = calculateComposite(
      summaryResult,
      groundingResult,
      sectionResult,
      diagramResults
    );

    // Update metadata with eval results
    const metadataPath = path.join(output.path, 'metadata.json');
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    const metadata: CollectionMetadata = JSON.parse(metadataContent);

    metadata.evals = {
      timestamp: new Date().toISOString(),
      judgeModels: {
        text: JUDGE_CONFIG.textJudge.model,
        vision: JUDGE_CONFIG.visionJudge.model,
      },
      summaryQuality: summaryResult,
      grounding: groundingResult,
      sectionQuality: sectionResult,
      diagrams: diagramResults,
      composite,
    };

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    console.log(`  ✅ Done: composite=${composite.score}, diagrams=${diagramResults.length}`);
  } catch (error) {
    console.log(`  ❌ Failed: ${error instanceof Error ? error.message : error}`);

    // Write partial error marker
    try {
      const metadataPath = path.join(output.path, 'metadata.json');
      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      const metadata: CollectionMetadata = JSON.parse(metadataContent);

      metadata.evals = {
        timestamp: new Date().toISOString(),
        judgeModels: {
          text: JUDGE_CONFIG.textJudge.model,
          vision: JUDGE_CONFIG.visionJudge.model,
        },
        error: error instanceof Error ? error.message : String(error),
      } as any;

      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    } catch (writeError) {
      console.log(`  ❌ Could not write error marker: ${writeError}`);
    }
  }
}

// ============================================================
// Batch Processing with Parallelization
// ============================================================

async function runEvalsParallel(outputs: OutputPath[], concurrency: number): Promise<void> {
  console.log(`\n📊 Processing ${outputs.length} outputs (${concurrency} at a time)\n`);

  let completed = 0;
  let failed = 0;

  // Process in batches
  for (let i = 0; i < outputs.length; i += concurrency) {
    const batch = outputs.slice(i, i + concurrency);
    console.log(
      `\nBatch ${Math.floor(i / concurrency) + 1}/${Math.ceil(outputs.length / concurrency)}:`
    );

    await Promise.all(batch.map((output) => evalSingleOutput(output)));

    // Small delay between batches
    if (i + concurrency < outputs.length) {
      await sleep(500);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Eval Summary');
  console.log('='.repeat(50));
  console.log(`  ✅ Processed: ${outputs.length}`);
  console.log(`  📁 Output:    ${COLLECTED_DIR}`);
}

// ============================================================
// Utility Functions
// ============================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ============================================================
// Main Runner
// ============================================================

async function run() {
  const args = parseCliArgs();

  if (args.help) {
    printHelp();
    return;
  }

  // Discover all outputs
  const allOutputs = await discoverOutputs();

  if (allOutputs.length === 0) {
    console.error('❌ No outputs found in evals/collected/');
    process.exit(1);
  }

  console.log(`Found ${allOutputs.length} total outputs`);

  let selectedOutputs: OutputPath[];

  // Determine mode: interactive vs non-interactive
  if (args.all) {
    selectedOutputs = allOutputs;

    // Apply filters if provided
    if (args.content) {
      selectedOutputs = selectedOutputs.filter((o) => o.contentId === args.content);
    }
    if (args.prompt) {
      selectedOutputs = selectedOutputs.filter((o) => o.promptId === args.prompt);
    }
    if (args.model) {
      selectedOutputs = selectedOutputs.filter((o) => o.modelId === args.model);
    }
  } else {
    // Interactive mode
    selectedOutputs = await selectInteractive(allOutputs);
  }

  // Filter out already-evaluated unless --force
  if (!args.force) {
    const unevaluated = selectedOutputs.filter((o) => !o.hasEvals);
    const alreadyEvaluated = selectedOutputs.length - unevaluated.length;

    if (alreadyEvaluated > 0) {
      console.log(
        `\n⏭️  Skipping ${alreadyEvaluated} already-evaluated outputs (use --force to re-evaluate)`
      );
    }

    selectedOutputs = unevaluated;
  }

  if (selectedOutputs.length === 0) {
    console.log('\n✅ No outputs to evaluate!');
    return;
  }

  // Dry run mode
  if (args['dry-run']) {
    console.log('\n🔍 Dry run - would evaluate:\n');
    selectedOutputs.forEach((o) => {
      console.log(`  - ${o.contentId} / ${o.promptId} / ${o.modelId}`);
    });
    return;
  }

  // Run evaluations
  const concurrency = args.concurrency ? parseInt(args.concurrency as string, 10) : CONCURRENCY;

  await runEvalsParallel(selectedOutputs, concurrency);
}

run().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
