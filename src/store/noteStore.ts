'use client';

import { create } from 'zustand';
import type { NoteBlock } from '@/lib/schemas';

type NoteStore = {
  blocks: NoteBlock[];
  autoLayoutEnabled: boolean;
  setBlocks: (blocks: NoteBlock[]) => void;
  setAutoLayoutEnabled: (value: boolean) => void;
  updateBlockSummary: (id: string, summary: string) => void;
};

export const useNoteStore = create<NoteStore>((set) => ({
  blocks: [],
  autoLayoutEnabled: true,
  setBlocks: (blocks) => set({ blocks }),
  setAutoLayoutEnabled: (value) => set({ autoLayoutEnabled: value }),
  updateBlockSummary: (id, summary) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? { ...block, summary } : block,
      ),
    })),
}));
