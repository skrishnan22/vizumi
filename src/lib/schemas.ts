import { z } from 'zod';

// Schema for LLM to generate - only fields the AI should populate
export const LLMNoteBlockSchema = z.object({
  id: z.string().describe("Unique identifier for the block"),
  title: z.string().describe("Short title for this section of the note"),
  summary: z.string().describe("Markdown formatted summary of the content. Use bolding for key terms."),
  visualType: z.string().describe("The type of visual aid to generate for this block"),
  d2Code: z.string().optional().describe("Valid D2 diagram code if visualType is 'diagram'. MUST NOT include markdown code fences."),
  imageQuery: z.string().optional().describe("Search query for a stock photo if visualType is 'icon' or fallback"),
  __d2_error__: z.string().optional().describe("Error message if D2 diagram generation failed")
});

// Full schema for internal use - includes metadata fields assigned by our code
export const NoteBlockSchema = z.object({
  id: z.string().describe("Unique identifier for the block"),
  parentId: z.string().optional().describe("ID of the parent block. Root blocks have no parentId."),
  title: z.string().describe("Short title for this section of the note"),
  summary: z.string().describe("Markdown formatted summary of the content. Use bolding for key terms."),
  visualType: z.string().describe("The type of visual aid to generate for this block"),
  d2Code: z.string().optional().describe("Valid D2 diagram code if visualType is 'diagram'. MUST NOT include markdown code fences."),
  imageQuery: z.string().optional().describe("Search query for a stock photo if visualType is 'icon' or fallback"),
  blockType: z.enum(['content', 'deep-dive']).default('content').describe("Type of block: original content or AI-generated deep dive"),
  deepDiveMode: z.enum(['eli5', 'analogy', 'mental-model']).optional().describe("Deep dive explanation mode if blockType is 'deep-dive'"),
  isStreaming: z.boolean().optional().describe("Whether the block content is currently being streamed")
});

// Schema for LLM response
export const LLMNoteSchema = z.object({
  blocks: z.array(LLMNoteBlockSchema).describe("A list of note blocks representing the study material")
});

export const ReflectionSchema = z.object({
  corrections: z.array(z.object({
    blockId: z.string().describe("The ID of the block to update"),
    d2Code: z.string().describe("The corrected D2 code"),
    visualType: z.string().optional().describe("Updated visual type if changed"),
    reason: z.string().optional().describe("Brief reason for the change")
  })).describe("List of blocks that need correction. Omit blocks that are already correct.")
});

export const NoteSchema = z.object({
  blocks: z.array(NoteBlockSchema).describe("A list of note blocks representing the study material")
});

export type LLMNoteBlock = z.infer<typeof LLMNoteBlockSchema>;
export type LLMNote = z.infer<typeof LLMNoteSchema>;
export type NoteBlock = z.infer<typeof NoteBlockSchema>;
export type Note = z.infer<typeof NoteSchema>;
