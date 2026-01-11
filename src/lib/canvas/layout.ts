import ELK from 'elkjs/lib/elk.bundled.js';
import type { Node, Edge } from 'reactflow';
import type { ProcessedCard } from './schemas-v2';
import { resolveCollisions } from './resolve-collisions';

const elk = new ELK();

export type LayoutType = 'hierarchical' | 'layered' | 'radial' | 'grid';

type NodeDimensions = { width: number; height: number };

function getLayoutOptions(layoutType: LayoutType): Record<string, string> {
  // Note: ReactFlow nodes have variable rendered sizes (content-driven).
  // Keep spacing generous to avoid overlaps across branches/components.
  const baseOptions = {
    // Minimum spacing between node bounding boxes.
    // This is the most important knob to avoid overlaps when widths vary.
    'elk.spacing.nodeNode': '220',

    // Edge routing spacing (less critical than nodeNode).
    'elk.spacing.edgeNode': '60',
    'elk.spacing.edgeEdge': '30',

    // Give each connected component extra breathing room.
    // Helps when multiple disconnected trees are present.
    'elk.spacing.componentComponent': '260',
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

function getNodeSize(
  card: ProcessedCard,
  nodeDimensions?: Record<string, NodeDimensions>
): NodeDimensions {
  const dims = nodeDimensions?.[card.id];

  return {
    width: dims?.width ?? card.width ?? 380,
    height: dims?.height ?? card.height ?? 300,
  };
}

function calculateGridLayout(
  cards: ProcessedCard[],
  nodeDimensions?: Record<string, NodeDimensions>
): { x: number; y: number }[] {
  const columns = Math.ceil(Math.sqrt(cards.length));
  const positions: { x: number; y: number }[] = [];
  const gapX = 50;
  const gapY = 50;

  const sizes = cards.map((card) => getNodeSize(card, nodeDimensions));
  const maxWidth = sizes.length ? Math.max(...sizes.map((size) => size.width)) : 380;
  const maxHeight = sizes.length ? Math.max(...sizes.map((size) => size.height)) : 300;

  cards.forEach((_card, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    positions.push({
      x: col * (maxWidth + gapX),
      y: row * (maxHeight + gapY),
    });
  });

  return positions;
}

/**
 * Simple vertical stack layout - used as fallback during streaming when edges are not yet available.
 * Positions cards one below another with sufficient spacing.
 */
function calculateVerticalStackLayout(
  cards: ProcessedCard[],
  nodeDimensions?: Record<string, NodeDimensions>
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const gapY = 80; // Vertical gap between cards
  let currentY = 0;

  cards.forEach((card) => {
    positions.push({
      x: 0, // All cards aligned to the left
      y: currentY,
    });

    const { height: cardHeight } = getNodeSize(card, nodeDimensions);
    currentY += cardHeight + gapY;
  });

  return positions;
}

export async function calculateLayout(
  cards: ProcessedCard[],
  edges: Edge[],
  layoutType: LayoutType = 'layered',
  nodeDimensions?: Record<string, { width: number; height: number }>
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  if (cards.length === 0) {
    return { nodes: [], edges: [] };
  }

  // Grid layout - custom positioning
  if (layoutType === 'grid') {
    const positions = calculateGridLayout(cards, nodeDimensions);
    const nodes: Node[] = cards.map((card, index) => {
      const size = getNodeSize(card, nodeDimensions);
      const measured = nodeDimensions?.[card.id];
      return {
        id: card.id,
        type: 'whiteboardCard',
        position: positions[index],
        data: card,
        ...(measured ? { width: size.width, height: size.height } : {}),
      };
    });

    return { nodes, edges };
  }

  // Fallback: Use simple vertical stack when no edges available (during streaming)
  // ELK doesn't position nodes properly without edge relationships
  if (edges.length === 0) {
    const positions = calculateVerticalStackLayout(cards, nodeDimensions);
    const nodes: Node[] = cards.map((card, index) => {
      const size = getNodeSize(card, nodeDimensions);
      const measured = nodeDimensions?.[card.id];
      return {
        id: card.id,
        type: 'whiteboardCard',
        position: positions[index],
        data: card,
        ...(measured ? { width: size.width, height: size.height } : {}),
      };
    });

    return { nodes, edges };
  }

  // ELK layout - use when edges are available for proper relationship-based positioning
  const graph = {
    id: 'root',
    layoutOptions: getLayoutOptions(layoutType),
    children: cards.map((card) => {
      const size = getNodeSize(card, nodeDimensions);
      return {
        id: card.id,
        width: size.width,
        height: size.height,
      };
    }),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layoutedGraph = await elk.layout(graph);

  const nodes: Node[] = cards.map((card) => {
    const layoutedNode = layoutedGraph.children?.find((n) => n.id === card.id);
    const size = getNodeSize(card, nodeDimensions);
    const measured = nodeDimensions?.[card.id];

    return {
      id: card.id,
      type: 'whiteboardCard',
      position: {
        x: layoutedNode?.x ?? 0,
        y: layoutedNode?.y ?? 0,
      },
      data: card,
      // Include dimensions for collision detection
      ...(measured ? { width: size.width, height: size.height } : {}),
    };
  });

  // Resolve any remaining collisions (e.g., separate trees/branches that ELK may overlap)
  // This ensures minimum gap between all nodes including disconnected components
  const collisionFreeNodes = resolveCollisions(nodes, { margin: 50 });

  return { nodes: collisionFreeNodes, edges };
}
