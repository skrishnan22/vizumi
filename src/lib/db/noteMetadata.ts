import Dexie, { type Table } from 'dexie';

export type DocKind = 'note' | 'canvas';

export interface NoteMetadata {
  noteId: string; // Primary key, matches Y.Doc guid
  kind: DocKind;
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
    this.version(2)
      .stores({
        notes: 'noteId, url, kind, createdAt, updatedAt',
      })
      .upgrade((tx) =>
        tx
          .table<NoteMetadata, string>('notes')
          .toCollection()
          .modify((note) => {
            if (!note.kind) {
              note.kind = 'note';
            }
          })
      );
  }
}

export const db = new NotesDatabase();
