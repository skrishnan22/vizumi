'use client';

import { useMemo } from 'react';
import { NoteGenerator } from '@/components/NoteGenerator';

export default function NewNotePage() {
  // Generate noteId once on mount
  const noteId = useMemo(() => crypto.randomUUID(), []);

  return <NoteGenerator noteId={noteId} />;
}
