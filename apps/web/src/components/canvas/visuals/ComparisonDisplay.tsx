import type { ComparisonVisual } from '@/lib/canvas/schemas-v2';

interface ComparisonDisplayProps {
  visual: ComparisonVisual;
}

export function ComparisonDisplay({ visual }: ComparisonDisplayProps) {
  const { left, right } = visual;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="border border-stone-200 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-stone-800 mb-2">{left.title}</h4>
        <ul className="space-y-1">
          {left.items.map((item, i) => (
            <li key={i} className="text-xs text-stone-700">
              • {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="border border-stone-200 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-stone-800 mb-2">{right.title}</h4>
        <ul className="space-y-1">
          {right.items.map((item, i) => (
            <li key={i} className="text-xs text-stone-700">
              • {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
