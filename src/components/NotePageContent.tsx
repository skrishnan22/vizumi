'use client';

import { NoteBoard } from './NoteBoard';
import { useNoteDoc } from '@/hooks/useNoteDoc';
import { ErrorBoundary } from 'react-error-boundary';
import { toast } from 'sonner';
import { ErrorFallback } from './ErrorFallback';
import { clientLogger } from '@/lib/client-logger';
import { NoteHeader } from './NoteHeader';
import { getNoteMetadata } from '@/lib/db/actions';
import { type NoteMetadata } from '@/lib/db/noteMetadata';
import { useEffect, useState } from 'react';

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
  const { isLoading } = useNoteDoc(noteId);
  const [metadata, setMetadata] = useState<NoteMetadata | undefined>(metadataOverride);
  const [isMetadataLoading, setIsMetadataLoading] = useState(metadataOverride ? false : true);

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
          <NoteBoard noteId={noteId} />
        </ErrorBoundary>
      </main>
    </div>
  );
}
