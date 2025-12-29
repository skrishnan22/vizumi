import type { AnnotatedListVisual } from '@/lib/canvas/schemas-v2';

interface AnnotatedListProps {
  visual: AnnotatedListVisual;
}

export function AnnotatedList({ visual }: AnnotatedListProps) {
  const { items } = visual;

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div
            className={`
            w-4 h-4 mt-0.5 border-2 rounded-sm flex-shrink-0
            ${
              item.marker === 'box-filled'
                ? 'bg-purple-500 border-purple-500'
                : item.marker === 'circle'
                  ? 'rounded-full border-purple-500'
                  : 'border-purple-500'
            }
          `}
          />
          <span className="flex-1 text-sm text-stone-700">{item.text}</span>
          {item.annotation && (
            <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded font-mono">
              {item.annotation}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
