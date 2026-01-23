import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { CodeBlockVisual } from '@/lib/canvas/schemas-v2';

interface CodeBlockProps {
  visual: CodeBlockVisual;
}

export function CodeBlock({ visual }: CodeBlockProps) {
  const { code, language } = visual;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Silently fail
    }
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border border-stone-200 bg-stone-900">
      {/* Language badge + copy button */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-stone-800 border-b border-stone-700">
        <span className="text-xs font-mono text-stone-400 uppercase">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-stone-700 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-stone-400" />
          )}
        </button>
      </div>

      {/* Code content */}
      <pre className="p-3 overflow-x-auto text-sm font-mono text-stone-100 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
