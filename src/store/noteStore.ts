'use client';

import { create } from 'zustand';
import type { Node, Edge } from 'reactflow';
import type { NoteNodeData } from '@/lib/yjs/utils';

type NoteStore = {
  // Active note ID for Y.js binding
  noteId: string | null;
  setNoteId: (noteId: string | null) => void;

  // UI states
  autoLayoutEnabled: boolean;
  setAutoLayoutEnabled: (value: boolean) => void;
  isDeepDiveStreaming: boolean;
  setDeepDiveStreaming: (isStreaming: boolean) => void;

  // Y.js Integration - Single source of truth for ReactFlow
  // These are the ONLY place where nodes/edges live in React state
  nodes: Node<NoteNodeData>[];
  edges: Edge[];
  setGraph: (nodes: Node<NoteNodeData>[], edges: Edge[]) => void;

  // Individual node updates (for streaming/editing without full graph replacement)
  updateNode: (nodeId: string, updates: Partial<Node<NoteNodeData>>) => void;
};

export const useNoteStore = create<NoteStore>((set) => ({
  // Active note
  noteId: null,
  setNoteId: (noteId) => set({ noteId }),

  // UI states
  autoLayoutEnabled: true,
  setAutoLayoutEnabled: (value) => set({ autoLayoutEnabled: value }),
  isDeepDiveStreaming: false,
  setDeepDiveStreaming: (isStreaming) => set({ isDeepDiveStreaming: isStreaming }),

  // Y.js Integration
  nodes: [],
  edges: [],
  setGraph: (nodes, edges) => set({ nodes, edges }),

  // Optimized individual node updates
  updateNode: (nodeId, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) => (node.id === nodeId ? { ...node, ...updates } : node)),
    })),
}));
