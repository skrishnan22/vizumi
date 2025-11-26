'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  NodeChange,
  useEdgesState,
  useNodesState,
  type Node,
  type Edge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ELK from 'elkjs/lib/elk.bundled.js';
import { NoteBlock } from '@/lib/schemas';
import { NoteBlockNode } from './NoteBlockNode';
import styles from './NoteBoard.module.css';
import { useNoteStore } from '@/store/noteStore';
import { getDeepDiveAccent } from '@/lib/deepDiveHelpers';

type NoteBoardProps = {
  blocks: NoteBlock[];
};

const elk = new ELK();

const NODE_WIDTH = 320;
const NODE_HEIGHT = 440;
const DEEP_DIVE_VERTICAL_GAP = 100; // Gap below parent node
const DEEP_DIVE_HORIZONTAL_GAP = 30; // Gap between sibling deep dives
const NODE_COLORS = [
  '#FFF6D9',
  '#E5F4FF',
  '#EAFBE7',
  '#FFF0F5',
  '#F3E8FF',
  '#FFEFE0',
];

export type NoteNodeData = {
  block: NoteBlock;
  accent: string;
  onMeasure?: (id: string, height: number) => void;
  onSaveSummary?: (id: string, summary: string) => void;
  onOpenDrawer?: (id: string) => void;
};



const elkOptions = {
  'elk.algorithm': 'org.eclipse.elk.mrtree',
  'elk.direction': 'DOWN', // Children below parents
  'elk.spacing.nodeNode': '300',
  'elk.mrtree.searchDepth': '5',
};

function getHandleForAngle(angleInRadians: number): 'top' | 'right' | 'bottom' | 'left' {
  if (angleInRadians >= -Math.PI / 4 && angleInRadians < Math.PI / 4) {
    return 'right';  // -45° to 45°
  } else if (angleInRadians >= Math.PI / 4 && angleInRadians < 3 * Math.PI / 4) {
    return 'bottom'; // 45° to 135°
  } else if (angleInRadians >= 3 * Math.PI / 4 || angleInRadians < -3 * Math.PI / 4) {
    return 'left';   // 135° to -135° (wraps around at ±180°)
  } else {
    return 'top';    // -135° to -45°
  }
}

function getOppositeHandle(handle: 'top' | 'right' | 'bottom' | 'left'): 'top' | 'right' | 'bottom' | 'left' {
  const opposites = {
    'right': 'left',
    'left': 'right',
    'top': 'bottom',
    'bottom': 'top',
  } as const;
  return opposites[handle];
}

async function getLayoutedElements(
  nodes: Node<NoteNodeData>[],
  edges: Edge[],
) {

  const graph = {
    id: 'root',
    layoutOptions: elkOptions,
    children: nodes.map((node) => ({
      id: node.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
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

    const isDeepDiveEdge = targetNode.data.block.blockType === 'deep-dive';

    const sourceX = sourceNode.position.x + NODE_WIDTH / 2;
    const sourceY = sourceNode.position.y + NODE_HEIGHT / 2;
    const targetX = targetNode.position.x + NODE_WIDTH / 2;
    const targetY = targetNode.position.y + NODE_HEIGHT / 2;

    const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
    const sourceHandleSide = getHandleForAngle(angle);
    const targetHandleSide = getOppositeHandle(sourceHandleSide);

    return {
      ...edge,
      sourceHandle: `source-${sourceHandleSide}`,
      targetHandle: `target-top`,
      // Different styling for deep dive edges
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

function buildNodesAndEdges(
  blocks: NoteBlock[],
  onMeasure: (id: string, height: number) => void,
  onSaveSummary: (id: string, summary: string) => void,
  onOpenDrawer: (id: string) => void,
): { nodes: Node<NoteNodeData>[]; edges: Edge[] } {
  const nodes = blocks.map((block, index) => {
    // Use mode-specific accent for deep dive nodes, default colors for content nodes
    const accent = block.blockType === 'deep-dive'
      ? getDeepDiveAccent(block.deepDiveMode)
      : NODE_COLORS[index % NODE_COLORS.length];

    return {
      id: block.id ?? `block-${index}`,
      type: 'note',
      data: { block, accent, onMeasure, onSaveSummary, onOpenDrawer },
      position: { x: 0, y: 0 },
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      },
    };
  });

  // Create edges based on parentId relationships
  const edges: Edge[] = blocks
    .filter(block => block.parentId)
    .map(block => ({
      id: `edge-${block.parentId}-${block.id}`,
      source: block.parentId!,
      target: block.id ?? `block-${blocks.indexOf(block)}`,
      type: 'default',
      animated: false,
      style: { stroke: '#64748b', strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#64748b',
      },
    }));

  return { nodes, edges };
}

const nodeTypes = {
  note: NoteBlockNode,
};

export function NoteBoard({ blocks }: NoteBoardProps) {
  const [contentHeights, setContentHeights] = useState<Record<string, number>>({});
  const [selectedDeepDiveId, setSelectedDeepDiveId] = useState<string | null>(null);
  const autoLayoutEnabled = useNoteStore((state) => state.autoLayoutEnabled);
  const setAutoLayoutEnabled = useNoteStore((state) => state.setAutoLayoutEnabled);
  const storeBlocks = useNoteStore((state) => state.blocks);
  const updateBlockSummary = useNoteStore((state) => state.updateBlockSummary);
  const setBlocksInStore = useNoteStore((state) => state.setBlocks);

  const [nodes, setNodes, internalOnNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (blocks.length && !storeBlocks.length) {
      setBlocksInStore(blocks);
    }
  }, [blocks, storeBlocks.length, setBlocksInStore]);

  const onMeasure = useCallback((nodeId: string, height: number) => {
    setContentHeights((prev) => {
      if (Math.abs((prev[nodeId] ?? 0) - height) < 1) {
        return prev;
      }
      return { ...prev, [nodeId]: height };
    });
  }, []);

  const handleSaveSummary = useCallback(
    (nodeId: string, summary: string) => {
      updateBlockSummary(nodeId, summary);
    },
    [updateBlockSummary],
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      internalOnNodesChange(changes);
      if (
        changes.some(
          (change) =>
            change.type === 'position' ||
            change.type === 'dimensions' ||
            change.type === 'select',
        )
      ) {
        setAutoLayoutEnabled(false);
      }
    },
    [internalOnNodesChange, setAutoLayoutEnabled],
  );


  useEffect(() => {
    if (!storeBlocks.length) return;

    const applyLayout = async () => {
      // Build nodes and edges from storeBlocks
      const { nodes: builtNodes, edges: builtEdges } = buildNodesAndEdges(
        storeBlocks,
        onMeasure,
        handleSaveSummary,
        setSelectedDeepDiveId,
      );

      // Apply ELK layout
      const layouted = await getLayoutedElements(builtNodes, builtEdges);
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
    };

    applyLayout();
  }, [storeBlocks, onMeasure, handleSaveSummary, setNodes, setEdges]);

  if (!blocks.length) {
    return null;
  }

  return (
    <section className={styles.boardSection} aria-label="Generated visual notes">
      <div className={styles.flowShell}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          className={styles.flowCanvas}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.35}
          maxZoom={1.5}
          nodesDraggable
          nodesConnectable={false}
          panOnScroll
          panOnDrag
          fitView
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1.6}
            color="rgba(28,26,23,0.25)"
          />
        </ReactFlow>
      </div>
    </section>
  );
}
