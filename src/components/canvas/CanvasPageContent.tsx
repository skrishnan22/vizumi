'use client';

import { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { toast } from 'sonner';
import Link from 'next/link';

import { CanvasDocBoard } from '@/components/canvas/CanvasDocBoard';
import { useGraphDoc } from '@/hooks/useGraphDoc';
import { ErrorFallback } from '@/components/ErrorFallback';
import { clientLogger } from '@/lib/client-logger';
import { NoteHeader } from '@/components/NoteHeader';
import { getNoteMetadata } from '@/lib/db/actions';
import { type NoteMetadata } from '@/lib/db/noteMetadata';

type CanvasPageContentProps = {
  canvasId: string;
  metadata?: NoteMetadata;
  isMetadataLoading?: boolean;
};

export function CanvasPageContent({
  canvasId,
  metadata: metadataOverride,
  isMetadataLoading: isMetadataLoadingOverride,
}: CanvasPageContentProps) {
  const { isLoading, isEmpty } = useGraphDoc({ docId: canvasId, kind: 'canvas' });
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
    getNoteMetadata(canvasId)
      .then((data) => {
        setMetadata(data);
        setIsMetadataLoading(false);
      })
      .catch((err) => {
        clientLogger.error('Failed to fetch canvas metadata', err);
        setIsMetadataLoading(false);
      });
  }, [canvasId, metadataOverride, isMetadataLoadingOverride]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading canvas...</p>
        </div>
      </main>
    );
  }

  if (isEmpty) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center bg-white border border-stone-200 rounded-2xl p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-stone-900 mb-3">Canvas not found</h1>
          <p className="text-sm text-stone-600 mb-6">
            This canvas doesn&apos;t exist or hasn&apos;t been created yet.
          </p>
          <Link
            href="/canvas/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
          >
            Create a new canvas
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
              title="Failed to render canvas"
              message="The canvas board encountered an error. Please try again."
              onReset={resetErrorBoundary}
            />
          )}
          onError={(error, errorInfo) => {
            clientLogger.error('CanvasDocBoard error:', error, errorInfo);
            toast.error('Something went wrong. Please try again.');
          }}
        >
          <CanvasDocBoard docId={canvasId} showSkeletonCard={false} />
        </ErrorBoundary>
      </main>
    </div>
  );
}
