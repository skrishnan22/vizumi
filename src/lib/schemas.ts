import { z } from 'zod';

export const NoteBlockSchema = z.object({
  id: z.string().describe("Unique identifier for the block"),
  parentId: z.string().optional().describe("ID of the parent block. Root blocks have no parentId."),
  title: z.string().describe("Short title for this section of the note"),
  summary: z.string().describe("Markdown formatted summary of the content. Use bolding for key terms."),
  visualType: z.enum(['none', 'diagram', 'icon']).describe("The type of visual aid to generate for this block"),
  d2Code: z.string().optional().describe("Valid D2 diagram code if visualType is 'diagram'. MUST NOT include markdown code fences."),
  imageQuery: z.string().optional().describe("Search query for a stock photo if visualType is 'icon' or fallback")
});

export const NoteSchema = z.object({
  blocks: z.array(NoteBlockSchema).describe("A list of note blocks representing the study material")
});

export type NoteBlock = z.infer<typeof NoteBlockSchema>;
export type Note = z.infer<typeof NoteSchema>;
