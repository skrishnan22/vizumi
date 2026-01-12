'use client';

import { NoteBoard } from './NoteBoard';
import { useGraphDoc } from '@/hooks/useGraphDoc';
import Link from 'next/link';
import { ErrorBoundary } from 'react-error-boundary';
import { toast } from 'sonner';
import { ErrorFallback } from './ErrorFallback';
import { clientLogger } from '@/lib/client-logger';
import { NoteHeader } from './NoteHeader';
import { getNoteMetadata } from '@/lib/db/actions';
import { type NoteMetadata } from '@/lib/db/noteMetadata';
import { useEffect, useState } from 'react';
import { useNoteStore } from '@/store/noteStore';

type NotePageContentProps = {
  noteId: string;
  metadata?: NoteMetadata;
  isMetadataLoading?: boolean;
};

export function NotePageContent({
  noteId,
  metadata: metadataOverride,
  isMetadataLoading: isMetadataLoadingOverride,
}: NotePageContentProps) {
  const { isLoading, isEmpty } = useGraphDoc({ docId: noteId, kind: 'note' });
  const setNoteId = useNoteStore((state) => state.setNoteId);
  const [metadata, setMetadata] = useState<NoteMetadata | undefined>(metadataOverride);
  const [isMetadataLoading, setIsMetadataLoading] = useState(metadataOverride ? false : true);

  useEffect(() => {
    setNoteId(noteId);
    return () => setNoteId(null);
  }, [noteId, setNoteId]);

  useEffect(() => {
    if (metadataOverride) {
      setMetadata(metadataOverride);
      setIsMetadataLoading(isMetadataLoadingOverride ?? false);
      return;
    }

    setMetadata(undefined);
    setIsMetadataLoading(true);
    getNoteMetadata(noteId)
      .then((data) => {
        setMetadata(data);
        setIsMetadataLoading(false);
      })
      .catch((err) => {
        clientLogger.error('Failed to fetch note metadata', err);
        setIsMetadataLoading(false);
      });
  }, [noteId, metadataOverride, isMetadataLoadingOverride]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (isEmpty) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center bg-white border border-stone-200 rounded-2xl p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-stone-900 mb-3">Note not found</h1>
          <p className="text-sm text-stone-600 mb-6">
            This note doesn&apos;t exist or hasn&apos;t been created yet.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
          >
            Create a new note
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <NoteHeader metadata={metadata} isLoading={isMetadataLoading} />

      <main className="flex-1 relative flex flex-col">
        <ErrorBoundary
          fallbackRender={({ resetErrorBoundary }) => (
            <ErrorFallback
              title="Failed to render board"
              message="The note board encountered an error. Please try again."
              onReset={resetErrorBoundary}
            />
          )}
          onError={(error, errorInfo) => {
            clientLogger.error('NoteBoard error:', error, errorInfo);
            toast.error('Something went wrong. Please try again.');
          }}
        >
          <NoteBoard noteId={noteId} isLoading={isLoading} isEmpty={isEmpty} />
        </ErrorBoundary>
      </main>
    </div>
  );
}
