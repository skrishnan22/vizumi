'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CanvasBoard } from '@/components/canvas/CanvasBoard';
import { decodeSharePayload, type CanvasSharePayload } from '@/lib/canvas/share';

export default function SharedCanvasPage() {
  const [payload, setPayload] = useState<CanvasSharePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFromHash = () => {
      const hash = window.location.hash.replace(/^#/, '');

      if (!hash) {
        setError('Missing share data.');
        setPayload(null);
        return;
      }

      try {
        const decoded = decodeSharePayload(hash);
        setPayload(decoded);
        setError(null);
      } catch {
        setError('Invalid or corrupted share link.');
        setPayload(null);
      }
    };

    loadFromHash();
    window.addEventListener('hashchange', loadFromHash);
    return () => window.removeEventListener('hashchange', loadFromHash);
  }, []);

  if (error) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center bg-white border border-stone-200 rounded-2xl p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-stone-900 mb-3">Share link error</h1>
          <p className="text-sm text-stone-600 mb-6">{error}</p>
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

  if (!payload) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-stone-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-600">Loading canvas...</p>
        </div>
      </main>
    );
  }

  return (
    <section className="w-full min-h-screen relative overflow-hidden bg-stone-50 flex flex-col">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[80px] opacity-40 bg-gradient-to-br from-teal-500/15 to-emerald-500/10 -top-[200px] -right-[100px]" />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[80px] opacity-40 bg-gradient-to-br from-orange-500/8 to-orange-400/6 -bottom-[150px] -left-[100px]" />
      </div>

      <div className="fixed top-6 left-6 z-50">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-stone-600 font-medium text-sm hover:border-teal-300 hover:text-stone-900 transition-all shadow-sm"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span>Home</span>
        </Link>
      </div>

      <header className="w-full max-w-[900px] mx-auto px-6 pt-8 pb-4 text-center z-30">
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight mb-2">
          {payload.title || 'Visual Canvas'}
        </h1>
        <a
          href={payload.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-mono text-xs text-stone-500 bg-stone-100 px-3 py-1.5 rounded-md hover:bg-stone-200 hover:text-teal-600 transition-colors truncate max-w-full"
        >
          {payload.url}
        </a>
      </header>

      <div
        className="w-full relative"
        style={{ height: 'calc(100vh - 120px)', minHeight: '500px' }}
      >
        <CanvasBoard
          cards={payload.cards}
          edges={payload.edges}
          layoutType={payload.layoutType}
          isLoading={false}
          showSkeletonCard={false}
        />
      </div>
    </section>
  );
}
