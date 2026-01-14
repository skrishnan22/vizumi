'use client';

import { memo } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import type { ShapeNodeData } from '@/lib/canvas/schemas';

export type CanvasShapeNodeData = {
  nodeData: ShapeNodeData;
};

const shapeStyles: Record<string, string> = {
  rectangle: 'rounded-md',
  'rounded-rect': 'rounded-xl',
  circle: 'rounded-full',
  diamond: 'rotate-45',
  callout: 'rounded-xl rounded-bl-none',
  'sticky-note': 'rounded-sm shadow-md',
};

const colorSchemes: Record<string, { bg: string; border: string; text: string }> = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800' },
  green: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-800' },
  red: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-800' },
  gray: { bg: 'bg-stone-100', border: 'border-stone-300', text: 'text-stone-700' },
};

function CanvasShapeNodeComponent({ data, selected }: NodeProps<CanvasShapeNodeData>) {
  const nodeData = data?.nodeData;
  const { shapeType = 'rectangle', text, color = 'yellow' } = nodeData || {};

  const baseShapeStyle = shapeStyles[shapeType] || shapeStyles['rectangle'];
  const colorScheme = colorSchemes[color] || colorSchemes['yellow'];
  const isDiamond = shapeType === 'diamond';

  return (
    <>
      <Handle type="target" position={Position.Top} id="top" className="!w-2 !h-2 !bg-stone-400" />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2 !h-2 !bg-stone-400"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-2 !h-2 !bg-stone-400"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2 !h-2 !bg-stone-400"
      />

      <div
        className={`
          h-full w-full flex items-center justify-center p-3
          border-2 transition-all duration-200
          ${baseShapeStyle}
          ${colorScheme.bg} ${colorScheme.border}
          ${selected ? 'ring-2 ring-offset-2 ring-teal-500' : ''}
        `}
      >
        {text && (
          <span
            className={`
              text-sm font-medium text-center leading-tight
              ${isDiamond ? '-rotate-45' : ''}
              ${colorScheme.text}
            `}
          >
            {text}
          </span>
        )}
      </div>
    </>
  );
}

export const CanvasShapeNode = memo(CanvasShapeNodeComponent);
