'use client';

import Link from 'next/link';
import { NotesList } from '@/components/NotesList';
import { HeroAnimation } from '@/components/HeroAnimation';
import { Settings } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 selection:bg-yellow-200 font-sans">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Top Navigation */}
        <div className="flex justify-end mb-8">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>

        <header className="flex flex-col md:flex-row items-center justify-between gap-12 mb-24">
          <div className="max-w-2xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-800 text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
              </span>
              AI-Powered Visual Learning
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-8 leading-[1.1]">
              Transform Reading into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-700">
                Visual Understanding
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-xl">
              Turn any dense article into an interactive study board. Visualize concepts, map
              connections, and master new topics faster than ever.
            </p>

            <Link
              href="/new"
              className="group inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-gray-200 ring-2 ring-transparent hover:ring-gray-200"
            >
              <svg
                className="w-5 h-5 group-hover:rotate-90 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Note
            </Link>
          </div>

          {/* Hero Animation Section */}
          <div className="relative w-full max-w-xl hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-100/40 to-white/40 blur-3xl rounded-full" />
            <HeroAnimation />
          </div>
        </header>

        <section>
          <div className="flex items-end justify-between mb-8 border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Your Library</h2>
          </div>
          <NotesList />
        </section>
      </div>
    </main>
  );
}
