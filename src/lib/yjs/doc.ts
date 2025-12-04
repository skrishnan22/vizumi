import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';

// Cache to avoid creating multiple docs/providers for the same note
const docs = new Map<string, Y.Doc>();

export function getOrCreateYDoc(noteId: string): Y.Doc {
    if (docs.has(noteId)) {
        return docs.get(noteId)!;
    }

    const doc = new Y.Doc({ guid: noteId });

    // Initialize persistence
    // This will automatically load data from IndexedDB if it exists
    // and save updates to IndexedDB when the doc changes.
    new IndexeddbPersistence(noteId, doc);

    docs.set(noteId, doc);

    return doc;
}

// Helper to check if a doc exists in memory (mostly for debugging)
export function getYDoc(noteId: string): Y.Doc | undefined {
    return docs.get(noteId);
}
