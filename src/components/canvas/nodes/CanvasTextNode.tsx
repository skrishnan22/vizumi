'use client';

import { memo } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import ReactMarkdown from 'react-markdown';
import type { TextNodeData } from '@/lib/canvas/schemas';

export type CanvasTextNodeData = {
  nodeData: TextNodeData;
};

function CanvasTextNodeComponent({ data, selected }: NodeProps<CanvasTextNodeData>) {
  const nodeData = data?.nodeData;
  const { content, title } = nodeData || {};

  return (
    <>
      <Handle type="target" position={Position.Top} id="top" className="!w-3 !h-3 !bg-teal-500" />
      <Handle type="target" position={Position.Left} id="left" className="!w-3 !h-3 !bg-teal-500" />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-3 !h-3 !bg-teal-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !bg-teal-500"
      />

      <div
        className={`
          h-full overflow-hidden rounded-xl border-2 shadow-lg bg-white
          transition-all duration-200
          ${selected ? 'border-teal-500 shadow-teal-500/20' : 'border-stone-200'}
        `}
      >
        {title && (
          <div className="px-4 py-2 border-b border-stone-100 bg-stone-50/50">
            <h3 className="font-semibold text-stone-800 text-sm truncate">{title}</h3>
          </div>
        )}

        <div className="p-4 overflow-auto h-full">
          <div className="prose prose-sm prose-stone max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 text-stone-700 leading-relaxed">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="text-stone-900 font-semibold">{children}</strong>
                ),
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
              }}
            >
              {content || ''}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </>
  );
}

export const CanvasTextNode = memo(CanvasTextNodeComponent);
