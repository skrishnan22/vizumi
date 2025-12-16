'use client';

import { useMemo } from 'react';
import { NoteGenerator } from '@/components/NoteGenerator';
import { ErrorBoundary } from 'react-error-boundary';
import { toast } from 'sonner';
import { ErrorFallback } from '@/components/ErrorFallback';
import { clientLogger } from '@/lib/client-logger';

export default function NewNotePage() {
  // Generate noteId once on mount
  const noteId = useMemo(() => crypto.randomUUID(), []);

  return (
    <ErrorBoundary
      fallbackRender={({ resetErrorBoundary }) => (
        <ErrorFallback
          title="Generation failed"
          message="An error occurred while generating the note. Please try again."
          onReset={resetErrorBoundary}
          showHomeButton
          containerClassName="min-h-screen bg-neutral-50"
        />
      )}
      onError={(error, errorInfo) => {
        clientLogger.error('NoteGenerator error:', error, errorInfo);
        toast.error('Something went wrong. Please try again.');
      }}
    >
      <NoteGenerator noteId={noteId} />
    </ErrorBoundary>
  );
}
