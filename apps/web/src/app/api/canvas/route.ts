import { streamObject } from 'ai';
import { CanvasAgentResponseSchema } from '@/lib/canvas/schemas-v2';
import { CANVAS_AGENT_V2_SYSTEM_PROMPT_SECURE } from '@/lib/canvas/prompts-v2';
import { processUrl } from '@/lib/url-processor';
import { logger } from '@/lib/logger';
import { getOpenRouterClient, getModel } from '@/lib/api/route-helpers';
import { handleRouteError } from '@/lib/api/error-handler';
import { createErrorAwareTextStreamResponse } from '@/lib/api/stream-response';
import { createSecureContentPrompt } from '@/lib/security';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url, markdown } = body;

    if (!url) {
      return Response.json(
        { error: { code: 'BAD_REQUEST', message: 'No URL provided', retryable: false } },
        { status: 400 }
      );
    }

    let content: string;

    if (markdown && typeof markdown === 'string' && markdown.trim()) {
      const metadata = `Source: ${url}\n\n`;
      content = metadata + markdown;
    } else {
      try {
        content = await processUrl(url);
      } catch (error: unknown) {
        logger.error({ error, url }, 'Error processing URL');
        const errorMessage = error instanceof Error ? error.message : 'Failed to process URL';
        return Response.json(
          { error: { code: 'URL_PROCESS_ERROR', message: errorMessage, retryable: false } },
          { status: 400 }
        );
      }
    }

    const openrouter = getOpenRouterClient(req);
    const model = getModel(req, 'generate');

    const securePrompt = createSecureContentPrompt(url, content);

    logger.info({ model, url }, 'Starting canvas agent V2 generation');

    const result = streamObject({
      model: openrouter(model),
      schema: CanvasAgentResponseSchema,
      system: CANVAS_AGENT_V2_SYSTEM_PROMPT_SECURE,
      prompt: securePrompt,
    });

    return createErrorAwareTextStreamResponse(result.fullStream);
  } catch (error) {
    return handleRouteError(error);
  }
}
