import { useEffect, useState } from 'react';
import type * as Y from 'yjs';
import { getOrCreateYDoc } from '@/lib/yjs/doc';
import { useNoteStore } from '@/store/noteStore';
import type { Node, Edge } from 'reactflow';
import type { NoteNodeData } from '@/lib/yjs/utils';

/**
 * Hook to bind a Y.Doc to Zustand store.
 *
 * Data Flow:
 * Y.Doc (CRDT) → Y.Map updates → This hook observes → Zustand store updates → React re-renders
 *
 * Key Principles:
 * 1. Y.Doc is the persistent source of truth (syncs to IndexedDB automatically)
 * 2. Zustand is the reactive UI layer (what React components read)
 * 3. This hook is the ONLY bridge between them - one-way data flow
 * 4. No debouncing needed - React 18 automatically batches state updates
 */
export function useNoteDoc(noteId: string) {
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const setGraph = useNoteStore((s) => s.setGraph);

  useEffect(() => {
    if (!noteId) return;

    const { doc: ydoc, persistence } = getOrCreateYDoc(noteId);

    // Initialize doc and loading state
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDoc(ydoc);
    setIsLoading(true);

    // Sync Y.Doc → Zustand
    const syncToStore = () => {
      const yNodes = ydoc.getMap('nodes');
      const yEdges = ydoc.getMap('edges');

      // Convert Y.Maps to arrays with proper types
      const nodes = Array.from(yNodes.values()) as Node<NoteNodeData>[];
      const edges = Array.from(yEdges.values()) as Edge[];

      setGraph(nodes, edges);
    };

    // Wait for IndexedDB sync before initial render
    const handleSynced = () => {
      setIsLoading(false);

      // Check if the note is empty after loading from IndexedDB
      const yNodes = ydoc.getMap('nodes');
      setIsEmpty(yNodes.size === 0);

      // Initial sync to store
      syncToStore();
    };

    // Listen for persistence sync
    persistence.once('synced', handleSynced);

    // If already synced (e.g., cached doc), call handler immediately
    if (persistence.synced) {
      handleSynced();
    }

    // Listen for Y.Doc updates after initial load
    // React 18 automatically batches multiple setGraph calls in the same tick
    ydoc.on('update', syncToStore);

    return () => {
      ydoc.off('update', syncToStore);
      persistence.off('synced', handleSynced);
    };
  }, [noteId, setGraph]);

  return { doc, isLoading, isEmpty };
}
