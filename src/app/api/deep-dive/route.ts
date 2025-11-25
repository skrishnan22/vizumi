import { promises as fs } from 'fs';
import path from 'path';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { getPromptForMode } from '@/lib/deepDivePrompts';

const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});
export const maxDuration = 60;

type DeepDiveRequest = {
    nodeId: string;
    mode: 'eli5' | 'analogy' | 'mental-model';
    blockTitle: string;
    blockSummary: string;
};

export async function POST(req: Request) {
    try {
        const { mode, blockTitle, blockSummary } = await req.json()

        if (!['eli5', 'analogy', 'mental-model'].includes(mode)) {
            return new Response('Invalid mode', { status: 400 });
        }

        const contentPath = path.join(process.cwd(), 'public', 'data', 'content.md');
        let fullDocument = '';

        try {
            fullDocument = await fs.readFile(contentPath, 'utf-8');
        } catch (error) {
            console.error('Error reading content file:', error);
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
            model: openrouter('x-ai/grok-4.1-fast'),
            prompt: fullPrompt,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error('Deep dive error:', error);
        return new Response('Internal server error', { status: 500 });
    }
}
