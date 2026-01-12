import type { Edge, Node } from 'reactflow';
import { MarkerType } from 'reactflow';
import { calculateLayout } from './layout';
import type { CanvasEdge, LayoutType, ProcessedCard } from './schemas-v2';

const CANVAS_EDGE_COLOR = '#94a3b8';

export const CANVAS_EDGE_MARKER = {
  type: MarkerType.ArrowClosed,
  color: CANVAS_EDGE_COLOR,
} as const;

export function buildCanvasEdges(edges: CanvasEdge[]): Edge[] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: 'chip',
    markerEnd: CANVAS_EDGE_MARKER,
  }));
}

export async function buildCanvasGraph(
  cards: ProcessedCard[],
  edges: CanvasEdge[],
  layoutType: LayoutType
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const rfEdges = buildCanvasEdges(edges);
  const { nodes, edges: layoutedEdges } = await calculateLayout(cards, rfEdges, layoutType);

  return { nodes, edges: layoutedEdges };
}
