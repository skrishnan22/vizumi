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
}));
