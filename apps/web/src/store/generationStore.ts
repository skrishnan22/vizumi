'use client';

import { create } from 'zustand';
import type { DocKind } from '@/lib/db/noteMetadata';

type PendingGeneration = {
  url: string;
  mode: DocKind;
  model: string | null;
};

type GenerationStore = {
  pending: PendingGeneration | null;
  setPending: (data: PendingGeneration) => void;
  clearPending: () => PendingGeneration | null;
};

export const useGenerationStore = create<GenerationStore>((set, get) => ({
  pending: null,
  setPending: (data) => set({ pending: data }),
  clearPending: () => {
    const current = get().pending;
    set({ pending: null });
    return current;
  },
}));
