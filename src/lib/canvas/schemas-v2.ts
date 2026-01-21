import { z } from 'zod';

export const ColorThemeSchema = z.object({
  header: z.string().describe('Header background color class'),
  headerText: z.string().describe('Header text color class'),
  body: z.string().describe('Body background color class'),
  border: z.string().describe('Border color class'),
});

export type ColorTheme = z.infer<typeof ColorThemeSchema>;

export const TextSectionSchema = z.object({
  type: z.literal('text'),
  content: z.string().describe('Markdown content for the text block'),
});

export const IconGridItemSchema = z.object({
  icon: z
    .enum([
      // Original icons
      'document',
      'image',
      'audio',
      'video',
      'code',
      'database',
      'cloud',
      'user',
      'settings',
      'chart',
      // Tech/Development
      'terminal',
      'server',
      'cpu',
      'git-branch',
      'globe',
      'api',
      'package',
      'layers',
      // Security/Auth
      'key',
      'lock',
      'shield',
      // Actions
      'zap',
      'search',
      'link',
      'download',
      'upload',
      'refresh',
      // Organization
      'folder',
      'target',
      'filter',
      // Communication
      'mail',
      'calendar',
      'clock',
      'bot',
      'sparkles',
      'network',
    ])
    .describe('Icon type from predefined set'),
  label: z.string().describe('Label for the icon'),
});

export const IconGridVisualSchema = z.object({
  type: z.literal('visual'),
  visualType: z.literal('icon-grid'),
  items: z.array(IconGridItemSchema).describe('Array of icon items'),
  columns: z.number().optional().describe('Number of columns in grid (1-4)'),
});

export const FlowVisualSchema = z.object({
  type: z.literal('visual'),
  visualType: z.literal('flow'),
  items: z.array(z.string()).describe('Flow step labels'),
  direction: z.enum(['horizontal', 'vertical']).optional().describe('Flow direction'),
});

export const ListMarkerSchema = z.enum(['box', 'box-filled', 'circle']);

export const ListItemSchema = z.object({
  marker: ListMarkerSchema.describe('Marker style'),
  text: z.string().describe('List item text'),
  annotation: z.string().optional().describe('Optional annotation label'),
});

export const AnnotatedListVisualSchema = z.object({
  type: z.literal('visual'),
  visualType: z.literal('list'),
  items: z.array(ListItemSchema).describe('List items with markers'),
});

export const StatsItemSchema = z.object({
  value: z.string().describe('Stat value'),
  label: z.string().describe('Stat label'),
});

export const StatsVisualSchema = z.object({
  type: z.literal('visual'),
  visualType: z.literal('stats'),
  items: z.array(StatsItemSchema).describe('Stat items'),
});

export const ComparisonItemSchema = z.object({
  items: z.array(z.string()).describe('Items to compare'),
});

export const ComparisonVisualSchema = z.object({
  type: z.literal('visual'),
  visualType: z.literal('comparison'),
  left: z.object({
    title: z.string().describe('Left side title'),
    items: z.array(z.string()).describe('Left side items'),
  }),
  right: z.object({
    title: z.string().describe('Right side title'),
    items: z.array(z.string()).describe('Right side items'),
  }),
});

// NEW VISUAL TYPES

// Timeline - for events, milestones, history
export const TimelineEventSchema = z.object({
  date: z.string().describe('Date or time period'),
  title: z.string().describe('Event title'),
  description: z.string().optional().describe('Optional description'),
});

export const TimelineVisualSchema = z.object({
  type: z.literal('visual'),
  visualType: z.literal('timeline'),
  events: z.array(TimelineEventSchema).describe('Timeline events in chronological order'),
});

// Table - simple tabular data
export const TableVisualSchema = z.object({
  type: z.literal('visual'),
  visualType: z.literal('table'),
  headers: z.array(z.string()).describe('Column headers'),
  rows: z.array(z.array(z.string())).describe('Table rows (array of arrays)'),
});

// Quote - key quotes or insights
export const QuoteVisualSchema = z.object({
  type: z.literal('visual'),
  visualType: z.literal('quote'),
  text: z.string().describe('Quote text'),
  attribution: z.string().optional().describe('Quote attribution (author, source)'),
});

// Code Block - code snippets
export const CodeBlockVisualSchema = z.object({
  type: z.literal('visual'),
  visualType: z.literal('code-block'),
  code: z.string().describe('Code content'),
  language: z.string().optional().describe('Programming language for syntax hints'),
});

// Tags - keyword cloud, tech stack, categories
export const TagsVisualSchema = z.object({
  type: z.literal('visual'),
  visualType: z.literal('tags'),
  tags: z.array(z.string()).describe('List of tags or keywords'),
  variant: z.enum(['default', 'outline', 'colored']).optional().describe('Visual variant'),
});

export const VisualSectionSchema = z.discriminatedUnion('visualType', [
  IconGridVisualSchema,
  FlowVisualSchema,
  AnnotatedListVisualSchema,
  StatsVisualSchema,
  ComparisonVisualSchema,
  TimelineVisualSchema,
  TableVisualSchema,
  QuoteVisualSchema,
  CodeBlockVisualSchema,
  TagsVisualSchema,
]);

export const CalloutStyleSchema = z.enum(['info', 'warning', 'success', 'tip']);

export const CalloutSectionSchema = z.object({
  type: z.literal('callout'),
  style: CalloutStyleSchema.describe('Callout style'),
  text: z.string().describe('Callout text'),
});

export const SectionSchema = z.discriminatedUnion('type', [
  TextSectionSchema,
  VisualSectionSchema,
  CalloutSectionSchema,
]);

export type TextSection = z.infer<typeof TextSectionSchema>;
export type IconGridVisual = z.infer<typeof IconGridVisualSchema>;
export type FlowVisual = z.infer<typeof FlowVisualSchema>;
export type AnnotatedListVisual = z.infer<typeof AnnotatedListVisualSchema>;
export type StatsVisual = z.infer<typeof StatsVisualSchema>;
export type ComparisonVisual = z.infer<typeof ComparisonVisualSchema>;
export type TimelineVisual = z.infer<typeof TimelineVisualSchema>;
export type TableVisual = z.infer<typeof TableVisualSchema>;
export type QuoteVisual = z.infer<typeof QuoteVisualSchema>;
export type CodeBlockVisual = z.infer<typeof CodeBlockVisualSchema>;
export type TagsVisual = z.infer<typeof TagsVisualSchema>;
export type VisualSection = z.infer<typeof VisualSectionSchema>;
export type CalloutSection = z.infer<typeof CalloutSectionSchema>;
export type Section = z.infer<typeof SectionSchema>;

export const CardNodeSchema = z.object({
  id: z.string().describe('Unique identifier for the card'),
  title: z.string().describe('Card header title'),
  sections: z.array(SectionSchema).min(1).describe('Content sections'),
});

export type CardNode = z.infer<typeof CardNodeSchema>;

export const CanvasEdgeSchema = z.object({
  id: z.string().describe('Unique identifier for the edge'),
  source: z.string().describe('Source card ID'),
  target: z.string().describe('Target card ID'),
  label: z.string().optional().describe('Edge label text'),
});

export type CanvasEdge = z.infer<typeof CanvasEdgeSchema>;

export const LayoutTypeSchema = z.enum(['hierarchical', 'layered', 'radial', 'grid']);

export type LayoutType = z.infer<typeof LayoutTypeSchema>;

export const CanvasAgentResponseSchema = z.object({
  layout: LayoutTypeSchema.describe('Layout algorithm to use'),
  cards: z.array(CardNodeSchema).describe('List of cards'),
  edges: z.array(CanvasEdgeSchema).describe('List of edges connecting cards'),
});

export type CanvasAgentResponse = z.infer<typeof CanvasAgentResponseSchema>;

export const ProcessedCardSchema = CardNodeSchema.extend({
  theme: ColorThemeSchema.optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export type ProcessedCard = z.infer<typeof ProcessedCardSchema>;
