import type { TimelineVisual } from '@/lib/canvas/schemas-v2';

interface TimelineProps {
  visual: TimelineVisual;
}

export function Timeline({ visual }: TimelineProps) {
  const { events } = visual;

  return (
    <div className="relative pl-6 space-y-4">
      {/* Vertical line */}
      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-teal-400 via-teal-500 to-teal-600" />

      {events.map((event, i) => (
        <div key={i} className="relative">
          {/* Dot */}
          <div className="absolute -left-[18px] top-1.5 w-3 h-3 rounded-full bg-teal-500 border-2 border-white shadow-sm" />

          {/* Content */}
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">
              {event.date}
            </span>
            <span className="text-sm font-medium text-stone-800">{event.title}</span>
            {event.description && (
              <span className="text-xs text-stone-500">{event.description}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
