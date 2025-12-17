import { promises as fs } from 'fs';
import path from 'path';
import { streamText } from 'ai';
import { getPromptForMode } from '@/lib/deepDivePrompts';
import { logger } from '@/lib/logger';
import { createOpenRouterClient } from '@/lib/api/openrouter';
import { LLM_MODELS, MAX_DURATIONS_SECS } from '@/lib/constants';

const openrouter = createOpenRouterClient(process.env.OPENROUTER_API_KEY as string);
export const maxDuration = MAX_DURATIONS_SECS.DEEP_DIVE;

type DeepDiveRequest = {
  nodeId: string;
  mode: 'eli5' | 'analogy' | 'mental-model';
  blockTitle: string;
  blockSummary: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { mode, blockTitle, blockSummary } = body as DeepDiveRequest;

    if (!['eli5', 'analogy', 'mental-model'].includes(mode)) {
      return new Response('Invalid mode', { status: 400 });
    }

    const contentPath = path.join(process.cwd(), 'public', 'data', 'content.md');
    let fullDocument = '';

    try {
      fullDocument = await fs.readFile(contentPath, 'utf-8');
    } catch (error) {
      logger.error({ error, contentPath }, 'Error reading content file');
      return new Response('Unable to load source content', { status: 500 });
    }

    const modePrompt = getPromptForMode(mode);

    const fullPrompt = `${modePrompt}

---

## CONTEXT (Full Document):
This is the complete source material for reference:

${fullDocument}

---

## SPECIFIC SECTION TO EXPLAIN:
**Title**: ${blockTitle}

**Content**: ${blockSummary}

---

Now, provide your ${mode.toUpperCase()} explanation for this specific section. Follow the format and guidelines exactly. Make sure to ground your explanation in the source material above.
`;

    const result = streamText({
      model: openrouter(LLM_MODELS.DEEP_DIVE),
      prompt: fullPrompt,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    logger.error({ error }, 'Deep dive error');
    return new Response('Internal server error', { status: 500 });
  }
}
