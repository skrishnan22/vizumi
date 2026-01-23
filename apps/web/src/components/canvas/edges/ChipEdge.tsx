import { memo } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

function ChipEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={2}
        stroke="#94a3b8"
        fill="none"
        markerEnd={markerEnd}
      />
      {label && (
        <foreignObject
          x={labelX - 60}
          y={labelY - 14}
          width={120}
          height={28}
          className="overflow-visible"
        >
          <div className="flex justify-center">
            <span className="px-2.5 py-1 bg-white border border-slate-300 rounded-full text-xs text-slate-600 font-medium shadow-sm whitespace-nowrap">
              {label}
            </span>
          </div>
        </foreignObject>
      )}
    </>
  );
}

export const ChipEdge = memo(ChipEdgeComponent);
