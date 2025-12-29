import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { CardSection } from '../sections/CardSection';
import type { ProcessedCard } from '@/lib/canvas/schemas-v2';

interface WhiteboardCardProps {
  id: string;
  data: ProcessedCard;
  selected: boolean;
}

function WhiteboardCardComponent({ data, selected }: WhiteboardCardProps) {
  const { title, sections, theme } = data;

  return (
    <>
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />

      <div
        className={`
        h-full rounded-xl border-2 shadow-lg overflow-hidden
        ${theme?.body || 'bg-white'} ${theme?.border || 'border-slate-200'}
        ${selected ? 'ring-2 ring-teal-500 ring-offset-2' : ''}
      `}
      >
        <div
          className={`px-4 py-3 ${theme?.header || 'bg-slate-800'} ${
            theme?.headerText || 'text-white'
          }`}
        >
          <h3 className="font-bold text-base leading-tight">{title}</h3>
        </div>

        <div className="p-4 space-y-3 overflow-auto" style={{ maxHeight: 'calc(100% - 60px)' }}>
          {sections.map((section, i) => (
            <CardSection key={i} section={section} />
          ))}
        </div>
      </div>
    </>
  );
}

export const WhiteboardCard = memo(WhiteboardCardComponent);
