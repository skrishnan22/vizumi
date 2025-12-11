'use client';

import { create } from 'zustand';

type NoteStore = {
  // Active note ID for Y.js binding
  noteId: string | null;
  setNoteId: (noteId: string) => void;

  // UI states
  autoLayoutEnabled: boolean;
  setAutoLayoutEnabled: (value: boolean) => void;
  isDeepDiveStreaming: boolean;
  setDeepDiveStreaming: (isStreaming: boolean) => void;

  // Y.js Integration - the source of truth
  nodes: any[]; // React Flow nodes from Y.Doc
  edges: any[]; // React Flow edges from Y.Doc
  setGraph: (nodes: any[], edges: any[]) => void;
};

export const useNoteStore = create<NoteStore>((set) => ({
  // Active note
  noteId: null,
  setNoteId: (noteId) => set({ noteId }),

  // UI states
  autoLayoutEnabled: true,
  setAutoLayoutEnabled: (value) => set({ autoLayoutEnabled: value }),
  isDeepDiveStreaming: false,
  setDeepDiveStreaming: (isStreaming) =>
    set({ isDeepDiveStreaming: isStreaming }),

  // Y.js Integration
  nodes: [],
  edges: [],
  setGraph: (nodes, edges) => set({ nodes, edges }),
}));
