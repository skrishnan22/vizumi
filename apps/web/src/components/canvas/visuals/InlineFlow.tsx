import { ArrowRight, ArrowDown } from 'lucide-react';
import type { FlowVisual } from '@/lib/canvas/schemas-v2';

interface InlineFlowProps {
  visual: FlowVisual;
}

export function InlineFlow({ visual }: InlineFlowProps) {
  const { items, direction = 'horizontal' } = visual;
  const isHorizontal = direction === 'horizontal';

  return (
    <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} items-center gap-2`}>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-white border-2 border-stone-300 rounded text-sm font-medium text-stone-700">
            {item}
          </div>
          {i < items.length - 1 &&
            (isHorizontal ? (
              <ArrowRight className="w-4 h-4 text-stone-400" />
            ) : (
              <ArrowDown className="w-4 h-4 text-stone-400" />
            ))}
        </div>
      ))}
    </div>
  );
}
