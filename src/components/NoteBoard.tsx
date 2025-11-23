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

type NoteBoardProps = {
  blocks: NoteBlock[];
};

const elk = new ELK();

const NODE_WIDTH = 320;
const NODE_HEIGHT = 440;
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
};

// ELK layout options for horizontal tree
const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.spacing.nodeNode': '120',
  'elk.layered.spacing.nodeNodeBetweenLayers': '200',
  'elk.layered.nodePlacement.strategy': 'SIMPLE',
};

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

  return { nodes: layoutedNodes, edges };
}

function buildNodesAndEdges(
  blocks: NoteBlock[],
  onMeasure: (id: string, height: number) => void,
  onSaveSummary: (id: string, summary: string) => void,
): { nodes: Node<NoteNodeData>[]; edges: Edge[] } {
  const nodes = blocks.map((block, index) => {
    const accent = NODE_COLORS[index % NODE_COLORS.length];

    return {
      id: block.id ?? `block-${index}`,
      type: 'note',
      data: { block, accent, onMeasure, onSaveSummary },
      position: { x: 0, y: 0 }, // Will be set by ELK
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      },
    };
  });

  // Create edges: all blocks except first connect to first block (root)
  const edges: Edge[] = [];
  if (blocks.length > 1) {
    const rootId = blocks[0].id ?? 'block-0';
    for (let i = 1; i < blocks.length; i++) {
      const childId = blocks[i].id ?? `block-${i}`;
      edges.push({
        id: `edge-${rootId}-${childId}`,
        source: rootId,
        target: childId,
        type: 'default',
        animated: false,
        style: { stroke: '#64748b', strokeWidth: 3 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#64748b',
        },
      });
    }
  }

  return { nodes, edges };
}

const nodeTypes = {
  note: NoteBlockNode,
};

export function NoteBoard({ blocks }: NoteBoardProps) {
  const [contentHeights, setContentHeights] = useState<Record<string, number>>({});
  const autoLayoutEnabled = useNoteStore((state) => state.autoLayoutEnabled);
  const setAutoLayoutEnabled = useNoteStore((state) => state.setAutoLayoutEnabled);
  const storeBlocks = useNoteStore((state) => state.blocks);
  const updateBlockSummary = useNoteStore((state) => state.updateBlockSummary);
  const setBlocksInStore = useNoteStore((state) => state.setBlocks);

  const onMeasure = useCallback((nodeId: string, height: number) => {
    setContentHeights((prev) => {
      if (Math.abs((prev[nodeId] ?? 0) - height) < 1) {
        return prev;
      }
      return { ...prev, [nodeId]: height };
    });
  }, []);

  const blocksForLayout = storeBlocks.length ? storeBlocks : blocks;
  const storeBlockCount = storeBlocks.length;

  const handleSaveSummary = useCallback(
    (nodeId: string, summary: string) => {
      if (!storeBlockCount && blocks.length) {
        setBlocksInStore(blocks);
      }
      updateBlockSummary(nodeId, summary);
    },
    [blocks, setBlocksInStore, storeBlockCount, updateBlockSummary],
  );

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildNodesAndEdges(blocksForLayout, onMeasure, handleSaveSummary),
    [blocksForLayout, onMeasure, handleSaveSummary],
  );

  const [nodes, setNodes, internalOnNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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

  // Apply ELK layout when blocks change
  useEffect(() => {
    const applyLayout = async () => {
      const layouted = await getLayoutedElements(initialNodes, initialEdges);
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
    };

    applyLayout();
  }, [initialNodes, initialEdges, setNodes, setEdges]);

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
