'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAllNotes } from '@/lib/db/actions';
import type { NoteMetadata } from '@/lib/db/noteMetadata';
import { logger } from '@/lib/logger.client';

export function useDocsList() {
  const [docs, setDocs] = useState<NoteMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocs = useCallback(async () => {
    setIsLoading(true);
    try {
      const allNotes = await getAllNotes();
      setDocs(allNotes);
    } catch (error) {
      logger.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const refetch = useCallback(() => {
    fetchDocs();
  }, [fetchDocs]);

  return { docs, isLoading, refetch };
}
