'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAllNotes } from '@/lib/db/actions';
import type { NoteMetadata } from '@/lib/db/noteMetadata';

export function useNotesList() {
  const [notes, setNotes] = useState<NoteMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const allNotes = await getAllNotes();
      setNotes(allNotes);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const refetch = useCallback(() => {
    fetchNotes();
  }, [fetchNotes]);

  return { notes, isLoading, refetch };
}
