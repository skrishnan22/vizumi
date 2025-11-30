import path from 'path';
import fs from 'fs/promises';

import { LLMNoteSchema, type LLMNote } from '../src/lib/schemas.js';
import {
  SYSTEM_PROMPT,
  SYSTEM_PROMPT_2,
  SYSTEM_PROMPT_3,
} from '../src/lib/prompts.js';
import { renderD2ToSvg } from '../src/lib/d2.js';

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
  rawResponse: string;
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

const D2_THEMES = [
  `vars: { d2-config: { theme-id: 101 } }
*: { style: { stroke-width: 2; fill-pattern: lines; stroke: "#1e1e1e"; fill: "#ffec99" } }`,
  `vars: { d2-config: { theme-id: 101 } }
*: { style: { stroke-width: 2; fill-pattern: lines; stroke: "#1e1e1e"; fill: "#a5d8ff" } }`,
  `vars: { d2-config: { theme-id: 101 } }
*: { style: { stroke-width: 2; fill-pattern: lines; stroke: "#1e1e1e"; fill: "#b2f2bb" } }`,
  `vars: { d2-config: { theme-id: 101 } }
*: { style: { stroke-width: 2; fill-pattern: lines; stroke: "#1e1e1e"; fill: "#ffc9c9" } }`,
  `vars: { d2-config: { theme-id: 101 } }
*: { style: { stroke-width: 2; fill-pattern: lines; stroke: "#1e1e1e"; fill: "#e5dbff" } }`,
];

function extractD2ErrorMessage(error: unknown): string {
  const rawMessage =
    error instanceof Error ? error.message : 'Unknown rendering error';

  const tryParse = (text: string) => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const trimmed = rawMessage.trim();
  let parsed = tryParse(trimmed);

  if (!parsed) {
    const bracketIndex = trimmed.indexOf('[');
    if (bracketIndex !== -1) {
      parsed = tryParse(trimmed.slice(bracketIndex));
    }
  }

  if (Array.isArray(parsed)) {
    const formatted = parsed
      .map((item) => {
        if (item && typeof item === 'object') {
          if (typeof item.errmsg === 'string') {
            return item.errmsg;
          }
          if (typeof item.message === 'string') {
            return item.message;
          }
        }
        return JSON.stringify(item);
      })
      .filter(Boolean)
      .join(' ');

    if (formatted) {
      return `Unable to render diagram: ${formatted}`;
    }
  }

  return `Unable to render diagram: ${trimmed}`;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

type RenderSuccess = {
  ok: true;
  svg: string;
};

type RenderFailure = {
  ok: false;
  error: string;
};

// async function renderD2ToSvg(code: string): Promise<RenderSuccess | RenderFailure> {
//   try {
//     const trimmed = code?.trim();
//     if (!trimmed) {
//       return { ok: false, error: 'Diagram code is required.' };
//     }

//     const themeIndex = hashCode(trimmed) % D2_THEMES.length;
//     const selectedTheme = D2_THEMES[themeIndex];
//     const diagramSource = `${selectedTheme}\n\n${trimmed}`;

//     const compiled = await d2.compile(diagramSource, {
//       options: {
//         sketch: true,
//         themeID: 101,
//         pad: 24,
//       },
//     });

//     const svg = await d2.render(compiled.diagram, {
//       ...compiled.renderOptions,
//       sketch: true,
//       themeID: 101,
//       pad: 24,
//       noXMLTag: true,
//     });

//     return { ok: true, svg };
//   } catch (error) {
//     return {
//       ok: false,
//       error: extractD2ErrorMessage(error),
//     };
//   }
// }

const SYSTEM_PROMPTS: SystemPromptConfig[] = [
  { id: 'prompt_v1', text: SYSTEM_PROMPT },
  { id: 'prompt_v2', text: SYSTEM_PROMPT_2 },
  { id: 'prompt_v3', text: SYSTEM_PROMPT_3 },
];

const DEFAULT_MODELS = [
  'x-ai/grok-4.1-mini',
  'x-ai/grok-4.1-fast',
  'openai/o4-mini',
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

async function generateNotesPlaceholder(
  _metadata: EvalIterationMetadata,
  content: string,
  prompt: string,
): Promise<string> {
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

async function evaluateD2Diagrams(note?: LLMNote): Promise<D2DiagramCheck[]> {
  if (!note) {
    return [];
  }

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

async function run() {
  console.log('Starting D2 evaluation harness');
  console.log('Eval config:', {
    contentDir: CONFIG.contentDir,
    promptCount: CONFIG.prompts.length,
    modelCount: CONFIG.models.length,
    outputPath: CONFIG.outputPath,
  });

  const contentItems = await loadContentItems(CONFIG.contentDir);

  if (contentItems.length === 0) {
    console.warn('No content items to evaluate. Exiting early.');
    return;
  }

  const iterationResults: EvalIterationResult[] = [];

  for (const content of contentItems) {
    for (const prompt of CONFIG.prompts) {
      for (const model of CONFIG.models) {
        const metadata = {
          contentId: content.id,
          promptId: prompt.id,
          modelId: model,
        };

        console.log(
          `Evaluating content=${metadata.contentId} prompt=${metadata.promptId} model=${metadata.modelId}`,
        );

        const rawResponse = await generateNotesPlaceholder(
          metadata,
          content.text,
          prompt.text,
        );
        const validation = validateLLMResponse(rawResponse);

        const d2Checks = await evaluateD2Diagrams(validation.value);

        iterationResults.push({
          metadata,
          rawResponse,
          jsonParsed: validation.jsonParsed,
          jsonParseError: validation.jsonParseError,
          schemaValidated: validation.schemaValidated,
          schemaError: validation.schemaError,
          parsedValue: validation.value,
          d2Checks,
          timestamp: new Date().toISOString(),
        });

        console.log(
          `Result: parsed=${validation.jsonParsed} schema=${validation.schemaValidated
          }${validation.schemaError ? ` error=${validation.schemaError}` : ''}`,
        );
      }
    }
  }

  console.log(`Completed ${iterationResults.length} evaluation iterations.`);

  const d2ChecksTotal = iterationResults.reduce(
    (sum, result) => sum + result.d2Checks.length,
    0,
  );
  const d2Failures = iterationResults.reduce(
    (sum, result) =>
      sum + result.d2Checks.filter((check) => !check.success).length,
    0,
  );
  console.log(
    `D2 diagrams evaluated: ${d2ChecksTotal}. Failures: ${d2Failures}.`,
  );

  await persistResults(iterationResults, CONFIG.outputPath);
}

run().catch((error) => {
  console.error('Eval run failed:', error);
  process.exitCode = 1;
});
