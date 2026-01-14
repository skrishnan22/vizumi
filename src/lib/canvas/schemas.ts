import { z } from 'zod';

// ============================================================================
// CANVAS NODE DATA TYPES (what the LLM outputs - no positions!)
// ============================================================================

export const TextNodeDataSchema = z.object({
  type: z.literal('text'),
  content: z.string().describe('Markdown content for the text block'),
  title: z.string().optional().describe('Optional title/header for the block'),
});

export const DiagramNodeDataSchema = z.object({
  type: z.literal('diagram'),
  d2Code: z.string().describe('D2 diagram code'),
  title: z.string().optional().describe('Optional title for the diagram'),
});

export const ShapeNodeDataSchema = z.object({
  type: z.literal('shape'),
  shapeType: z
    .enum(['rectangle', 'rounded-rect', 'circle', 'diamond', 'callout', 'sticky-note'])
    .describe('Type of shape'),
  text: z.string().optional().describe('Text inside the shape'),
  color: z
    .enum(['blue', 'green', 'yellow', 'red', 'purple', 'orange', 'gray'])
    .optional()
    .describe('Color theme'),
});

export const CanvasNodeDataSchema = z.discriminatedUnion('type', [
  TextNodeDataSchema,
  DiagramNodeDataSchema,
  ShapeNodeDataSchema,
]);

// ============================================================================
// CANVAS NODE (what the LLM outputs - simplified, no positions)
// ============================================================================

export const CanvasNodeSchema = z.object({
  id: z.string().describe('Unique identifier for the node'),
  type: z.enum(['text', 'diagram', 'shape']).describe('Node type'),
  data: CanvasNodeDataSchema.describe('Node-specific data'),
});

// ============================================================================
// CANVAS EDGE
// ============================================================================

export const CanvasEdgeSchema = z.object({
  id: z.string().describe('Unique identifier for the edge'),
  source: z.string().describe('Source node ID'),
  target: z.string().describe('Target node ID'),
  label: z.string().optional().describe('Label text for the edge'),
});

// ============================================================================
// AGENT RESPONSE - Simplified: just nodes and edges, no operations wrapper
// ============================================================================

export const CanvasAgentResponseSchema = z.object({
  nodes: z.array(CanvasNodeSchema).describe('List of nodes to place on canvas'),
  edges: z.array(CanvasEdgeSchema).describe('List of edges connecting nodes'),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type TextNodeData = z.infer<typeof TextNodeDataSchema>;
export type DiagramNodeData = z.infer<typeof DiagramNodeDataSchema>;
export type ShapeNodeData = z.infer<typeof ShapeNodeDataSchema>;
export type CanvasNodeData = z.infer<typeof CanvasNodeDataSchema>;
export type CanvasNode = z.infer<typeof CanvasNodeSchema>;
export type CanvasEdge = z.infer<typeof CanvasEdgeSchema>;
export type CanvasAgentResponse = z.infer<typeof CanvasAgentResponseSchema>;
