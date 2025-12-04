import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { getOrCreateYDoc } from '@/lib/yjs/doc';
import { useNoteStore } from '@/store/noteStore';

export function useNoteDoc(noteId: string) {
    const [doc, setDoc] = useState<Y.Doc | null>(null);
    const setGraph = useNoteStore((s) => s.setGraph);

    useEffect(() => {
        if (!noteId) return;

        const ydoc = getOrCreateYDoc(noteId);
        setDoc(ydoc);

        const apply = () => {
            const yNodes = ydoc.getMap('nodes');
            const yEdges = ydoc.getMap('edges');

            // Convert Y.Maps to arrays
            const nodes = Array.from(yNodes.values());
            const edges = Array.from(yEdges.values());

            setGraph(nodes, edges);
        };

        // Initial apply
        apply();

        // Debounced listener
        let timeout: NodeJS.Timeout;
        const debouncedApply = () => {
            clearTimeout(timeout);
            timeout = setTimeout(apply, 50);
        };

        ydoc.on('update', debouncedApply);

        return () => {
            ydoc.off('update', debouncedApply);
            clearTimeout(timeout);
        };
    }, [noteId, setGraph]);

    return doc;
}
