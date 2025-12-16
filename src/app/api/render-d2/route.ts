import { NextResponse } from 'next/server';
import { D2 } from '@terrastruct/d2';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { D2_SYNTAX_FIX_PROMPT } from '@/lib/prompts';
import { logger } from '@/lib/logger';

const d2 = new D2();

const MAX_FIX_ATTEMPTS = 2;

// Mutex to serialize D2 compile calls - WASM isn't thread-safe
let compileQueue = Promise.resolve();

async function withCompileLock<T>(fn: () => Promise<T>): Promise<T> {
  const currentQueue = compileQueue;
  let resolve: () => void;
  compileQueue = new Promise<void>((r) => {
    resolve = r;
  });

  await currentQueue;
  try {
    return await fn();
  } finally {
    resolve!();
  }
}

// Lazy-init to avoid blocking module load
let _openrouter: ReturnType<typeof createOpenAI> | null = null;
function getOpenRouter() {
  if (!_openrouter) {
    _openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }
  return _openrouter;
}

const D2_THEMES = [
  // Yellow/Orange (Warm)
  `vars: { d2-config: { theme-id: 101 } }
*: { style: { stroke-width: 2; fill-pattern: lines; stroke: "#1e1e1e"; fill: "#ffec99" } }`,
  // Blue (Cool)
  `vars: { d2-config: { theme-id: 101 } }
*: { style: { stroke-width: 2; fill-pattern: lines; stroke: "#1e1e1e"; fill: "#a5d8ff" } }`,
  // Green (Nature)
  `vars: { d2-config: { theme-id: 101 } }
*: { style: { stroke-width: 2; fill-pattern: lines; stroke: "#1e1e1e"; fill: "#b2f2bb" } }`,
  // Red/Pink (Urgent)
  `vars: { d2-config: { theme-id: 101 } }
*: { style: { stroke-width: 2; fill-pattern: lines; stroke: "#1e1e1e"; fill: "#ffc9c9" } }`,
  // Purple (Mystic)
  `vars: { d2-config: { theme-id: 101 } }
*: { style: { stroke-width: 2; fill-pattern: lines; stroke: "#1e1e1e"; fill: "#e5dbff" } }`,
];

function extractD2ErrorMessage(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message : 'Unknown rendering error';

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

// Simple hash function to deterministically pick a theme based on code
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Attempt to fix D2 syntax errors using LLM with timeout
 */
async function fixD2SyntaxWithLLM(d2Code: string, errorMessage: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const { text } = await generateText({
      model: getOpenRouter()('openai/gpt-4o-mini'),
      system: D2_SYNTAX_FIX_PROMPT,
      prompt: `d2Code: ${JSON.stringify(d2Code)}\nerror: ${errorMessage}`,
      abortSignal: controller.signal,
    });

    // Clean up the response - remove any markdown fences if LLM added them
    let fixedCode = text.trim();
    if (fixedCode.startsWith('```d2')) {
      fixedCode = fixedCode.slice(5);
    } else if (fixedCode.startsWith('```')) {
      fixedCode = fixedCode.slice(3);
    }
    if (fixedCode.endsWith('```')) {
      fixedCode = fixedCode.slice(0, -3);
    }

    return fixedCode.trim();
  } finally {
    clearTimeout(timeoutId);
  }
}

type CompileResult =
  | {
      success: true;
      svg: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Attempt to compile and render D2 code (serialized to avoid WASM concurrency issues)
 */
async function tryCompileD2(code: string, theme: string): Promise<CompileResult> {
  return withCompileLock(async () => {
    const fullDiagramSource = `${theme}\n\n${code.trim()}`;

    try {
      const compiled = await d2.compile(fullDiagramSource, {
        options: {
          sketch: true,
          themeID: 101,
          pad: 24,
        },
      });

      const svg = await d2.render(compiled.diagram, {
        ...compiled.renderOptions,
        sketch: true,
        themeID: 101,
        pad: 24,
        noXMLTag: true,
      });

      return { success: true, svg };
    } catch (error) {
      return { success: false, error: extractD2ErrorMessage(error) };
    }
  });
}

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const code = body.code;

    if (typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ error: 'Diagram code is required.' }, { status: 400 });
    }

    // Pick a theme deterministically based on the code content
    const themeIndex = hashCode(code.trim()) % D2_THEMES.length;
    const selectedTheme = D2_THEMES[themeIndex];

    // First attempt: compile original code
    let currentCode = code.trim();
    logger.debug({ codeLength: currentCode.length }, 'Attempting D2 compile');
    let result = await tryCompileD2(currentCode, selectedTheme);
    logger.debug(
      { success: result.success, durationMs: Date.now() - startTime },
      'First D2 compile completed'
    );

    if (result.success) {
      return NextResponse.json({ svg: result.svg });
    }

    // If first attempt fails, try LLM-based fixes
    let lastError = result.error;
    logger.info({ error: lastError.slice(0, 100) }, 'D2 compile failed, attempting LLM fix');

    for (let attempt = 1; attempt <= MAX_FIX_ATTEMPTS; attempt++) {
      try {
        logger.debug({ attempt }, 'Starting LLM fix attempt');
        const fixedCode = await fixD2SyntaxWithLLM(currentCode, lastError);
        logger.debug({ durationMs: Date.now() - startTime }, 'LLM returned fix');

        // Skip if LLM returned the same code
        if (fixedCode === currentCode) {
          logger.info('LLM returned same code, giving up');
          break;
        }

        currentCode = fixedCode;
        result = await tryCompileD2(currentCode, selectedTheme);
        logger.debug(
          { success: result.success, durationMs: Date.now() - startTime },
          'Retry compile completed'
        );

        if (result.success) {
          return NextResponse.json({ svg: result.svg });
        }

        lastError = result.error;
      } catch (llmError) {
        logger.error({ error: llmError, attempt }, 'LLM fix attempt failed');
      }
    }

    // All attempts failed
    logger.warn({ durationMs: Date.now() - startTime }, 'All D2 compile attempts failed');
    return NextResponse.json({ error: lastError }, { status: 500 });
  } catch (error) {
    logger.error({ error, durationMs: Date.now() - startTime }, 'Unexpected error in render-d2');
    const message = extractD2ErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
