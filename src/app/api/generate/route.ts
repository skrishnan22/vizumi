import { promises as fs } from "fs";
import path from "path";
import { streamObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { LLMNoteSchema } from "@/lib/schemas";
import { SYSTEM_PROMPT_3 } from "@/lib/prompts";
import { processUrl } from "@/lib/url-processor";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const maxDuration = 60;

export async function POST(req: Request) {
  let content = "";
  let source = "local file";

  try {

    const body = await req.json().catch(() => ({}));
    const { url } = body;

    if (url) {
      console.log(`Processing URL: ${url}`);
      try {
        content = await processUrl(url);
        source = url;
      } catch (error: any) {
        console.error("Error processing URL:", error);
        return new Response(JSON.stringify({ error: error.message || "Failed to process URL" }), {
          status: 400
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "No URL provided" }), {
        status: 400,
      });
    }
  } catch (error) {
    console.error("Unexpected error in generate route:", error);
    return new Response("Internal Server Error", { status: 500 });
  }

  const result = streamObject({
    model: openrouter("x-ai/grok-4.1-fast:free"),
    schema: LLMNoteSchema,
    prompt: `This is the system prompt: ${SYSTEM_PROMPT_3}. Here is the text to process (Source: ${source}):\n\n${content}`,
  });
  return result.toTextStreamResponse();
}
