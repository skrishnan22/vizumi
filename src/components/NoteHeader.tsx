import Link from 'next/link';
import { type NoteMetadata } from '@/lib/db/noteMetadata';

type NoteHeaderProps = {
    metadata?: NoteMetadata;
    isLoading: boolean;
};

export function NoteHeader({ metadata, isLoading }: NoteHeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full bg-header backdrop-blur-sm border-b border-gray-200/60 shadow-sm transition-all duration-300 mb-4">
            <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="group flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 hover:border-vibrant-orange hover:text-vibrant-orange transition-colors"
                        title="Back to Home"
                    >
                        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>

                    <div className="h-4 w-px bg-gray-200 mx-1" />

                    {isLoading ? (
                        <div className="flex flex-col gap-1">
                            <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                        </div>
                    ) : (
                        <div className="flex items-baseline gap-3">
                            <h1 className="text-base font-bold text-[var(--primary-text)] leading-tight truncate max-w-xl">
                                {metadata?.title || 'Untitled Note'}
                            </h1>
                            {metadata?.url && (
                                <a
                                    href={metadata.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hidden md:flex text-xs text-[var(--link-color)] hover:text-vibrant-teal truncate max-w-xs transition-colors items-center gap-1 font-medium"
                                >
                                    <span className="truncate">{new URL(metadata.url).hostname}</span>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {metadata?.createdAt && (
                        <span className="text-xs font-semibold text-[var(--chip-text)] bg-[var(--chip-bg)] px-3 py-1 rounded-full border border-blue-200 shadow-sm">
                            {new Date(metadata.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    )}
                </div>
            </div>
        </header>
    );
}
