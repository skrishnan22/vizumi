import { streamText } from 'ai';
import { getPromptForMode } from '@/lib/deepDivePrompts';
import { logger } from '@/lib/logger';
import { getOpenRouterClient, getModel } from '@/lib/api/route-helpers';
import { handleRouteError } from '@/lib/api/error-handler';
import { MAX_DURATIONS_SECS } from '@/lib/constants';
import { processUrl } from '@/lib/url-processor';

export const maxDuration = MAX_DURATIONS_SECS.DEEP_DIVE;

type DeepDiveRequest = {
  nodeId: string;
  mode: 'eli5' | 'analogy' | 'mental-model';
  blockTitle: string;
  blockSummary: string;
  markdown?: string;
  url?: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { mode, blockTitle, blockSummary, markdown, url } = body as DeepDiveRequest;

    if (!['eli5', 'analogy', 'mental-model'].includes(mode)) {
      return Response.json(
        { error: { code: 'BAD_REQUEST', message: 'Invalid mode', retryable: false } },
        { status: 400 }
      );
    }

    // Get full document context - use provided markdown or fetch from URL
    let fullDocument = '';

    if (markdown && typeof markdown === 'string' && markdown.trim()) {
      fullDocument = markdown;
    } else if (url && typeof url === 'string') {

      try {
        const content = await processUrl(url);
        // processUrl returns content with metadata prefix, extract just the markdown
        const metadataEndIndex = content.indexOf('\n\n');
        fullDocument = metadataEndIndex !== -1 ? content.slice(metadataEndIndex + 2) : content;
      } catch (error: unknown) {
        logger.warn({ error, url }, 'Failed to fetch URL for deep-dive context, proceeding with summary only');

      }
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
