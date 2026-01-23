import type { TagsVisual } from '@/lib/canvas/schemas-v2';

interface TagCloudProps {
  visual: TagsVisual;
}

// Color palette for colored variant
const TAG_COLORS = [
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-orange-100 text-orange-700 border-orange-200',
];

export function TagCloud({ visual }: TagCloudProps) {
  const { tags, variant = 'default' } = visual;

  const getTagStyle = (index: number) => {
    switch (variant) {
      case 'outline':
        return 'bg-white text-stone-600 border-stone-300 hover:border-teal-400 hover:text-teal-600';
      case 'colored':
        return TAG_COLORS[index % TAG_COLORS.length];
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, i) => (
        <span
          key={i}
          className={`
            inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
            transition-colors cursor-default
            ${getTagStyle(i)}
          `}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
