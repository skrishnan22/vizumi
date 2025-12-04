'use client';

import { create } from 'zustand';
import type { NoteBlock } from '@/lib/schemas';

type NoteStore = {
  blocks: NoteBlock[];
  autoLayoutEnabled: boolean;
  sessionId: string | null;
  isDeepDiveStreaming: boolean;
  setBlocks: (blocks: NoteBlock[]) => void;
  setAutoLayoutEnabled: (value: boolean) => void;
  setSessionId: (sessionId: string) => void;
  addBlock: (block: NoteBlock) => void;
  updateBlockSummary: (id: string, summary: string) => void;
  setDeepDiveStreaming: (isStreaming: boolean) => void;
  setBlockStreaming: (id: string, isStreaming: boolean) => void;
  // Y.js Integration
  nodes: any[]; // Using any[] for now to avoid circular deps, but ideally Node[]
  edges: any[];
  setGraph: (nodes: any[], edges: any[]) => void;
};

export const useNoteStore = create<NoteStore>((set) => ({
  blocks: [],
  autoLayoutEnabled: true,
  sessionId: null,
  isDeepDiveStreaming: false,
  setBlocks: (blocks) => set({ blocks }),
  setAutoLayoutEnabled: (value) => set({ autoLayoutEnabled: value }),
  setSessionId: (sessionId) => set({ sessionId }),
  addBlock: (block) => set((state) => ({ blocks: [...state.blocks, block] })),
  updateBlockSummary: (id, summary) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? { ...block, summary } : block,
      ),
    })),
  setDeepDiveStreaming: (isStreaming) =>
    set({ isDeepDiveStreaming: isStreaming }),
  setBlockStreaming: (id, isStreaming) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? { ...block, isStreaming } : block,
      ),
    })),
  // Y.js Integration
  nodes: [],
  edges: [],
  setGraph: (nodes, edges) => set({ nodes, edges }),
}));
