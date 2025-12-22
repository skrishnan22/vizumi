import { streamObject } from 'ai';
import { LLMNoteSchema } from '@/lib/schemas';
import {
  SYSTEM_PROMPT_SECURE,
  SYSTEM_PROMPT_WITH_D2_REF_SECURE,
} from '@/lib/prompts';
import { processUrl } from '@/lib/url-processor';
import { logger } from '@/lib/logger';
import { getOpenRouterClient, getModel } from '@/lib/api/route-helpers';
import { handleRouteError } from '@/lib/api/error-handler';
import { MAX_DURATIONS_SECS, FEATURE_FLAGS } from '@/lib/constants';
import { createSecureContentPrompt, sanitizeBlocks, type Block } from '@/lib/security';

export const maxDuration = MAX_DURATIONS_SECS.GENERATE;

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

    // Use provided markdown if available, otherwise fetch and convert
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

    // Use security-hardened system prompt
    const systemPrompt = FEATURE_FLAGS.USE_ENHANCED_PROMPT
      ? SYSTEM_PROMPT_WITH_D2_REF_SECURE
      : SYSTEM_PROMPT_SECURE;

    // Create secure prompt with delimiters and anti-injection instructions
    const securePrompt = createSecureContentPrompt(url, content);

    const result = streamObject({
      model: openrouter(model),
      schema: LLMNoteSchema,
      system: systemPrompt,
      prompt: securePrompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    return handleRouteError(error);
  }
}
