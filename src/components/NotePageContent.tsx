'use client';

import { NoteBoard } from './NoteBoard';
import { useNoteDoc } from '@/hooks/useNoteDoc';
import Link from 'next/link';
import { ErrorBoundary } from 'react-error-boundary';
import { toast } from 'sonner';
import { ErrorFallback } from './ErrorFallback';
import { clientLogger } from '@/lib/client-logger';

type NotePageContentProps = {
  noteId: string;
};

export function NotePageContent({ noteId }: NotePageContentProps) {
  const { isLoading } = useNoteDoc(noteId);

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
    <main className="min-h-screen bg-white">
      {/* Home button */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="font-medium text-gray-700">Home</span>
        </Link>
      </div>

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
  );
}
