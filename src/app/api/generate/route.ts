import { streamObject } from 'ai';
import { LLMNoteSchema } from '@/lib/schemas';
import { SYSTEM_PROMPT, SYSTEM_PROMPT_WITH_D2_REF } from '@/lib/prompts';
import { processUrl } from '@/lib/url-processor';
import { logger } from '@/lib/logger';
import { createOpenRouterClient } from '@/lib/api/openrouter';
import { LLM_MODELS, MAX_DURATIONS_SECS, FEATURE_FLAGS } from '@/lib/constants';

const openrouter = createOpenRouterClient(process.env.OPENROUTER_API_KEY as string);

export const maxDuration = MAX_DURATIONS_SECS.GENERATE;

export async function POST(req: Request) {
  let content = '';
  let source = 'local file';

  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body;

    if (url) {
      try {
        content = await processUrl(url);
        source = url;
      } catch (error: unknown) {
        logger.error({ error, url }, 'Error processing URL');
        const errorMessage = error instanceof Error ? error.message : 'Failed to process URL';
        return new Response(JSON.stringify({ error: errorMessage }), {
          status: 400,
        });
      }
    } else {
      return new Response(JSON.stringify({ error: 'No URL provided' }), {
        status: 400,
      });
    }
  } catch (error) {
    logger.error({ error }, 'Unexpected error in generate route');
    return new Response('Internal Server Error', { status: 500 });
  }

  const systemPrompt = FEATURE_FLAGS.USE_ENHANCED_PROMPT ? SYSTEM_PROMPT_WITH_D2_REF : SYSTEM_PROMPT;

  const result = streamObject({
    model: openrouter(LLM_MODELS.GENERATION),
    schema: LLMNoteSchema,
    system: systemPrompt,
    prompt: `Here is the text to process (Source: ${source}):\n\n${content}`,
  });
  return result.toTextStreamResponse();
}
