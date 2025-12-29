import type { StatsVisual } from '@/lib/canvas/schemas-v2';

interface StatsDisplayProps {
  visual: StatsVisual;
}

export function StatsDisplay({ visual }: StatsDisplayProps) {
  const { items } = visual;

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="text-center p-3 bg-gradient-to-br from-teal-50 to-emerald-50 rounded border border-teal-200"
        >
          <div className="text-2xl font-bold text-teal-700">{item.value}</div>
          <div className="text-xs text-teal-600 mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
