import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';

export type GraphDocKind = 'note' | 'canvas';

export type GraphDocWithPersistence = {
  doc: Y.Doc;
  persistence: IndexeddbPersistence;
};

// Cache to avoid creating multiple docs/providers for the same docId
const docs = new Map<string, GraphDocWithPersistence>();

function ensureDocKind(entry: GraphDocWithPersistence, kind: GraphDocKind): void {
  const meta = entry.doc.getMap('meta');

  const applyKind = () => {
    if (!meta.get('kind')) {
      entry.doc.transact(() => {
        meta.set('kind', kind);
      });
    }
  };

  if (entry.persistence.synced) {
    applyKind();
  } else {
    entry.persistence.once('synced', applyKind);
  }
}

export function getOrCreateGraphDoc(docId: string, kind?: GraphDocKind): GraphDocWithPersistence {
  const existing = docs.get(docId);
  if (existing) {
    if (kind) {
      ensureDocKind(existing, kind);
    }
    return existing;
  }

  const doc = new Y.Doc({ guid: docId });
  const persistence = new IndexeddbPersistence(docId, doc);
  const entry = { doc, persistence };

  docs.set(docId, entry);

  if (kind) {
    ensureDocKind(entry, kind);
  }

  return entry;
}

// Helper to check if a doc exists in memory (mostly for debugging)
export function getGraphDoc(docId: string): Y.Doc | undefined {
  return docs.get(docId)?.doc;
}

/**
 * Release a graph doc from memory while keeping IndexedDB data intact.
 */
export function releaseGraphDoc(docId: string): void {
  const entry = docs.get(docId);

  if (entry) {
    entry.doc.destroy();
    docs.delete(docId);
  }
}

/**
 * Delete a graph doc and its IndexedDB persistence.
 */
export async function deleteGraphDoc(docId: string): Promise<void> {
  const entry = docs.get(docId);

  if (entry) {
    await entry.persistence.clearData();
    entry.doc.destroy();
    docs.delete(docId);
  }
}
