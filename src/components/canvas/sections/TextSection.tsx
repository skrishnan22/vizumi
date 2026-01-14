import ReactMarkdown from 'react-markdown';
import type { TextSection as TextSectionType } from '@/lib/canvas/schemas-v2';

interface TextSectionProps {
  section: TextSectionType;
}

export function TextSection({ section }: TextSectionProps) {
  const { content } = section;

  return (
    <div className="text-sm text-stone-700 prose prose-sm prose-stone max-w-none">
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 text-stone-700 leading-relaxed">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="text-stone-900 font-semibold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-stone-700">{children}</em>,
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
          ),
          li: ({ children }) => <li className="text-stone-700">{children}</li>,
          code: ({ children }) => (
            <code className="bg-stone-100 px-1.5 py-0.5 rounded text-sm font-mono text-teal-700">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-stone-100 p-3 rounded-lg overflow-x-auto text-sm font-mono text-stone-800 mb-2">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-teal-600 hover:text-teal-700 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-stone-300 pl-3 italic text-stone-600 mb-2">
              {children}
            </blockquote>
          ),
        }}
      >
        {content || ''}
      </ReactMarkdown>
    </div>
  );
}
