'use client';

import { useEffect, useState } from 'react';
import type * as Y from 'yjs';
import type { Edge, Node } from 'reactflow';
import { getOrCreateGraphDoc, releaseGraphDoc, type GraphDocKind } from '@/lib/graph/doc';
import { useGraphStore } from '@/store/graphStore';

type UseGraphDocParams = {
  docId: string;
  kind?: GraphDocKind;
};

/**
 * Hook to bind a graph Y.Doc to Zustand store.
 *
 * Data Flow:
 * Y.Doc (CRDT) → Y.Map updates → This hook observes → Zustand store updates → React re-renders
 */
export function useGraphDoc({ docId, kind }: UseGraphDocParams) {
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const setGraph = useGraphStore((s) => s.setGraph);
  const setDocId = useGraphStore((s) => s.setDocId);

  useEffect(() => {
    if (!docId) return;

    setDocId(docId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setIsEmpty(false);

    const { doc: ydoc, persistence } = getOrCreateGraphDoc(docId, kind);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDoc(ydoc);

    const syncToStore = () => {
      const yNodes = ydoc.getMap('nodes');
      const yEdges = ydoc.getMap('edges');

      const nodes = Array.from(yNodes.values()) as Node[];
      const edges = Array.from(yEdges.values()) as Edge[];

      setGraph(nodes, edges);
      setIsEmpty(yNodes.size === 0);
    };

    const handleSynced = () => {
      setIsLoading(false);

      syncToStore();
    };

    persistence.once('synced', handleSynced);

    if (persistence.synced) {
      handleSynced();
    }

    ydoc.on('update', syncToStore);

    return () => {
      ydoc.off('update', syncToStore);
      persistence.off('synced', handleSynced);
      setDocId(null);
      releaseGraphDoc(docId);
    };
  }, [docId, kind, setDocId, setGraph]);

  return { doc, isLoading, isEmpty };
}
