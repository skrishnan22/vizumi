import ELK from 'elkjs/lib/elk.bundled.js';
import type { Node, Edge } from 'reactflow';
import type { ProcessedCard } from './schemas-v2';

const elk = new ELK();

export type LayoutType = 'hierarchical' | 'layered' | 'radial' | 'grid';

function getLayoutOptions(layoutType: LayoutType): Record<string, string> {
  const baseOptions = {
    'elk.spacing.nodeNode': '150',
    'elk.spacing.edgeNode': '40',
    'elk.spacing.edgeEdge': '20',
  };

  switch (layoutType) {
    case 'hierarchical':
      return {
        ...baseOptions,
        'elk.algorithm': 'org.eclipse.elk.mrtree',
        'elk.direction': 'DOWN',
        'elk.mrtree.searchDepth': '5',
        'elk.mrtree.rootPlacement': 'ROOT_CENTER',
      };
    case 'layered':
      return {
        ...baseOptions,
        'elk.algorithm': 'org.eclipse.elk.layered',
        'elk.direction': 'DOWN',
        'elk.layered.spacing.nodeNodeBetweenLayers': '150',
        'elk.layered.spacing.edgeNodeBetweenLayers': '50',
      };
    case 'radial':
      return {
        ...baseOptions,
        'elk.algorithm': 'org.eclipse.elk.radial',
        'elk.radial.compaction': 'true',
        'elk.radial.radius': '300',
      };
    case 'grid':
      return {
        ...baseOptions,
        'elk.algorithm': 'org.eclipse.elk.force',
        'elk.force.repulsivePower': '20',
        'elk.force.iterations': '300',
      };
    default:
      return {
        ...baseOptions,
        'elk.algorithm': 'org.eclipse.elk.layered',
        'elk.direction': 'DOWN',
      };
  }
}

function calculateGridLayout(cards: ProcessedCard[]): { x: number; y: number }[] {
  const columns = Math.ceil(Math.sqrt(cards.length));
  const positions: { x: number; y: number }[] = [];
  const cardWidth = 400;
  const cardHeight = 400;
  const gapX = 50;
  const gapY = 50;

  cards.forEach((_card, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    positions.push({
      x: col * (cardWidth + gapX),
      y: row * (cardHeight + gapY),
    });
  });

  return positions;
}

export async function calculateLayout(
  cards: ProcessedCard[],
  edges: Edge[],
  layoutType: LayoutType = 'layered'
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  if (cards.length === 0) {
    return { nodes: [], edges: [] };
  }

  if (layoutType === 'grid') {
    const positions = calculateGridLayout(cards);
    const nodes: Node[] = cards.map((card, index) => ({
      id: card.id,
      type: 'whiteboardCard',
      position: positions[index],
      data: card,
    }));

    return { nodes, edges };
  }

  const graph = {
    id: 'root',
    layoutOptions: getLayoutOptions(layoutType),
    children: cards.map((card) => ({
      id: card.id,
      width: card.width || 380,
      height: card.height || 300,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layoutedGraph = await elk.layout(graph);

  const nodes: Node[] = cards.map((card) => {
    const layoutedNode = layoutedGraph.children?.find((n) => n.id === card.id);
    return {
      id: card.id,
      type: 'whiteboardCard',
      position: {
        x: layoutedNode?.x ?? 0,
        y: layoutedNode?.y ?? 0,
      },
      data: card,
    };
  });

  return { nodes, edges };
}
