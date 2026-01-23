'use client';

import { create } from 'zustand';

type NoteStore = {
  // Active note ID for Y.js binding
  noteId: string | null;
  setNoteId: (noteId: string | null) => void;

  // UI states
  autoLayoutEnabled: boolean;
  setAutoLayoutEnabled: (value: boolean) => void;
  isDeepDiveStreaming: boolean;
  setDeepDiveStreaming: (isStreaming: boolean) => void;
  isGenerating: boolean;
  setGenerating: (isGenerating: boolean) => void;

  // Markdown cache for deep-dive context (session-only storage)
  // Maps noteId -> markdown content
  markdownCache: Record<string, string>;
  setMarkdownForNote: (noteId: string, markdown: string) => void;
  clearMarkdownForNote: (noteId: string) => void;
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
  isGenerating: false,
  setGenerating: (isGenerating) => set({ isGenerating }),

  markdownCache: {},
  setMarkdownForNote: (noteId, markdown) =>
    set((state) => ({
      markdownCache: { ...state.markdownCache, [noteId]: markdown },
    })),
  clearMarkdownForNote: (noteId) =>
    set((state) => {
      const { [noteId]: _, ...rest } = state.markdownCache;
      return { markdownCache: rest };
    }),
}));
