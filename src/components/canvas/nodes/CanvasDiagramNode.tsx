'use client';

import { memo } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { DiagramRenderer } from '@/components/DiagramRenderer';
import type { DiagramNodeData } from '@/lib/canvas/schemas';

export type CanvasDiagramNodeData = {
  nodeData: DiagramNodeData;
};

function CanvasDiagramNodeComponent({ data, selected }: NodeProps<CanvasDiagramNodeData>) {
  const nodeData = data?.nodeData;
  const { d2Code, title } = nodeData || {};

  return (
    <>
      <Handle type="target" position={Position.Top} id="top" className="!w-3 !h-3 !bg-purple-500" />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-3 !h-3 !bg-purple-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-3 !h-3 !bg-purple-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !bg-purple-500"
      />

      <div
        className={`
          h-full overflow-hidden rounded-xl border-2 shadow-lg bg-white
          transition-all duration-200
          ${selected ? 'border-purple-500 shadow-purple-500/20' : 'border-stone-200'}
        `}
      >
        {title && (
          <div className="px-4 py-2 border-b border-stone-100 bg-purple-50/50">
            <h3 className="font-semibold text-purple-800 text-sm truncate">{title}</h3>
          </div>
        )}

        <div className="p-3 h-full flex items-center justify-center overflow-hidden">
          {d2Code && <DiagramRenderer code={d2Code} />}
        </div>
      </div>
    </>
  );
}

export const CanvasDiagramNode = memo(CanvasDiagramNodeComponent);
