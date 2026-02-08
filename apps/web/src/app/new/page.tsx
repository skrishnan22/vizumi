'use client';

import { useMemo } from 'react';
import { NoteGenerator } from '@/components/NoteGenerator';
import { ErrorBoundary } from 'react-error-boundary';
import { toast } from 'sonner';
import { ErrorFallback } from '@/components/ErrorFallback';
import { clientLogger } from '@/lib/client-logger';
import { trackClientError } from '@/lib/posthog';

export default function NewNotePage() {
  // Generate docId once on mount
  const docId = useMemo(() => crypto.randomUUID(), []);

  return (
    <ErrorBoundary
      fallbackRender={({ resetErrorBoundary }) => (
        <ErrorFallback
          title="Generation failed"
          message="An error occurred while generating the document. Please try again."
          onReset={resetErrorBoundary}
          showHomeButton
          containerClassName="min-h-screen bg-neutral-50"
        />
      )}
      onError={(error, errorInfo) => {
        clientLogger.error('NoteGenerator error:', error, errorInfo);
        trackClientError(error, {
          source: 'new_note_error_boundary',
          component_stack: errorInfo.componentStack ?? null,
        });
        toast.error('Something went wrong. Please try again.');
      }}
    >
      <NoteGenerator docId={docId} />
    </ErrorBoundary>
  );
}
