import { promises as fs } from 'fs';
import path from 'path';
import { streamText } from 'ai';
import { getPromptForMode } from '@/lib/deepDivePrompts';
import { logger } from '@/lib/logger';
import { getOpenRouterClient, getModel } from '@/lib/api/route-helpers';
import { handleRouteError } from '@/lib/api/error-handler';
import { MAX_DURATIONS_SECS } from '@/lib/constants';

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
      return Response.json(
        { error: { code: 'BAD_REQUEST', message: 'Invalid mode', retryable: false } },
        { status: 400 }
      );
    }

    const contentPath = path.join(process.cwd(), 'public', 'data', 'content.md');
    let fullDocument = '';

    try {
      fullDocument = await fs.readFile(contentPath, 'utf-8');
    } catch (error) {
      logger.error({ error, contentPath }, 'Error reading content file');
      return Response.json(
        { error: { code: 'FILE_READ_ERROR', message: 'Unable to load source content', retryable: false } },
        { status: 500 }
      );
    }

    const openrouter = getOpenRouterClient(req);
    const model = getModel(req, 'deepDive');

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
      model: openrouter(model),
      prompt: fullPrompt,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    return handleRouteError(error);
  }
}
