import { db, type NoteMetadata } from './noteMetadata';

/**
 * Create a new note metadata entry
 */
export async function createNoteMetadata(
  metadata: Omit<NoteMetadata, 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date();
  const fullMetadata: NoteMetadata = {
    ...metadata,
    createdAt: now,
    updatedAt: now,
  };

  await db.notes.add(fullMetadata);
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
export async function getNoteByUrl(url: string): Promise<NoteMetadata | undefined> {
  return db.notes.where('url').equals(url).first();
}
