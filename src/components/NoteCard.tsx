'use client';

import Image from 'next/image';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

type NoteCardProps = {
  noteId: string;
  title: string;
  url: string;
  ogImage?: string;
  updatedAt: Date;
  onClick: () => void;
};

// Generate a consistent gradient based on the title
function getGradientForTitle(title: string): string {
  const gradients = [
    'from-blue-400 via-blue-500 to-indigo-600',
    'from-purple-400 via-pink-500 to-red-500',
    'from-green-400 via-emerald-500 to-teal-600',
    'from-orange-400 via-amber-500 to-yellow-500',
    'from-cyan-400 via-sky-500 to-blue-600',
    'from-fuchsia-400 via-purple-500 to-violet-600',
    'from-rose-400 via-pink-500 to-fuchsia-600',
    'from-indigo-400 via-blue-500 to-cyan-600',
  ];

  // Use title to consistently pick a gradient
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length]
}

export function NoteCard({
  noteId,
  title,
  url,
  ogImage,
  updatedAt,
  onClick
}: NoteCardProps) {
  const [imageError, setImageError] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(updatedAt), { addSuffix: true });

  const domain = new URL(url).hostname.replace('www.', '');

  const firstLetter = title.charAt(0).toUpperCase();
  const gradient = getGradientForTitle(title);

  const showFallback = !ogImage || imageError;

  // Unique pattern ID for this card
  const patternId = `pattern-${noteId}`;

  return (
    <button
      onClick={onClick}
      className="w-full group bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer text-left overflow-hidden"
    >
      <div className="flex items-start gap-5">
        {/* OG Image or Fallback */}
        <div className="flex-shrink-0">
          {showFallback ? (
            <div className={`w-32 h-32 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow relative overflow-hidden`}>
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <pattern id={patternId} width="10" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="5" cy="5" r="1" fill="white" />
                  </pattern>
                  <rect width="100" height="100" fill={`url(#${patternId})`} />
                </svg>
              </div>

              {/* First letter */}
              <span className="text-5xl font-bold text-white z-10 drop-shadow-lg">
                {firstLetter}
              </span>

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ) : (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
              <Image
                src={ogImage}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
                unoptimized
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-1">
          <h3 className="font-bold text-gray-900 text-xl mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="truncate font-medium">{domain}</span>
          </div>

          {/* Timestamp Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-600 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {timeAgo}
          </div>
        </div>

        {/* Arrow Icon */}
        <div className="flex-shrink-0 self-center">
          <svg
            className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}
