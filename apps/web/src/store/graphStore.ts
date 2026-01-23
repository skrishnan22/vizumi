'use client';

import { create } from 'zustand';
import type { Edge, Node } from 'reactflow';

type GraphStore = {
  docId: string | null;
  setDocId: (docId: string | null) => void;

  nodes: Node[];
  edges: Edge[];
  setGraph: (nodes: Node[], edges: Edge[]) => void;

  // UI-only node updates (selection/temporary drag positions)
  updateNode: (nodeId: string, updates: Partial<Node>) => void;
};

export const useGraphStore = create<GraphStore>((set) => ({
  docId: null,
  setDocId: (docId) => set({ docId }),

  nodes: [],
  edges: [],
  setGraph: (newNodes, edges) =>
    set((state) => {
      const selectionMap = new Map(state.nodes.map((node) => [node.id, node.selected]));
      const nodesWithSelection = newNodes.map((node) => ({
        ...node,
        selected: selectionMap.get(node.id) ?? false,
      }));
      return { nodes: nodesWithSelection, edges };
    }),

  updateNode: (nodeId, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) => (node.id === nodeId ? { ...node, ...updates } : node)),
    })),
}));
