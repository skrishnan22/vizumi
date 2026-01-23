import { Quote as QuoteIcon } from 'lucide-react';
import type { QuoteVisual } from '@/lib/canvas/schemas-v2';

interface QuoteProps {
  visual: QuoteVisual;
}

export function Quote({ visual }: QuoteProps) {
  const { text, attribution } = visual;

  return (
    <div className="relative pl-4 py-2">
      {/* Quote icon */}
      <QuoteIcon className="absolute -left-1 -top-1 w-6 h-6 text-stone-200" />

      {/* Quote text */}
      <blockquote className="text-sm italic text-stone-700 leading-relaxed pl-2 border-l-4 border-teal-400">
        {text}
      </blockquote>

      {/* Attribution */}
      {attribution && (
        <p className="mt-2 text-xs text-stone-500 font-medium pl-2">— {attribution}</p>
      )}
    </div>
  );
}
