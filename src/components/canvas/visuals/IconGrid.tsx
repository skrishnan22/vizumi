import {
  FileText,
  Image,
  Music,
  Video,
  Code,
  Database,
  Cloud,
  User,
  Settings,
  BarChart,
} from 'lucide-react';
import type { IconGridVisual } from '@/lib/canvas/schemas-v2';

const ICON_MAP = {
  document: FileText,
  image: Image,
  audio: Music,
  video: Video,
  code: Code,
  database: Database,
  cloud: Cloud,
  user: User,
  settings: Settings,
  chart: BarChart,
};

interface IconGridProps {
  visual: IconGridVisual;
}

export function IconGrid({ visual }: IconGridProps) {
  const { items, columns = 3 } = visual;

  return (
    <div className={`grid grid-cols-${columns} gap-2`}>
      {items.map((item, i) => {
        const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP] || FileText;
        return (
          <div
            key={i}
            className="flex flex-col items-center p-2 bg-stone-100 rounded border border-stone-200"
          >
            <Icon className="w-6 h-6 text-stone-600" />
            <span className="text-xs mt-1 text-stone-700 text-center">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
