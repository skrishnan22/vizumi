import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { getOrCreateYDoc } from '@/lib/yjs/doc';

export function useNoteDoc(noteId: string) {
    const [doc, setDoc] = useState<Y.Doc | null>(null);

    useEffect(() => {
        if (!noteId) return;

        const ydoc = getOrCreateYDoc(noteId);
        setDoc(ydoc);

        // Debug listener to verify persistence
        const logUpdate = () => {
            // console.log(`[Y.Doc] Update received for note: ${noteId}`);
        };

        ydoc.on('update', logUpdate);

        return () => {
            ydoc.off('update', logUpdate);
        };
    }, [noteId]);

    return doc;
}
