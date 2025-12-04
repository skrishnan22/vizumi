'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  NodeChange,
  useEdgesState,
  useNodesState,
  type Node,
  type Edge,
  MarkerType,
  type ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ELK from 'elkjs/lib/elk.bundled.js';
import { NoteBlock } from '@/lib/schemas';
import { NoteBlockNode } from './NoteBlockNode';
import { DeepDiveDrawer } from './DeepDiveDrawer';
import styles from './NoteBoard.module.css';
import { useNoteStore } from '@/store/noteStore';
import { getDeepDiveAccent } from '@/lib/deepDiveHelpers';
import { useNoteDoc } from '@/hooks/useNoteDoc';
import { updateNodePosition, setNodes as setNodesYjs, setEdges as setEdgesYjs } from '@/lib/yjs/actions';

type NoteBoardProps = {
  noteId: string;
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

export function NoteBoard({ noteId, blocks }: NoteBoardProps) {
  useNoteDoc(noteId); // Bind Y.Doc

  const [contentHeights, setContentHeights] = useState<Record<string, number>>({});
  const [selectedDeepDiveId, setSelectedDeepDiveId] = useState<string | null>(null);
  const autoLayoutEnabled = useNoteStore((state) => state.autoLayoutEnabled);
  const setAutoLayoutEnabled = useNoteStore((state) => state.setAutoLayoutEnabled);
  const storeBlocks = useNoteStore((state) => state.blocks);
  const updateBlockSummary = useNoteStore((state) => state.updateBlockSummary);
  const setBlocksInStore = useNoteStore((state) => state.setBlocks);

  // Y.js Store Data
  const storeNodes = useNoteStore((state) => state.nodes);
  const storeEdges = useNoteStore((state) => state.edges);

  const [nodes, setNodes, internalOnNodesChange] = useNodesState([]);
  const [edges, setEdgesLocal, onEdgesChange] = useEdgesState([]);

  // Sync Store -> Local State
  useEffect(() => {
    if (storeNodes.length > 0) setNodes(storeNodes);
  }, [storeNodes, setNodes]);

  useEffect(() => {
    if (storeEdges.length > 0) setEdgesLocal(storeEdges);
  }, [storeEdges, setEdgesLocal]);

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const prevBlocksLengthRef = useRef(storeBlocks.length);

  const selectedBlock = useMemo(() =>
    storeBlocks.find(b => b.id === selectedDeepDiveId) ?? null,
    [storeBlocks, selectedDeepDiveId]
  );

  const parentBlock = useMemo(() => {
    if (!selectedBlock?.parentId) return null;
    return storeBlocks.find(b => b.id === selectedBlock.parentId) ?? null;
  }, [selectedBlock, storeBlocks]);

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

      // Persist changes to Y.Doc
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          updateNodePosition(noteId, change.id, change.position);
        }
      });

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
    [internalOnNodesChange, setAutoLayoutEnabled, noteId],
  );


  useEffect(() => {
    if (!storeBlocks.length) return;

    const isNewBlock = storeBlocks.length > prevBlocksLengthRef.current;
    prevBlocksLengthRef.current = storeBlocks.length;

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

      // Write to Y.Doc (Source of Truth)
      setNodesYjs(noteId, layouted.nodes);
      setEdgesYjs(noteId, layouted.edges);

      // If a new block was added (and it's a deep dive), shift focus to it
      if (isNewBlock && rfInstance) {
        const newBlock = storeBlocks[storeBlocks.length - 1];
        if (newBlock.blockType === 'deep-dive') {
          // Small delay to ensure the node is rendered and layout is applied in React Flow
          setTimeout(() => {
            rfInstance.fitView({
              nodes: [{ id: newBlock.id }],
              duration: 1200,
              padding: 0.2,
            });
          }, 100);
        }
      }
    };

    applyLayout();
  }, [storeBlocks, onMeasure, handleSaveSummary, rfInstance, noteId]);

  // if (!blocks.length) {
  //   return null;
  // }

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
          onInit={setRfInstance}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1.6}
            color="rgba(28,26,23,0.25)"
          />
        </ReactFlow>
      </div>
      <DeepDiveDrawer
        isOpen={!!selectedDeepDiveId}
        onClose={() => setSelectedDeepDiveId(null)}
        block={selectedBlock}
        parentBlock={parentBlock}
      />
    </section>
  );
}
