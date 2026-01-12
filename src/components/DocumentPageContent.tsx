'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getNoteMetadata } from '@/lib/db/actions';
import { type NoteMetadata } from '@/lib/db/noteMetadata';
import { clientLogger } from '@/lib/client-logger';
import { NotePageContent } from '@/components/NotePageContent';
import { CanvasPageContent } from '@/components/canvas/CanvasPageContent';

type DocumentPageContentProps = {
  docId: string;
};

export function DocumentPageContent({ docId }: DocumentPageContentProps) {
  const [metadata, setMetadata] = useState<NoteMetadata | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getNoteMetadata(docId)
      .then((data) => {
        if (!isMounted) return;
        setMetadata(data);
        setIsLoading(false);
      })
      .catch((err) => {
        clientLogger.error('Failed to fetch document metadata', err);
        if (!isMounted) return;
        setMetadata(undefined);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [docId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading document...</p>
        </div>
      </main>
    );
  }

  if (!metadata) {
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
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const kind = metadata.kind ?? 'note';

  if (kind === 'canvas') {
    return <CanvasPageContent canvasId={docId} metadata={metadata} isMetadataLoading={false} />;
  }

  return <NotePageContent noteId={docId} metadata={metadata} isMetadataLoading={false} />;
}
