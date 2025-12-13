"use client";

import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  NodeChange,
  EdgeChange,
  type Node,
  type Edge,
  MarkerType,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import { NoteBlock } from "@/lib/schemas";
import { NoteBlockNode } from "./NoteBlockNode";
import { DeepDiveDrawer } from "./DeepDiveDrawer";
import styles from "./NoteBoard.module.css";
import { useNoteStore } from "@/store/noteStore";
import { useNoteDoc } from "@/hooks/useNoteDoc";
import { updateNodePosition, updateNodeData } from "@/lib/yjs/actions";

type NoteBoardProps = {
  noteId: string;
};

// Must be defined outside component or memoized to prevent ReactFlow warnings
const nodeTypes = {
  note: NoteBlockNode,
} as const;

export function NoteBoard({ noteId }: NoteBoardProps) {
  const { isLoading, isEmpty } = useNoteDoc(noteId); // Bind Y.Doc and sync to store

  const [selectedDeepDiveId, setSelectedDeepDiveId] = useState<string | null>(
    null
  );
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const nodes = useNoteStore((state) => state.nodes);
  const edges = useNoteStore((state) => state.edges);
  const setAutoLayoutEnabled = useNoteStore(
    (state) => state.setAutoLayoutEnabled
  );
  const updateNode = useNoteStore((state) => state.updateNode);

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
  const onMeasure = useCallback((nodeId: string, height: number) => {
    // Not used currently, but kept for future dynamic height adjustment
  }, []);

  // Callback for saving summary edits
  const handleSaveSummary = useCallback(
    (nodeId: string, summary: string) => {
      updateNodeData(noteId, nodeId, { summary });
    },
    [noteId]
  );

  // Callback for opening deep dive drawer
  // Wrap in useCallback to keep reference stable
  const handleOpenDrawer = useCallback((nodeId: string) => {
    setSelectedDeepDiveId(nodeId);
  }, []);

  /**
   * Handle node changes from ReactFlow.
   *
   * In controlled mode, ReactFlow needs us to apply ALL changes to state,
   * otherwise the UI won't update. We use a two-phase approach:
   *
   * Phase 1 (During drag): Update Zustand immediately for visual feedback
   * Phase 2 (After drag): Persist to Y.Doc for permanent storage
   */
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === "position" && change.position) {
          if (change.dragging) {
            updateNode(change.id, { position: change.position });
          } else {
            updateNodePosition(noteId, change.id, change.position);
            // Disable auto-layout since user manually positioned
            setAutoLayoutEnabled(false);
          }
        }
      });
    },
    [noteId, setAutoLayoutEnabled, updateNode]
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
        onOpenDrawer: handleOpenDrawer,
      },
    }));
  }, [nodes, onMeasure, handleSaveSummary, handleOpenDrawer]);

  // Loading state while IndexedDB syncs
  if (isLoading) {
    return (
      <section
        className={styles.boardSection}
        aria-label="Loading note"
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading note...</p>
          </div>
        </div>
      </section>
    );
  }

  // Empty state if note doesn't exist
  if (isEmpty) {
    return (
      <section
        className={styles.boardSection}
        aria-label="Note not found"
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md px-6">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold mb-2">Note not found</h2>
            <p className="text-gray-600 mb-6">
              This note doesn't exist or hasn't been created yet.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create a new note
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={styles.boardSection}
      aria-label="Generated visual notes"
    >
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
