import { db, type NoteMetadata } from './noteMetadata';
import { deleteGraphDoc } from '@/lib/graph/doc';

/**
 * Create a new note metadata entry
 */
export async function createNoteMetadata(
  metadata: Omit<NoteMetadata, 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date();
  const existing = await db.notes.get(metadata.noteId);
  const fullMetadata: NoteMetadata = {
    ...metadata,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await db.notes.put(fullMetadata);
  return metadata.noteId;
}

/**
 * Update existing note metadata
 */
export async function updateNoteMetadata(
  noteId: string,
  updates: Partial<Omit<NoteMetadata, 'noteId' | 'createdAt'>>
): Promise<void> {
  await db.notes.update(noteId, {
    ...updates,
    updatedAt: new Date(),
  });
}

/**
 * Delete a note metadata entry
 */
export async function deleteNoteMetadata(noteId: string): Promise<void> {
  await db.notes.delete(noteId);
}

/**
 * Get all notes, ordered by most recently updated
 */
export async function getAllNotes(): Promise<NoteMetadata[]> {
  return db.notes.orderBy('updatedAt').reverse().toArray();
}

/**
 * Get a single note's metadata by ID
 */
export async function getNoteMetadata(noteId: string): Promise<NoteMetadata | undefined> {
  return db.notes.get(noteId);
}

/**
 * Get a note by its source URL (for duplicate detection)
 */
export async function getNoteByUrl(
  url: string,
  kind: NoteMetadata['kind']
): Promise<NoteMetadata | undefined> {
  const matches = await db.notes.where('url').equals(url).toArray();
  return matches.find((note) => note.kind === kind);
}

/**
 * Delete a note completely (both metadata and Y.Doc from IndexedDB)
 */
export async function deleteNote(noteId: string, _kind: NoteMetadata['kind']): Promise<void> {
  await Promise.all([deleteNoteMetadata(noteId), deleteGraphDoc(noteId)]);
}
