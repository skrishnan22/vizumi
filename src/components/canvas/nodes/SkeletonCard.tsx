'use client';

import { memo } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';

function SkeletonCardComponent({ selected }: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} id="top" className="!opacity-0" />
      <Handle type="target" position={Position.Left} id="left" className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!opacity-0" />
      <Handle type="source" position={Position.Right} id="right" className="!opacity-0" />

      <div
        className={`
          h-full rounded-xl border-2 shadow-lg overflow-hidden
          bg-white border-stone-200
          ${selected ? 'ring-2 ring-teal-500 ring-offset-2' : ''}
        `}
        style={{ width: 340, minHeight: 200 }}
      >
        {/* Skeleton Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-stone-200 to-stone-300 animate-pulse">
          <div className="h-5 w-32 bg-stone-400/50 rounded" />
        </div>

        {/* Skeleton Content */}
        <div className="p-4 space-y-4">
          {/* Shimmer lines */}
          <div className="space-y-2 animate-pulse">
            <div className="h-3 w-full bg-stone-200 rounded" />
            <div className="h-3 w-4/5 bg-stone-200 rounded" />
            <div className="h-3 w-3/5 bg-stone-200 rounded" />
          </div>

          {/* Visual placeholder */}
          <div className="h-16 w-full bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 rounded-lg animate-pulse" />

          {/* More shimmer lines */}
          <div className="space-y-2 animate-pulse">
            <div className="h-3 w-full bg-stone-200 rounded" />
            <div className="h-3 w-2/3 bg-stone-200 rounded" />
          </div>
        </div>

        {/* Loading indicator */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-stone-300 border-t-teal-500 rounded-full animate-spin" />
          <span className="text-xs text-stone-400 font-medium">Loading...</span>
        </div>
      </div>
    </>
  );
}

export const SkeletonCard = memo(SkeletonCardComponent);
