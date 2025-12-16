import Dexie, { type Table } from 'dexie';

export interface NoteMetadata {
  noteId: string; // Primary key, matches Y.Doc guid
  url: string;
  title: string;
  ogImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

class NotesDatabase extends Dexie {
  notes!: Table<NoteMetadata, string>;

  constructor() {
    super('NotesMetadata');
    this.version(1).stores({
      notes: 'noteId, url, createdAt, updatedAt',
    });
  }
}

export const db = new NotesDatabase();
