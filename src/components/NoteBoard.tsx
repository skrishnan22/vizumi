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
import { useNoteDoc } from '@/hooks/useNoteDoc';
import { updateNodePosition, updateNodeData, setNodes as setNodesYjs, setEdges as setEdgesYjs } from '@/lib/yjs/actions';
import { NoteNodeData, NODE_WIDTH, NODE_HEIGHT } from '@/lib/yjs/utils';

type NoteBoardProps = {
  noteId: string;
  blocks?: NoteBlock[]; // Now optional - deprecated, kept for initial seeding
};

const elk = new ELK();

const elkOptions = {
  'elk.algorithm': 'org.eclipse.elk.mrtree',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': '300',
  'elk.mrtree.searchDepth': '5',
};

function getHandleForAngle(angleInRadians: number): 'top' | 'right' | 'bottom' | 'left' {
  if (angleInRadians >= -Math.PI / 4 && angleInRadians < Math.PI / 4) {
    return 'right';
  } else if (angleInRadians >= Math.PI / 4 && angleInRadians < 3 * Math.PI / 4) {
    return 'bottom';
  } else if (angleInRadians >= 3 * Math.PI / 4 || angleInRadians < -3 * Math.PI / 4) {
    return 'left';
  } else {
    return 'top';
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
  if (nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

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

    const isDeepDiveEdge = targetNode.data?.block?.blockType === 'deep-dive';

    const sourceX = sourceNode.position.x + NODE_WIDTH / 2;
    const sourceY = sourceNode.position.y + NODE_HEIGHT / 2;
    const targetX = targetNode.position.x + NODE_WIDTH / 2;
    const targetY = targetNode.position.y + NODE_HEIGHT / 2;

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

const nodeTypes = {
  note: NoteBlockNode,
};

// Re-export NoteNodeData for components that import from here
export type { NoteNodeData } from '@/lib/yjs/utils';

export function NoteBoard({ noteId }: NoteBoardProps) {
  useNoteDoc(noteId); // Bind Y.Doc and sync to store

  const [selectedDeepDiveId, setSelectedDeepDiveId] = useState<string | null>(null);
  const setAutoLayoutEnabled = useNoteStore((state) => state.setAutoLayoutEnabled);

  // Y.js Store Data - the source of truth
  const storeNodes = useNoteStore((state) => state.nodes);
  const storeEdges = useNoteStore((state) => state.edges);

  const [nodes, setNodes, internalOnNodesChange] = useNodesState([]);
  const [edges, setEdgesLocal, onEdgesChange] = useEdgesState([]);

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const prevNodesLengthRef = useRef(0);
  const layoutAppliedRef = useRef(false);

  // Find selected block and parent from storeNodes
  const selectedBlock = useMemo(() => {
    const node = storeNodes.find((n: any) => n.id === selectedDeepDiveId);
    return (node?.data?.block as NoteBlock) ?? null;
  }, [storeNodes, selectedDeepDiveId]);

  const parentBlock = useMemo(() => {
    if (!selectedBlock?.parentId) return null;
    const parentNode = storeNodes.find((n: any) => n.id === selectedBlock.parentId);
    return (parentNode?.data?.block as NoteBlock) ?? null;
  }, [selectedBlock, storeNodes]);

  // Callback for measuring node heights
  const onMeasure = useCallback((nodeId: string, height: number) => {
    // Not used currently, but kept for future dynamic height adjustment
  }, []);

  // Callback for saving summary edits
  const handleSaveSummary = useCallback(
    (nodeId: string, summary: string) => {
      updateNodeData(noteId, nodeId, { summary });
    },
    [noteId],
  );

  // Handle node changes (dragging, selecting, resizing)
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      internalOnNodesChange(changes);

      // Persist position changes to Y.Doc
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          updateNodePosition(noteId, change.id, change.position);
        }
      });

      // Disable auto-layout when user interacts
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

  // Inject callbacks into nodes before rendering
  const nodesWithCallbacks = useMemo(() => {
    return storeNodes.map((node: Node<NoteNodeData>) => ({
      ...node,
      data: {
        ...node.data,
        onMeasure,
        onSaveSummary: handleSaveSummary,
        onOpenDrawer: setSelectedDeepDiveId,
      },
    }));
  }, [storeNodes, onMeasure, handleSaveSummary]);

  // Apply layout when nodes change
  useEffect(() => {
    const nodesCount = storeNodes.length;
    const edgesCount = storeEdges.length;

    // Skip if no nodes
    if (nodesCount === 0) return;

    const isNewNode = nodesCount > prevNodesLengthRef.current;
    prevNodesLengthRef.current = nodesCount;

    // Only re-layout if we have new nodes or it's the first layout
    const shouldLayout = isNewNode || !layoutAppliedRef.current;
    if (!shouldLayout) {
      // Just sync local state without re-layout
      setNodes(nodesWithCallbacks);
      setEdgesLocal(storeEdges);
      return;
    }

    const applyLayout = async () => {
      // Apply ELK layout to nodes
      const layouted = await getLayoutedElements(nodesWithCallbacks, storeEdges);

      // Write layouted positions back to Y.Doc
      setNodesYjs(noteId, layouted.nodes);
      setEdgesYjs(noteId, layouted.edges);

      layoutAppliedRef.current = true;

      // Focus on new deep dive node if one was added
      if (isNewNode && rfInstance) {
        const newNode = storeNodes[storeNodes.length - 1] as Node<NoteNodeData>;
        if (newNode?.data?.block?.blockType === 'deep-dive') {
          setTimeout(() => {
            rfInstance.fitView({
              nodes: [{ id: newNode.id }],
              duration: 1200,
              padding: 0.2,
            });
          }, 100);
        }
      }
    };

    applyLayout();
  }, [storeNodes, storeEdges, nodesWithCallbacks, noteId, rfInstance, setNodes, setEdgesLocal]);

  // Sync from store to local ReactFlow state
  useEffect(() => {
    if (nodesWithCallbacks.length > 0) {
      setNodes(nodesWithCallbacks);
    }
  }, [nodesWithCallbacks, setNodes]);

  useEffect(() => {
    if (storeEdges.length > 0) {
      setEdgesLocal(storeEdges);
    }
  }, [storeEdges, setEdgesLocal]);

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
