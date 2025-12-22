import ELK from 'elkjs/lib/elk.bundled.js';
import type { Node, Edge } from 'reactflow';
import { MarkerType } from 'reactflow';
import type { NoteNodeData } from '@/lib/yjs/utils';
import { NODE_WIDTH } from '@/lib/yjs/utils';

const elk = new ELK();

// Base height for nodes without diagrams
const BASE_NODE_HEIGHT = 300;
// Extra height for nodes with diagrams
const DIAGRAM_HEIGHT_BONUS = 280;

const elkOptions = {
  'elk.algorithm': 'org.eclipse.elk.mrtree',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': '300',
  'elk.mrtree.searchDepth': '5',
};

/**
 * Calculate the estimated height for a node based on its content.
 * Nodes with diagrams need more space.
 */
function getNodeHeight(node: Node<NoteNodeData>): number {
  const hasDiagram = node.data?.block?.d2Code && node.data.block.d2Code.trim().length > 0;
  return hasDiagram ? BASE_NODE_HEIGHT + DIAGRAM_HEIGHT_BONUS : BASE_NODE_HEIGHT;
}

function getHandleForAngle(angleInRadians: number): 'top' | 'right' | 'bottom' | 'left' {
  if (angleInRadians >= -Math.PI / 4 && angleInRadians < Math.PI / 4) {
    return 'right';
  } else if (angleInRadians >= Math.PI / 4 && angleInRadians < (3 * Math.PI) / 4) {
    return 'bottom';
  } else if (angleInRadians >= (3 * Math.PI) / 4 || angleInRadians < (-3 * Math.PI) / 4) {
    return 'left';
  } else {
    return 'top';
  }
}

/**
 * Calculate layout for nodes and edges using ELK algorithm.
 *
 * This is a PURE FUNCTION - no side effects, just returns layouted positions.
 * Call this before writing nodes to Y.Doc, not during rendering.
 */
export async function calculateLayout(
  nodes: Node<NoteNodeData>[],
  edges: Edge[]
): Promise<{ nodes: Node<NoteNodeData>[]; edges: Edge[] }> {
  if (nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const graph = {
    id: 'root',
    layoutOptions: elkOptions,
    children: nodes.map((node) => ({
      id: node.id,
      width: NODE_WIDTH,
      height: getNodeHeight(node),
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layoutedGraph = await elk.layout(graph);

  const layoutedNodes = nodes.map((node) => {
    const layoutedNode = layoutedGraph.children?.find((n) => n.id === node.id);
    return {
      ...node,
      position: {
        x: layoutedNode?.x ?? 0,
        y: layoutedNode?.y ?? 0,
      },
    };
  });

  const layoutedEdges = edges.map((edge) => {
    const sourceNode = layoutedNodes.find((n) => n.id === edge.source);
    const targetNode = layoutedNodes.find((n) => n.id === edge.target);

    if (!sourceNode || !targetNode) {
      return edge;
    }

    const isDeepDiveEdge = targetNode.data?.block?.blockType === 'deep-dive';

    const sourceHeight = getNodeHeight(sourceNode);
    const targetHeight = getNodeHeight(targetNode);

    const sourceX = sourceNode.position.x + NODE_WIDTH / 2;
    const sourceY = sourceNode.position.y + sourceHeight / 2;
    const targetX = targetNode.position.x + NODE_WIDTH / 2;
    const targetY = targetNode.position.y + targetHeight / 2;

    const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
    const sourceHandleSide = getHandleForAngle(angle);

    return {
      ...edge,
      sourceHandle: `source-${sourceHandleSide}`,
      targetHandle: `target-top`,
      style: isDeepDiveEdge
        ? { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '5,5' }
        : { stroke: '#64748b', strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isDeepDiveEdge ? '#94a3b8' : '#64748b',
      },
    };
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
}
