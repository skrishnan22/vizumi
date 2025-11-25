import { promises as fs } from 'fs';
import path from 'path';
import { streamObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { LLMNoteSchema } from '@/lib/schemas';
import { SYSTEM_PROMPT_3 } from '@/lib/prompts';

// Configure OpenRouter as a custom OpenAI provider
const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export async function POST() {
    const contentPath = path.join(process.cwd(), 'public', 'data', 'content.md');
    let content = '';

    try {
        content = await fs.readFile(contentPath, 'utf-8');
    } catch (error) {
        console.error('Error reading content file:', error);
        return new Response('Unable to load content.md', { status: 500 });
    }
    // const result = await streamObject({
    //     model: openrouter('openai/gpt-oss-20b:free'),
    //     schema: LLMNoteSchema,
    //     prompt: `${SYSTEM_PROMPT}\n\nHere is the text to process:\n\n${content}`,
    // });

    const result = streamObject({
        model: openrouter('x-ai/grok-4.1-fast'),
        schema: LLMNoteSchema,
        prompt: `This is the system prompt: ${SYSTEM_PROMPT_3}. Here is the text to process:\n\n${content}`,
    });
    console.log(JSON.stringify(result, null, 2))
    return result.toTextStreamResponse();
}
