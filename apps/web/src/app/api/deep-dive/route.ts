import { streamText } from 'ai';
import { getPromptForMode } from '@/lib/deepDivePrompts';
import { logger } from '@/lib/logger';
import { getOpenRouterClient, getModel } from '@/lib/api/route-helpers';
import { handleRouteError } from '@/lib/api/error-handler';
import { serializeStreamError } from '@/lib/api/stream-response';
import { processUrl } from '@/lib/url-processor';
import { createSecureDeepDivePrompt } from '@/lib/security';

// Inline literal to satisfy Next.js segment config validation.
export const runtime = 'nodejs';
export const maxDuration = 60;

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

    // Create secure prompt with delimiters to prevent injection from block content
    const securePrompt = createSecureDeepDivePrompt(
      modePrompt,
      fullDocument,
      blockTitle,
      blockSummary,
      mode
    );

    const result = streamText({
      model: openrouter(model),
      prompt: securePrompt,
    });

    return result.toUIMessageStreamResponse({ onError: serializeStreamError });
  } catch (error) {
    return handleRouteError(error);
  }
}
