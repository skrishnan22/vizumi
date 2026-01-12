'use client';

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ReactFlow, {
  Background,
  BackgroundVariant,
  type Node,
  type NodeChange,
  type EdgeChange,
  type ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { type NoteBlock } from '@/lib/schemas';
import { NoteBlockNode } from './NoteBlockNode';
import { DeepDiveDrawer } from './DeepDiveDrawer';
import styles from './NoteBoard.module.css';
import { useGraphStore } from '@/store/graphStore';
import { useNoteStore } from '@/store/noteStore';
import { updateNodePosition, updateNodeData } from '@/lib/graph/noteActions';
import { type NoteNodeData } from '@/lib/graph/noteUtils';

type NoteBoardProps = {
  noteId: string;
  isLoading?: boolean;
  isEmpty?: boolean;
};

// Must be defined outside component or memoized to prevent ReactFlow warnings
const nodeTypes = {
  note: NoteBlockNode,
} as const;

export function NoteBoard({ noteId, isLoading = false, isEmpty = false }: NoteBoardProps) {
  const [selectedDeepDiveId, setSelectedDeepDiveId] = useState<string | null>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<NoteNodeData, any> | null>(null);
  const fitViewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const nodes = useGraphStore((state) => state.nodes) as Node<NoteNodeData>[];
  const edges = useGraphStore((state) => state.edges);
  const setAutoLayoutEnabled = useNoteStore((state) => state.setAutoLayoutEnabled);
  const updateNode = useGraphStore((state) => state.updateNode);

  // Trigger fitView when new nodes are added (debounced)
  useEffect(() => {
    if (rfInstance && nodes.length > 0) {
      if (fitViewTimeoutRef.current) {
        clearTimeout(fitViewTimeoutRef.current);
      }

      fitViewTimeoutRef.current = setTimeout(() => {
        rfInstance.fitView({ padding: 0.2, duration: 800 });
      }, 200);
    }
    return () => {
      if (fitViewTimeoutRef.current) clearTimeout(fitViewTimeoutRef.current);
    };
  }, [nodes.length, rfInstance]);

  // Find selected block and parent from nodes
  const selectedBlock = useMemo(() => {
    const node = nodes.find((n) => n.id === selectedDeepDiveId);
    return (node?.data?.block as NoteBlock) ?? null;
  }, [nodes, selectedDeepDiveId]);

  const parentBlock = useMemo(() => {
    if (!selectedBlock?.parentId) return null;
    const parentNode = nodes.find((n) => n.id === selectedBlock.parentId);
    return (parentNode?.data?.block as NoteBlock) ?? null;
  }, [selectedBlock, nodes]);

  // Callback for measuring node heights
  const onMeasure = useCallback(() => {
    // Not used currently, but kept for future dynamic height adjustment
  }, []);

  // Callback for saving summary edits
  const handleSaveSummary = useCallback(
    (nodeId: string, summary: string) => {
      updateNodeData(noteId, nodeId, { summary });
    },
    [noteId]
  );

  // Callback for saving rendered SVG
  const handleSaveRenderedSvg = useCallback(
    (nodeId: string, svg: string) => {
      updateNodeData(noteId, nodeId, { renderedSvg: svg });
    },
    [noteId]
  );

  // Callback for updating block data (generic)
  const handleUpdateBlockData = useCallback(
    (nodeId: string, data: Partial<NoteBlock>) => {
      updateNodeData(noteId, nodeId, data);
    },
    [noteId]
  );

  // Callback for opening deep dive drawer
  // Wrap in useCallback to keep reference stable
  const handleOpenDrawer = useCallback((nodeId: string) => {
    setSelectedDeepDiveId(nodeId);
  }, []);

  /**
   * Handle node position changes from ReactFlow.
   *
   * During drag: Update Zustand for immediate visual feedback
   * After drag: Persist to Y.Doc (position may be undefined, so fallback to current state)
   */
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      for (const change of changes) {
        // Handle selection changes
        if (change.type === 'select') {
          updateNode(change.id, { selected: change.selected });
          continue;
        }

        if (change.type !== 'position') continue;

        if (change.dragging && change.position) {
          updateNode(change.id, { position: change.position });
          continue;
        }

        if (change.dragging === false) {
          const finalPosition = change.position ?? nodes.find((n) => n.id === change.id)?.position;
          if (!finalPosition) continue;

          updateNodePosition(noteId, change.id, finalPosition);
          setAutoLayoutEnabled(false);
        }
      }
    },
    [noteId, nodes, setAutoLayoutEnabled, updateNode]
  );

  // Handle edge changes (selection, etc.)
  const handleEdgesChange = useCallback((_changes: EdgeChange[]) => {}, []);

  /**
   * Inject stable callbacks into nodes.
   *
   * Important: This creates new node objects on every nodes change.
   * However, all callbacks are wrapped in useCallback, so they have stable references.
   * Combined with React.memo on NoteBlockNode, this minimizes unnecessary re-renders.
   *
   * Why this pattern?
   * - Nodes need access to callbacks for user interactions
   * - Callbacks are stable (useCallback), so shallow comparison in React.memo works
   * - Alternative would be a Context, but that complicates node components
   */
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onMeasure,
        onSaveSummary: handleSaveSummary,
        onSaveRenderedSvg: handleSaveRenderedSvg,
        onUpdateBlockData: handleUpdateBlockData,
        onOpenDrawer: handleOpenDrawer,
      },
    }));
  }, [
    nodes,
    onMeasure,
    handleSaveSummary,
    handleSaveRenderedSvg,
    handleUpdateBlockData,
    handleOpenDrawer,
  ]);

  // Loading state while IndexedDB syncs
  if (isLoading) {
    return (
      <section className={styles.boardSection} aria-label="Loading note">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading note...</p>
          </div>
        </div>
      </section>
    );
  }

  // Empty state if note doesn't exist
  if (isEmpty) {
    return (
      <section className={styles.boardSection} aria-label="Note not found">
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md px-6">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold mb-2">Note not found</h2>
            <p className="text-gray-600 mb-6">
              This note doesn&apos;t exist or hasn&apos;t been created yet.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create a new note
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.boardSection} aria-label="Generated visual notes">
      <div className={styles.flowShell}>
        <ReactFlow
          nodes={nodesWithCallbacks}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
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
