'use client';

import { useRouter } from 'next/navigation';
import { useNotesList } from '@/hooks/useNotesList';
import { NoteCard } from './NoteCard';

export function NotesList() {
  const { notes, isLoading } = useNotesList();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your notes...</p>
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-2xl border-2 border-dashed border-gray-300">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          No notes yet
        </h3>
        <p className="text-gray-500 max-w-md text-lg">
          Paste an article URL above to create your first visual note
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <NoteCard
          key={note.noteId}
          noteId={note.noteId}
          title={note.title}
          url={note.url}
          ogImage={note.ogImage}
          updatedAt={note.updatedAt}
          onClick={() => router.push(`/notes/${note.noteId}`)}
        />
      ))}
    </div>
  );
}
