import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';

export type YDocWithPersistence = {
  doc: Y.Doc;
  persistence: IndexeddbPersistence;
};

// Cache to avoid creating multiple docs/providers for the same note
const docs = new Map<string, YDocWithPersistence>();

export function getOrCreateYDoc(noteId: string): YDocWithPersistence {
  if (docs.has(noteId)) {
    return docs.get(noteId)!;
  }

  const doc = new Y.Doc({ guid: noteId });

  // Initialize persistence
  // This will automatically load data from IndexedDB if it exists
  // and save updates to IndexedDB when the doc changes.
  const persistence = new IndexeddbPersistence(noteId, doc);

  const entry = { doc, persistence };
  docs.set(noteId, entry);

  return entry;
}

// Helper to check if a doc exists in memory (mostly for debugging)
export function getYDoc(noteId: string): Y.Doc | undefined {
  return docs.get(noteId)?.doc;
}

/**
 * Delete a Y.Doc and its IndexedDB persistence
 */
export async function deleteYDoc(noteId: string): Promise<void> {
  const entry = docs.get(noteId);

  if (entry) {
    // clearData() calls destroy() internally and deletes the IndexedDB database
    await entry.persistence.clearData();

    // Destroy the Y.Doc
    entry.doc.destroy();

    // Remove from cache
    docs.delete(noteId);
  }
}
