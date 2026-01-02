import path from 'path';
import fs from 'fs/promises';
import { parseArgs } from 'util';

const COLLECTED_DIR = path.join(process.cwd(), 'evals', 'collected');
const RESULTS_DIR = path.join(process.cwd(), 'evals', 'results');

// Weights for composite score (matching run-evals.ts)
const WEIGHTS = {
  summary: 0.25,
  grounding: 0.25,
  section: 0.2,
  diagram: 0.3,
};

// Weights when no diagrams exist
const WEIGHTS_NO_DIAGRAMS = {
  summary: 0.35,
  grounding: 0.35,
  section: 0.3,
  diagram: 0,
};

// Model pricing: cost per 1M output tokens in USD (from OpenRouter)
// Source: https://openrouter.ai/models
const MODEL_PRICING: Record<string, number> = {
  // OpenAI
  'openai/gpt-5-mini': 2.0, // estimated based on similar models
  'openai/gpt-4o-mini': 0.6,

  // Anthropic
  'anthropic/claude-sonnet-4.5': 15.0,

  // Google
  'google/gemini-2.5-flash-lite': 0.4,
  'google/gemini-2.5-flash': 2.5,
  'google/gemini-2.0-flash-exp:free': 0,
  'google/gemini-3-flash-preview': 3.0, // estimated

  // xAI
  'x-ai/grok-code-fast-1': 1.5, // estimated
  'x-ai/grok-4.1-fast': 0.5, // estimated

  // Moonshot
  'moonshotai/kimi-k2-0905': 1.9, // estimated
  'moonshotai/kimi-k2:free': 0,

  // Z.ai / Zhipu
  'z-ai/glm-4.7': 1.5, // estimated
  'z-ai/glm-4.5-air:free': 0,

  // Others
  'mistralai/devstral-2512:free': 0,
  'deepseek/deepseek-chat-v3.1': 0.75,
  'qwen/qwen3-coder:free': 0,
  'minimax/minimax-m2': 1.1, // estimated
};

interface DiagramEvalResult {
  blockId: string;
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
  summaryQuality: {
    scores: {
      coherence: number;
      completeness: number;
      conciseness: number;
      clarity: number;
    };
    overall_score: number;
    justification: string;
  };
  grounding: {
    overall_score: number;
    justification: string;
  };
  sectionQuality: {
    scores: {
      logical_boundaries: number;
      coverage: number;
      balance: number;
      no_overlap: number;
    };
    overall_score: number;
    justification: string;
  };
  diagrams: DiagramEvalResult[];
  composite: {
    score: number;
    weights: Record<string, number>;
    diagramAvg: number | null;
  };
  error?: string;
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

interface AdjustedMetadata extends CollectionMetadata {
  adjustedComposite: {
    score: number;
    diagramPenalty: number;
    adjustedDiagramAvg: number | null;
    originalDiagramAvg: number | null;
  };
}

interface ModelStats {
  modelId: string;
  count: number;
  avgComposite: number;
  avgAdjustedComposite: number;
  avgSummary: number;
  avgGrounding: number;
  avgSection: number;
  avgDiagram: number | null;
  avgDiagramFailRate: number;
  totalDiagrams: number;
  totalDiagramsFailed: number;
  costPer1MTokens: number | null; // USD per 1M output tokens
}

interface PromptStats {
  promptId: string;
  count: number;
  avgComposite: number;
  avgAdjustedComposite: number;
  avgSummary: number;
  avgGrounding: number;
  avgSection: number;
  avgDiagram: number | null;
}

interface ContentStats {
  contentId: string;
  count: number;
  avgComposite: number;
  avgAdjustedComposite: number;
  avgSummary: number;
  avgGrounding: number;
  avgSection: number;
  avgDiagram: number | null;
}

function parseCliArgs() {
  const { values } = parseArgs({
    options: {
      output: { type: 'string', short: 'o' },
      format: { type: 'string', short: 'f', default: 'html' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  return values;
}

function printHelp() {
  console.log(`
📊 Viz-Notes Eval Report Generator

Usage: npx tsx evals/report-evals.ts [options]

Options:
  -o, --output <path>   Output file path (default: evals/results/report.html)
  -f, --format <type>   Output format: html, json (default: html)
  -h, --help            Show this help

Examples:
  npx tsx evals/report-evals.ts                    # Generate HTML report
  npx tsx evals/report-evals.ts -f json            # Generate JSON report
  npx tsx evals/report-evals.ts -o my-report.html  # Custom output path
  `);
}

async function loadAllMetadata(): Promise<AdjustedMetadata[]> {
  const results: AdjustedMetadata[] = [];

  const contentDirs = await fs.readdir(COLLECTED_DIR);

  for (const contentId of contentDirs) {
    const contentPath = path.join(COLLECTED_DIR, contentId);
    const stat = await fs.stat(contentPath);
    if (!stat.isDirectory()) continue;

    const outputDirs = await fs.readdir(contentPath);

    for (const outputDir of outputDirs) {
      const metadataPath = path.join(contentPath, outputDir, 'metadata.json');

      try {
        const content = await fs.readFile(metadataPath, 'utf-8');
        const metadata: CollectionMetadata = JSON.parse(content);

        // Skip failed generations or evals with errors
        if (!metadata.success) continue;
        if (!metadata.evals) continue;
        if (metadata.evals.error) continue;

        // Calculate adjusted composite with diagram failure penalty
        const adjusted = calculateAdjustedComposite(metadata);

        results.push({
          ...metadata,
          adjustedComposite: adjusted,
        });
      } catch (error) {
        console.warn(`⚠️  Skipping ${metadataPath}: ${error}`);
      }
    }
  }

  return results;
}

function calculateAdjustedComposite(metadata: CollectionMetadata): {
  score: number;
  diagramPenalty: number;
  adjustedDiagramAvg: number | null;
  originalDiagramAvg: number | null;
} {
  const evals = metadata.evals!;
  const evaluatedDiagrams = evals.diagrams.length;
  const failedDiagrams = metadata.diagramsFailed;

  // Calculate diagram penalty based on failure rate
  // totalAttempted = evaluated + failed
  // penalty = 1 - (failed / totalAttempted)
  let diagramPenalty = 1;
  let adjustedDiagramAvg = evals.composite.diagramAvg;

  if (evaluatedDiagrams > 0 || failedDiagrams > 0) {
    const totalAttempted = evaluatedDiagrams + failedDiagrams;
    if (totalAttempted > 0 && failedDiagrams > 0) {
      diagramPenalty = 1 - failedDiagrams / totalAttempted;
      if (evals.composite.diagramAvg !== null) {
        adjustedDiagramAvg = evals.composite.diagramAvg * diagramPenalty;
      }
    }
  }

  // Recalculate composite score with adjusted diagram average
  const weights = adjustedDiagramAvg === null ? WEIGHTS_NO_DIAGRAMS : WEIGHTS;

  const score =
    evals.summaryQuality.overall_score * weights.summary +
    evals.grounding.overall_score * weights.grounding +
    evals.sectionQuality.overall_score * weights.section +
    (adjustedDiagramAvg ?? 0) * weights.diagram;

  return {
    score: Math.round(score * 100) / 100,
    diagramPenalty: Math.round(diagramPenalty * 100) / 100,
    adjustedDiagramAvg: adjustedDiagramAvg ? Math.round(adjustedDiagramAvg * 100) / 100 : null,
    originalDiagramAvg: evals.composite.diagramAvg,
  };
}

function groupBy<T, K extends string | number>(items: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const existing = groups.get(key) || [];
    existing.push(item);
    groups.set(key, existing);
  }
  return groups;
}

function avg(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

function aggregateByModel(data: AdjustedMetadata[]): ModelStats[] {
  const grouped = groupBy(data, (m) => m.modelId);
  const stats: ModelStats[] = [];

  for (const [modelId, outputs] of grouped) {
    const diagramAvgs = outputs
      .map((o) => o.adjustedComposite.originalDiagramAvg)
      .filter((v): v is number => v !== null);

    const totalDiagrams = outputs.reduce((sum, o) => sum + o.evals!.diagrams.length, 0);
    const totalFailed = outputs.reduce((sum, o) => sum + o.diagramsFailed, 0);

    stats.push({
      modelId,
      count: outputs.length,
      avgComposite: round(avg(outputs.map((o) => o.evals!.composite.score))),
      avgAdjustedComposite: round(avg(outputs.map((o) => o.adjustedComposite.score))),
      avgSummary: round(avg(outputs.map((o) => o.evals!.summaryQuality.overall_score))),
      avgGrounding: round(avg(outputs.map((o) => o.evals!.grounding.overall_score))),
      avgSection: round(avg(outputs.map((o) => o.evals!.sectionQuality.overall_score))),
      avgDiagram: diagramAvgs.length > 0 ? round(avg(diagramAvgs)) : null,
      avgDiagramFailRate:
        totalDiagrams + totalFailed > 0 ? round(totalFailed / (totalDiagrams + totalFailed)) : 0,
      totalDiagrams,
      totalDiagramsFailed: totalFailed,
      costPer1MTokens: MODEL_PRICING[modelId] ?? null,
    });
  }

  // Sort by adjusted composite score descending
  return stats.sort((a, b) => b.avgAdjustedComposite - a.avgAdjustedComposite);
}

function aggregateByPrompt(data: AdjustedMetadata[]): PromptStats[] {
  const grouped = groupBy(data, (m) => m.promptId);
  const stats: PromptStats[] = [];

  for (const [promptId, outputs] of grouped) {
    const diagramAvgs = outputs
      .map((o) => o.adjustedComposite.originalDiagramAvg)
      .filter((v): v is number => v !== null);

    stats.push({
      promptId,
      count: outputs.length,
      avgComposite: round(avg(outputs.map((o) => o.evals!.composite.score))),
      avgAdjustedComposite: round(avg(outputs.map((o) => o.adjustedComposite.score))),
      avgSummary: round(avg(outputs.map((o) => o.evals!.summaryQuality.overall_score))),
      avgGrounding: round(avg(outputs.map((o) => o.evals!.grounding.overall_score))),
      avgSection: round(avg(outputs.map((o) => o.evals!.sectionQuality.overall_score))),
      avgDiagram: diagramAvgs.length > 0 ? round(avg(diagramAvgs)) : null,
    });
  }

  return stats.sort((a, b) => b.avgAdjustedComposite - a.avgAdjustedComposite);
}

function aggregateByContent(data: AdjustedMetadata[]): ContentStats[] {
  const grouped = groupBy(data, (m) => m.contentId);
  const stats: ContentStats[] = [];

  for (const [contentId, outputs] of grouped) {
    const diagramAvgs = outputs
      .map((o) => o.adjustedComposite.originalDiagramAvg)
      .filter((v): v is number => v !== null);

    stats.push({
      contentId,
      count: outputs.length,
      avgComposite: round(avg(outputs.map((o) => o.evals!.composite.score))),
      avgAdjustedComposite: round(avg(outputs.map((o) => o.adjustedComposite.score))),
      avgSummary: round(avg(outputs.map((o) => o.evals!.summaryQuality.overall_score))),
      avgGrounding: round(avg(outputs.map((o) => o.evals!.grounding.overall_score))),
      avgSection: round(avg(outputs.map((o) => o.evals!.sectionQuality.overall_score))),
      avgDiagram: diagramAvgs.length > 0 ? round(avg(diagramAvgs)) : null,
    });
  }

  return stats.sort((a, b) => b.avgAdjustedComposite - a.avgAdjustedComposite);
}

function round(n: number, decimals = 2): number {
  return Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Calculate Pareto frontier for cost vs quality.
 * A model is on the frontier if no other model has both lower cost AND higher quality.
 * Returns model IDs that are on the Pareto frontier, sorted by cost ascending.
 */
function calculateParetoFrontier(
  modelStats: ModelStats[]
): { modelId: string; cost: number; score: number }[] {
  // Filter to models with known pricing
  const modelsWithCost = modelStats.filter((m) => m.costPer1MTokens !== null);

  // Sort by cost ascending
  const sorted = [...modelsWithCost].sort((a, b) => a.costPer1MTokens! - b.costPer1MTokens!);

  const frontier: { modelId: string; cost: number; score: number }[] = [];
  let maxScore = -Infinity;

  // Sweep from lowest cost to highest
  // A model is on the frontier if it has a higher score than all cheaper models
  for (const model of sorted) {
    if (model.avgAdjustedComposite > maxScore) {
      frontier.push({
        modelId: model.modelId,
        cost: model.costPer1MTokens!,
        score: model.avgAdjustedComposite,
      });
      maxScore = model.avgAdjustedComposite;
    }
  }

  return frontier;
}

interface ExtremeResult {
  label: string;
  value: number;
  metadata: AdjustedMetadata;
}

function findExtremes(data: AdjustedMetadata[]): {
  bestOverall: ExtremeResult;
  worstOverall: ExtremeResult;
  bestSummary: ExtremeResult;
  bestGrounding: ExtremeResult;
  bestDiagram: ExtremeResult | null;
  worstDiagramFailRate: ExtremeResult | null;
} {
  const sortedByComposite = [...data].sort(
    (a, b) => b.adjustedComposite.score - a.adjustedComposite.score
  );

  const sortedBySummary = [...data].sort(
    (a, b) => b.evals!.summaryQuality.overall_score - a.evals!.summaryQuality.overall_score
  );

  const sortedByGrounding = [...data].sort(
    (a, b) => b.evals!.grounding.overall_score - a.evals!.grounding.overall_score
  );

  const withDiagrams = data.filter((d) => d.evals!.diagrams.length > 0);
  const sortedByDiagram = [...withDiagrams].sort(
    (a, b) => (b.evals!.composite.diagramAvg ?? 0) - (a.evals!.composite.diagramAvg ?? 0)
  );

  const withFailures = data.filter((d) => d.diagramsFailed > 0);
  const sortedByFailRate = [...withFailures].sort((a, b) => {
    const rateA = a.diagramsFailed / (a.evals!.diagrams.length + a.diagramsFailed);
    const rateB = b.diagramsFailed / (b.evals!.diagrams.length + b.diagramsFailed);
    return rateB - rateA;
  });

  const format = (m: AdjustedMetadata) => `${m.contentId} / ${m.promptId} / ${m.modelId}`;

  return {
    bestOverall: {
      label: format(sortedByComposite[0]),
      value: sortedByComposite[0].adjustedComposite.score,
      metadata: sortedByComposite[0],
    },
    worstOverall: {
      label: format(sortedByComposite[sortedByComposite.length - 1]),
      value: sortedByComposite[sortedByComposite.length - 1].adjustedComposite.score,
      metadata: sortedByComposite[sortedByComposite.length - 1],
    },
    bestSummary: {
      label: format(sortedBySummary[0]),
      value: sortedBySummary[0].evals!.summaryQuality.overall_score,
      metadata: sortedBySummary[0],
    },
    bestGrounding: {
      label: format(sortedByGrounding[0]),
      value: sortedByGrounding[0].evals!.grounding.overall_score,
      metadata: sortedByGrounding[0],
    },
    bestDiagram:
      sortedByDiagram.length > 0
        ? {
            label: format(sortedByDiagram[0]),
            value: sortedByDiagram[0].evals!.composite.diagramAvg!,
            metadata: sortedByDiagram[0],
          }
        : null,
    worstDiagramFailRate:
      sortedByFailRate.length > 0
        ? {
            label: format(sortedByFailRate[0]),
            value: round(
              sortedByFailRate[0].diagramsFailed /
                (sortedByFailRate[0].evals!.diagrams.length + sortedByFailRate[0].diagramsFailed)
            ),
            metadata: sortedByFailRate[0],
          }
        : null,
  };
}

function generateHtmlReport(
  data: AdjustedMetadata[],
  modelStats: ModelStats[],
  promptStats: PromptStats[],
  contentStats: ContentStats[],
  extremes: ReturnType<typeof findExtremes>,
  paretoFrontier: ReturnType<typeof calculateParetoFrontier>
): string {
  const timestamp = new Date().toISOString();
  const totalOutputs = data.length;
  const avgAdjustedComposite = round(avg(data.map((d) => d.adjustedComposite.score)));
  const avgOriginalComposite = round(avg(data.map((d) => d.evals!.composite.score)));

  // Prepare cost vs quality data for scatter chart
  const modelsWithCost = modelStats.filter((m) => m.costPer1MTokens !== null);
  const paretoModelIds = new Set(paretoFrontier.map((p) => p.modelId));

  // Helper to strip provider prefix (e.g., "openai/gpt-4o" → "gpt-4o")
  function stripProvider(name: string): string {
    return name.replace(/^[a-zA-Z0-9_-]+\//, '');
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Viz-Notes Evaluation Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; color: #1a1a1a; }
    h2 { font-size: 1.5rem; margin: 2rem 0 1rem; color: #2a2a2a; border-bottom: 2px solid #e0e0e0; padding-bottom: 0.5rem; }
    h3 { font-size: 1.2rem; margin: 1.5rem 0 0.75rem; color: #3a3a3a; }
    .meta { color: #666; font-size: 0.9rem; margin-bottom: 2rem; }
    .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .card { background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .card-title { font-size: 0.85rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem; }
    .card-value { font-size: 2rem; font-weight: 600; color: #1a1a1a; }
    .card-detail { font-size: 0.85rem; color: #888; margin-top: 0.25rem; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: 600; color: #555; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; }
    tr:hover { background: #fafafa; }
    tr:last-child td { border-bottom: none; }
    .score { font-weight: 600; }
    .score-high { color: #22c55e; }
    .score-mid { color: #f59e0b; }
    .score-low { color: #ef4444; }
    .rank { display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; font-size: 0.75rem; font-weight: 600; }
    .rank-1 { background: #ffd700; color: #000; }
    .rank-2 { background: #c0c0c0; color: #000; }
    .rank-3 { background: #cd7f32; color: #fff; }
    .rank-other { background: #e0e0e0; color: #666; }
    .penalty { color: #ef4444; font-size: 0.85rem; }
    .extremes { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
    .extreme-card { background: white; border-radius: 8px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .extreme-card h4 { font-size: 0.85rem; color: #666; margin-bottom: 0.5rem; }
    .extreme-card .value { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.25rem; }
    .extreme-card .label { font-size: 0.85rem; color: #888; word-break: break-all; }
    .weights-info { background: #f8f9fa; border-radius: 8px; padding: 1rem; margin-bottom: 2rem; font-size: 0.9rem; }
    .weights-info code { background: #e0e0e0; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    .model-name { font-family: monospace; font-size: 0.9rem; }
    .chart-container { background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 2rem; }
    .chart-wrapper { position: relative; height: 400px; }
    .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Viz-Notes Evaluation Report</h1>
    <p class="meta">Generated: ${timestamp} | Total Outputs: ${totalOutputs}</p>

    <div class="summary-cards">
      <div class="card">
        <div class="card-title">Avg Adjusted Composite</div>
        <div class="card-value ${getScoreClass(avgAdjustedComposite)}">${avgAdjustedComposite}</div>
        <div class="card-detail">With diagram failure penalty</div>
      </div>
      <div class="card">
        <div class="card-title">Avg Original Composite</div>
        <div class="card-value">${avgOriginalComposite}</div>
        <div class="card-detail">Without penalty</div>
      </div>
      <div class="card">
        <div class="card-title">Total Outputs</div>
        <div class="card-value">${totalOutputs}</div>
        <div class="card-detail">Evaluated successfully</div>
      </div>
      <div class="card">
        <div class="card-title">Models Tested</div>
        <div class="card-value">${modelStats.length}</div>
      </div>
    </div>

    <div class="weights-info">
      <strong>Scoring Weights:</strong>
      Summary <code>25%</code> | Grounding <code>25%</code> | Section <code>20%</code> | Diagram <code>30%</code><br>
      <strong>Diagram Penalty:</strong> <code>adjustedDiagramScore = diagramAvg × (1 - failureRate)</code>
    </div>

    <h2>📊 Performance Charts</h2>
    <div class="chart-container">
      <h3>Model Performance Across All Rubrics</h3>
      <div class="chart-wrapper">
        <canvas id="modelRubricsChart"></canvas>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-container">
        <h3>Summary Quality by Model</h3>
        <div class="chart-wrapper">
          <canvas id="summaryChart"></canvas>
        </div>
      </div>
      <div class="chart-container">
        <h3>Grounding by Model</h3>
        <div class="chart-wrapper">
          <canvas id="groundingChart"></canvas>
        </div>
      </div>
      <div class="chart-container">
        <h3>Section Quality by Model</h3>
        <div class="chart-wrapper">
          <canvas id="sectionChart"></canvas>
        </div>
      </div>
      <div class="chart-container">
        <h3>Diagram Quality by Model</h3>
        <div class="chart-wrapper">
          <canvas id="diagramChart"></canvas>
        </div>
      </div>
    </div>

    <div class="chart-container">
      <h3>Cost vs Quality (Pareto Frontier)</h3>
      <p style="font-size: 0.85rem; color: #666; margin-bottom: 1rem;">
        Models on the Pareto frontier (connected line) offer the best value at their price point.
        Models below the frontier are dominated by better alternatives.
      </p>
      <div class="chart-wrapper">
        <canvas id="paretoChart"></canvas>
      </div>
    </div>

    <h2>🏆 Model Rankings</h2>
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Model</th>
          <th>Cost/1M</th>
          <th>Adjusted Score</th>
          <th>Original Score</th>
          <th>Summary</th>
          <th>Grounding</th>
          <th>Section</th>
          <th>Diagram</th>
          <th>Fail Rate</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        ${modelStats
          .map(
            (m, i) => `
        <tr>
          <td><span class="rank ${getRankClass(i + 1)}">${i + 1}</span></td>
          <td class="model-name">${m.modelId}</td>
          <td>${m.costPer1MTokens !== null ? '$' + m.costPer1MTokens : '-'}</td>
          <td class="score ${getScoreClass(m.avgAdjustedComposite)}">${m.avgAdjustedComposite}</td>
          <td>${m.avgComposite}</td>
          <td>${m.avgSummary}</td>
          <td>${m.avgGrounding}</td>
          <td>${m.avgSection}</td>
          <td>${m.avgDiagram ?? '-'}</td>
          <td class="${m.avgDiagramFailRate > 0.2 ? 'penalty' : ''}">${formatPercent(m.avgDiagramFailRate)}</td>
          <td>${m.count}</td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>

    <h2>📝 Prompt Rankings</h2>
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Prompt</th>
          <th>Adjusted Score</th>
          <th>Original Score</th>
          <th>Summary</th>
          <th>Grounding</th>
          <th>Section</th>
          <th>Diagram</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        ${promptStats
          .map(
            (p, i) => `
        <tr>
          <td><span class="rank ${getRankClass(i + 1)}">${i + 1}</span></td>
          <td>${p.promptId}</td>
          <td class="score ${getScoreClass(p.avgAdjustedComposite)}">${p.avgAdjustedComposite}</td>
          <td>${p.avgComposite}</td>
          <td>${p.avgSummary}</td>
          <td>${p.avgGrounding}</td>
          <td>${p.avgSection}</td>
          <td>${p.avgDiagram ?? '-'}</td>
          <td>${p.count}</td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>

    <h2>📄 Content Difficulty</h2>
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Content</th>
          <th>Adjusted Score</th>
          <th>Original Score</th>
          <th>Summary</th>
          <th>Grounding</th>
          <th>Section</th>
          <th>Diagram</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        ${contentStats
          .map(
            (c, i) => `
        <tr>
          <td><span class="rank ${getRankClass(i + 1)}">${i + 1}</span></td>
          <td>${c.contentId}</td>
          <td class="score ${getScoreClass(c.avgAdjustedComposite)}">${c.avgAdjustedComposite}</td>
          <td>${c.avgComposite}</td>
          <td>${c.avgSummary}</td>
          <td>${c.avgGrounding}</td>
          <td>${c.avgSection}</td>
          <td>${c.avgDiagram ?? '-'}</td>
          <td>${c.count}</td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>

    <h2>🎯 Extremes</h2>
    <div class="extremes">
      <div class="extreme-card">
        <h4>🥇 Best Overall</h4>
        <div class="value score-high">${extremes.bestOverall.value}</div>
        <div class="label">${extremes.bestOverall.label}</div>
      </div>
      <div class="extreme-card">
        <h4>📉 Worst Overall</h4>
        <div class="value score-low">${extremes.worstOverall.value}</div>
        <div class="label">${extremes.worstOverall.label}</div>
      </div>
      <div class="extreme-card">
        <h4>📝 Best Summary</h4>
        <div class="value">${extremes.bestSummary.value}</div>
        <div class="label">${extremes.bestSummary.label}</div>
      </div>
      <div class="extreme-card">
        <h4>✅ Best Grounding</h4>
        <div class="value">${extremes.bestGrounding.value}</div>
        <div class="label">${extremes.bestGrounding.label}</div>
      </div>
      ${
        extremes.bestDiagram
          ? `
      <div class="extreme-card">
        <h4>🎨 Best Diagram</h4>
        <div class="value">${extremes.bestDiagram.value}</div>
        <div class="label">${extremes.bestDiagram.label}</div>
      </div>`
          : ''
      }
      ${
        extremes.worstDiagramFailRate
          ? `
      <div class="extreme-card">
        <h4>❌ Highest Diagram Fail Rate</h4>
        <div class="value score-low">${formatPercent(extremes.worstDiagramFailRate.value)}</div>
        <div class="label">${extremes.worstDiagramFailRate.label}</div>
      </div>`
          : ''
      }
    </div>

    <h2>📋 All Results (Top 20)</h2>
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Content</th>
          <th>Prompt</th>
          <th>Model</th>
          <th>Adjusted</th>
          <th>Original</th>
          <th>Penalty</th>
          <th>Diagrams</th>
          <th>Failed</th>
        </tr>
      </thead>
      <tbody>
        ${[...data]
          .sort((a, b) => b.adjustedComposite.score - a.adjustedComposite.score)
          .slice(0, 20)
          .map(
            (d, i) => `
        <tr>
          <td><span class="rank ${getRankClass(i + 1)}">${i + 1}</span></td>
          <td>${d.contentId}</td>
          <td>${d.promptId}</td>
          <td class="model-name">${d.modelId}</td>
          <td class="score ${getScoreClass(d.adjustedComposite.score)}">${d.adjustedComposite.score}</td>
          <td>${d.evals!.composite.score}</td>
          <td class="${d.adjustedComposite.diagramPenalty < 1 ? 'penalty' : ''}">${formatPercent(1 - d.adjustedComposite.diagramPenalty)}</td>
          <td>${d.evals!.diagrams.length}</td>
          <td class="${d.diagramsFailed > 0 ? 'penalty' : ''}">${d.diagramsFailed}</td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>
  </div>

  <script>
    // Prepare data
    const modelLabels = ${JSON.stringify(modelStats.map((m) => m.modelId))};
    const summaryData = ${JSON.stringify(modelStats.map((m) => m.avgSummary))};
    const groundingData = ${JSON.stringify(modelStats.map((m) => m.avgGrounding))};
    const sectionData = ${JSON.stringify(modelStats.map((m) => m.avgSection))};
    const diagramData = ${JSON.stringify(modelStats.map((m) => m.avgDiagram))};

    // Color palette
    const colors = {
      summary: '#3b82f6',
      grounding: '#10b981',
      section: '#f59e0b',
      diagram: '#8b5cf6',
    };

    // Common chart options
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          ticks: {
            stepSize: 1
          }
        }
      }
    };

    // Grouped bar chart - Model Performance Across All Rubrics
    new Chart(document.getElementById('modelRubricsChart'), {
      type: 'bar',
      data: {
        labels: modelLabels,
        datasets: [
          {
            label: 'Summary',
            data: summaryData,
            backgroundColor: colors.summary,
            borderColor: colors.summary,
            borderWidth: 1
          },
          {
            label: 'Grounding',
            data: groundingData,
            backgroundColor: colors.grounding,
            borderColor: colors.grounding,
            borderWidth: 1
          },
          {
            label: 'Section',
            data: sectionData,
            backgroundColor: colors.section,
            borderColor: colors.section,
            borderWidth: 1
          },
          {
            label: 'Diagram',
            data: diagramData,
            backgroundColor: colors.diagram,
            borderColor: colors.diagram,
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });

    // Individual rubric charts
    new Chart(document.getElementById('summaryChart'), {
      type: 'bar',
      data: {
        labels: modelLabels,
        datasets: [{
          data: summaryData,
          backgroundColor: colors.summary,
          borderColor: colors.summary,
          borderWidth: 1
        }]
      },
      options: commonOptions
    });

    new Chart(document.getElementById('groundingChart'), {
      type: 'bar',
      data: {
        labels: modelLabels,
        datasets: [{
          data: groundingData,
          backgroundColor: colors.grounding,
          borderColor: colors.grounding,
          borderWidth: 1
        }]
      },
      options: commonOptions
    });

    new Chart(document.getElementById('sectionChart'), {
      type: 'bar',
      data: {
        labels: modelLabels,
        datasets: [{
          data: sectionData,
          backgroundColor: colors.section,
          borderColor: colors.section,
          borderWidth: 1
        }]
      },
      options: commonOptions
    });

    new Chart(document.getElementById('diagramChart'), {
      type: 'bar',
      data: {
        labels: modelLabels,
        datasets: [{
          data: diagramData,
          backgroundColor: colors.diagram,
          borderColor: colors.diagram,
          borderWidth: 1
        }]
      },
      options: commonOptions
    });

    // Pareto Chart - Cost vs Quality
    const costQualityData = ${JSON.stringify(
      modelsWithCost.map((m) => ({
        x: m.costPer1MTokens,
        y: m.avgAdjustedComposite,
        label: stripProvider(m.modelId),
        fullLabel: m.modelId,
        isPareto: paretoModelIds.has(m.modelId),
      }))
    )};

    const paretoLineData = ${JSON.stringify(
      paretoFrontier.map((p) => ({ x: p.cost, y: p.score }))
    )};

    const paretoPoints = costQualityData.filter(d => d.isPareto);
    const nonParetoPoints = costQualityData.filter(d => !d.isPareto);

    // Register inline labels plugin
    const inlineLabelsPlugin = {
      id: 'inlineLabels',
      afterDraw: function(chart) {
        const ctx = chart.ctx;
        const labelsToShow = ['devstral', 'gpt-5-mini', 'sonnet-4.5', 'gemini-3-flash', 'grok-code-fast', 'gpt-4o-mini'];

        chart.data.datasets.forEach((dataset, datasetIndex) => {
          const meta = chart.getDatasetMeta(datasetIndex);
          if (dataset.label === 'Pareto Optimal' || dataset.label === 'Other Models') {
            meta.data.forEach((point, index) => {
              const data = dataset.data[index];
              if (data.label && labelsToShow.some(l => data.label.includes(l))) {
                ctx.save();
                ctx.font = dataset.label === 'Pareto Optimal' ? 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif' : 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
                ctx.fillStyle = dataset.label === 'Pareto Optimal' ? '#0a5f0a' : '#374151';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';

                const x = point.x + 12;
                const y = point.y;

                ctx.fillText(data.label, x, y);
                ctx.restore();
              }
            });
          }
        });
      }
    };

    // Calculate max values for better scale
    const maxCost = Math.max(...costQualityData.map(d => d.x), 10);
    const maxScore = Math.max(...costQualityData.map(d => d.y), 5);

    Chart.register(inlineLabelsPlugin);

    new Chart(document.getElementById('paretoChart'), {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Pareto Frontier',
            data: paretoLineData,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderWidth: 2,
            fill: false,
            showLine: true,
            pointRadius: 0,
            tension: 0,
            order: 2
          },
          {
            label: 'Pareto Optimal',
            data: paretoPoints,
            backgroundColor: '#22c55e',
            borderColor: '#166534',
            borderWidth: 2,
            pointRadius: 10,
            pointHoverRadius: 12,
            order: 1
          },
          {
            label: 'Other Models',
            data: nonParetoPoints,
            backgroundColor: '#94a3b8',
            borderColor: '#64748b',
            borderWidth: 1,
            pointRadius: 7,
            pointHoverRadius: 9,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const point = context.raw;
                if (point.fullLabel) {
                  return point.fullLabel + ': $' + point.x + '/1M, Score: ' + point.y;
                }
                return 'Cost: $' + point.x + ', Score: ' + point.y;
              }
            }
          },
          inlineLabels: {
            display: true
          }
        },
        scales: {
          x: {
            type: 'linear',
            title: {
              display: true,
              text: 'Cost ($ per 1M output tokens)',
              font: { weight: 'bold' }
            },
            min: 0,
            max: Math.min(maxCost * 1.1, 20),
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Avg Adjusted Composite Score',
              font: { weight: 'bold' }
            },
            min: 0,
            max: Math.min(maxScore * 1.1, 5),
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        }
      }
    });
  </script>
</body>
</html>`;
}

function getScoreClass(score: number): string {
  if (score >= 4) return 'score-high';
  if (score >= 3) return 'score-mid';
  return 'score-low';
}

function getRankClass(rank: number): string {
  if (rank === 1) return 'rank-1';
  if (rank === 2) return 'rank-2';
  if (rank === 3) return 'rank-3';
  return 'rank-other';
}

function formatPercent(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function generateJsonReport(
  data: AdjustedMetadata[],
  modelStats: ModelStats[],
  promptStats: PromptStats[],
  contentStats: ContentStats[],
  extremes: ReturnType<typeof findExtremes>,
  paretoFrontier: ReturnType<typeof calculateParetoFrontier>
): string {
  return JSON.stringify(
    {
      generated: new Date().toISOString(),
      totalOutputs: data.length,
      weights: WEIGHTS,
      summary: {
        avgAdjustedComposite: round(avg(data.map((d) => d.adjustedComposite.score))),
        avgOriginalComposite: round(avg(data.map((d) => d.evals!.composite.score))),
      },
      byModel: modelStats,
      byPrompt: promptStats,
      byContent: contentStats,
      paretoFrontier,
      extremes: {
        bestOverall: { ...extremes.bestOverall, metadata: undefined },
        worstOverall: { ...extremes.worstOverall, metadata: undefined },
        bestSummary: { ...extremes.bestSummary, metadata: undefined },
        bestGrounding: { ...extremes.bestGrounding, metadata: undefined },
        bestDiagram: extremes.bestDiagram ? { ...extremes.bestDiagram, metadata: undefined } : null,
        worstDiagramFailRate: extremes.worstDiagramFailRate
          ? { ...extremes.worstDiagramFailRate, metadata: undefined }
          : null,
      },
      allResults: data
        .map((d) => ({
          contentId: d.contentId,
          promptId: d.promptId,
          modelId: d.modelId,
          adjustedComposite: d.adjustedComposite.score,
          originalComposite: d.evals!.composite.score,
          diagramPenalty: d.adjustedComposite.diagramPenalty,
          diagramsEvaluated: d.evals!.diagrams.length,
          diagramsFailed: d.diagramsFailed,
          summaryScore: d.evals!.summaryQuality.overall_score,
          groundingScore: d.evals!.grounding.overall_score,
          sectionScore: d.evals!.sectionQuality.overall_score,
          diagramAvg: d.evals!.composite.diagramAvg,
        }))
        .sort((a, b) => b.adjustedComposite - a.adjustedComposite),
    },
    null,
    2
  );
}

async function run() {
  const args = parseCliArgs();

  if (args.help) {
    printHelp();
    return;
  }

  console.log('Loading evaluation data...');
  const data = await loadAllMetadata();

  if (data.length === 0) {
    console.error('No evaluated outputs found. Run `npx tsx evals/run-evals.ts` first.');
    process.exit(1);
  }

  console.log(`   Found ${data.length} evaluated outputs`);

  // Aggregate statistics
  console.log('Aggregating statistics...');
  const modelStats = aggregateByModel(data);
  const promptStats = aggregateByPrompt(data);
  const contentStats = aggregateByContent(data);
  const extremes = findExtremes(data);
  const paretoFrontier = calculateParetoFrontier(modelStats);

  // Generate report
  const format = (args.format as string) || 'html';
  const defaultOutput = format === 'json' ? 'report.json' : 'report.html';
  const outputPath = (args.output as string) || path.join(RESULTS_DIR, defaultOutput);

  // Ensure results directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  let content: string;
  if (format === 'json') {
    content = generateJsonReport(
      data,
      modelStats,
      promptStats,
      contentStats,
      extremes,
      paretoFrontier
    );
  } else {
    content = generateHtmlReport(
      data,
      modelStats,
      promptStats,
      contentStats,
      extremes,
      paretoFrontier
    );
  }

  await fs.writeFile(outputPath, content);
  console.log(` Report generated: ${outputPath}`);

  // Print quick summary
  console.log('Quick Summary:');
  console.log(
    `   Avg Adjusted Composite: ${round(avg(data.map((d) => d.adjustedComposite.score)))}`
  );
  console.log(
    `   Avg Original Composite: ${round(avg(data.map((d) => d.evals!.composite.score)))}`
  );
  console.log(`   Best Model: ${modelStats[0].modelId} (${modelStats[0].avgAdjustedComposite})`);
  console.log(
    `   Best Prompt: ${promptStats[0].promptId} (${promptStats[0].avgAdjustedComposite})`
  );
}

run().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
