import { streamObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { LLMNoteSchema } from '@/lib/schemas';
import { SYSTEM_PROMPT, SYSTEM_PROMPT_WITH_D2_REF } from '@/lib/prompts';

// Toggle for A/B testing prompts
// Set to true to use enhanced prompt with D2 pattern library
const USE_ENHANCED_PROMPT = true;
import { processUrl } from '@/lib/url-processor';

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const maxDuration = 60;

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
        console.error('Error processing URL:', error);
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
    console.error('Unexpected error in generate route:', error);
    return new Response('Internal Server Error', { status: 500 });
  }

  const systemPrompt = USE_ENHANCED_PROMPT ? SYSTEM_PROMPT_WITH_D2_REF : SYSTEM_PROMPT;

  const result = streamObject({
    model: openrouter('x-ai/grok-code-fast-1'),
    schema: LLMNoteSchema,
    system: systemPrompt,
    prompt: `Here is the text to process (Source: ${source}):\n\n${content}`,
  });
  return result.toTextStreamResponse();
}
