import type { ReactNode } from 'react';
import Link from 'next/link';
import { type NoteMetadata } from '@/lib/db/noteMetadata';

type NoteHeaderProps = {
  metadata?: NoteMetadata;
  isLoading: boolean;
  actions?: ReactNode;
};

export function NoteHeader({ metadata, isLoading, actions }: NoteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 transition-all duration-300">
      <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            title="Back to Home"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>

          <div className="h-5 w-px bg-gray-300" />

          {isLoading ? (
            <div className="flex flex-col gap-1">
              <div className="h-5 w-64 bg-gray-100 rounded animate-pulse" />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <h1 className="text-base font-semibold text-gray-900 leading-tight truncate max-w-xl">
                {metadata?.title || 'Untitled Document'}
              </h1>
              {metadata?.url && (
                <a
                  href={metadata.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex text-sm text-gray-500 hover:text-gray-700 truncate max-w-xs transition-colors items-center gap-1"
                >
                  <span className="truncate">{new URL(metadata.url).hostname}</span>
                  <svg
                    className="w-3.5 h-3.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {actions}
          {metadata?.createdAt && (
            <span className="text-sm text-gray-600 px-3 py-1 rounded-md border border-gray-200 bg-gray-50">
              {new Date(metadata.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
