'use client';

import useSWR from 'swr';
import { getAllNotes } from '@/lib/db/actions';
import type { NoteMetadata } from '@/lib/db/noteMetadata';

const DOCS_KEY = 'docs-list';

async function fetchDocs(): Promise<NoteMetadata[]> {
  return getAllNotes();
}

export function useDocsList() {
  const {
    data: docs = [],
    isLoading,
    mutate,
  } = useSWR<NoteMetadata[]>(DOCS_KEY, fetchDocs, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  return {
    docs,
    isLoading,
    refetch: () => mutate(),
  };
}
