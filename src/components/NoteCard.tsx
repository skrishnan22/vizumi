'use client';

import Image from 'next/image';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

type NoteCardProps = {
  title: string;
  url: string;
  ogImage?: string;
  updatedAt: Date;
  onClick: () => void;
  onDelete: () => void;
};

// Generate a consistent vibrant gradient based on the title
function getGradientForTitle(title: string): string {
  const gradients = [
    'from-orange-100 via-rose-200 to-red-200', // Sunset
    'from-cyan-100 via-teal-200 to-emerald-200', // Ocean (matches new theme)
    'from-yellow-100 via-lime-200 to-green-200', // Lemon
    'from-sky-100 via-blue-200 to-indigo-200', // Sky
    'from-sky-100 via-blue-200 to-indigo-200', // Sky
  ];
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

export function NoteCard({ title, url, ogImage, updatedAt, onClick, onDelete }: NoteCardProps) {
  const [imageError, setImageError] = useState(false);
  const timeAgo = formatDistanceToNow(new Date(updatedAt), { addSuffix: true });
  const domain = new URL(url).hostname.replace('www.', '');
  const gradient = getGradientForTitle(title);
  const showFallback = !ogImage || imageError;

  return (
    <div className="group relative flex flex-col w-full h-full bg-white border border-gray-200/60 rounded-3xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-gray-300 hover:-translate-y-1 transition-all duration-300">
      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
        aria-label="Delete note"
        data-testid="delete-note-button"
      >
        <svg
          className="w-4 h-4 text-gray-600 hover:text-red-600 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>

      {/* Card Content - Now clickable */}
      <button
        onClick={onClick}
        className="flex flex-col w-full h-full text-left"
        data-testid="note-card"
      >
        {/* Card Image Area */}
        <div className="relative w-full h-48 overflow-hidden bg-gray-50 border-b border-gray-100">
        {showFallback ? (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} p-6 relative`}>
            {/* Abstract Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-10 mix-blend-overlay"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '16px 16px',
              }}
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/40 group-hover:scale-110 transition-transform duration-500">
                <svg
                  className="w-8 h-8 text-gray-700 opacity-80"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <Image
            src={ogImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={() => setImageError(true)}
            unoptimized
          />
        )}

        {/* Subtle inner shadow top */}
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-t-3xl pointer-events-none" />
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 p-6">
        <h3 className="font-bold text-zinc-700 text-lg tracking-tight leading-snug mb-3 line-clamp-2">
          <span className="bg-gradient-to-r from-yellow-300 to-yellow-300 bg-[length:0%_6px] bg-no-repeat bg-left-bottom group-hover:bg-[length:100%_6px] transition-all duration-300 box-decoration-clone">
            {title}
          </span>
        </h3>

        <div className="mt-auto pt-4 flex items-center justify-between text-sm text-gray-500 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-400 truncate max-w-[120px]">{domain}</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1.5 rounded-full transition-colors bg-blue-50 text-blue-700">
            {timeAgo}
          </span>
        </div>
      </div>
      </button>
    </div>
  );
}
