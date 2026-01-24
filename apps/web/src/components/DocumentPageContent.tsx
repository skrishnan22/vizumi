'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { getNoteMetadata } from '@/lib/db/actions';
import { type NoteMetadata } from '@/lib/db/noteMetadata';
import { clientLogger } from '@/lib/client-logger';
import { NoteBoard, type NoteBoardHandle } from '@/components/NoteBoard';
import { CanvasDocBoard, type CanvasBoardHandle } from '@/components/canvas/CanvasDocBoard';
import { NoteHeader } from '@/components/NoteHeader';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { toast } from 'sonner';
import { useGraphDoc } from '@/hooks/useGraphDoc';
import { useNoteStore } from '@/store/noteStore';

type DocumentPageContentProps = {
  docId: string;
};

export function DocumentPageContent({ docId }: DocumentPageContentProps) {
  const [metadata, setMetadata] = useState<NoteMetadata | undefined>(undefined);
  const [isMetadataLoading, setIsMetadataLoading] = useState(true);
  const noteBoardRef = useRef<NoteBoardHandle | null>(null);
  const canvasBoardRef = useRef<CanvasBoardHandle | null>(null);
  const setNoteId = useNoteStore((state) => state.setNoteId);

  // Start loading graph doc immediately (without kind) to parallelize with metadata fetch.
  // The kind is optional and only needed to set metadata on new docs.
  // This eliminates the waterfall: metadata fetch and doc loading now happen in parallel.
  const { isLoading: isDocLoading, isEmpty } = useGraphDoc({ docId });

  useEffect(() => {
    let isMounted = true;
    setIsMetadataLoading(true);

    getNoteMetadata(docId)
      .then((data) => {
        if (!isMounted) return;
        setMetadata(data);
        setIsMetadataLoading(false);
      })
      .catch((err) => {
        clientLogger.error('Failed to fetch document metadata', err);
        if (!isMounted) return;
        setMetadata(undefined);
        setIsMetadataLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [docId]);

  useEffect(() => {
    if (metadata?.kind === 'note') {
      setNoteId(docId);
      return () => setNoteId(null);
    }
  }, [docId, metadata?.kind, setNoteId]);

  const exportLabel = useMemo(() => {
    if (!metadata) return 'Export Image';
    return metadata.kind === 'canvas' ? 'Export Canvas' : 'Export Note';
  }, [metadata]);

  const handleExportImage = async () => {
    const boardHandle = metadata?.kind === 'canvas' ? canvasBoardRef.current : noteBoardRef.current;

    if (!boardHandle) {
      toast.error('Document is not ready to export.');
      return;
    }

    try {
      const dataUrl = await boardHandle.exportPng();
      const safeTitle = (metadata?.title || 'visual-document')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const anchor = document.createElement('a');
      anchor.href = dataUrl;
      anchor.download = `${safeTitle || 'visual-document'}.png`;
      anchor.click();
      toast.success('Image downloaded.');
    } catch (error) {
      clientLogger.error('Failed to export image', error);
      toast.error('Could not export the image.');
    }
  };

  if (isMetadataLoading || isDocLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading document...</p>
        </div>
      </main>
    );
  }

  if (!metadata || isEmpty) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center bg-white border border-stone-200 rounded-2xl p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-stone-900 mb-3">Document not found</h1>
          <p className="text-sm text-stone-600 mb-6">
            This document doesn&apos;t exist or hasn&apos;t been created yet.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
          >
            Create New
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <NoteHeader
        metadata={metadata}
        isLoading={isMetadataLoading}
        actions={
          <button
            type="button"
            onClick={handleExportImage}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-semibold shadow-sm hover:border-teal-300 hover:text-teal-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isDocLoading}
            title={exportLabel}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="8.5" cy="10.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span>Export Image</span>
          </button>
        }
      />

      <main className="flex-1 relative flex flex-col">
        <ErrorBoundary
          fallbackRender={({ resetErrorBoundary }) => (
            <ErrorFallback
              title="Failed to render board"
              message="The document board encountered an error. Please try again."
              onReset={resetErrorBoundary}
            />
          )}
          onError={(error, errorInfo) => {
            clientLogger.error('Document board error:', error, errorInfo);
            toast.error('Something went wrong. Please try again.');
          }}
        >
          {metadata.kind === 'canvas' ? (
            <CanvasDocBoard
              docId={docId}
              ref={canvasBoardRef}
              showSkeletonCard={false}
              isLoading={isDocLoading}
            />
          ) : (
            <NoteBoard noteId={docId} ref={noteBoardRef} />
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}
