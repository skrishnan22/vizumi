import type { TextSection } from '@/lib/canvas/schemas-v2';

interface TextSectionProps {
  section: TextSection;
}

export function TextSection({ section }: TextSectionProps) {
  const { content } = section;

  return (
    <div className="text-sm text-stone-700 prose prose-sm prose-stone max-w-none">
      {content.split('\n').map((paragraph, i) => {
        if (paragraph.trim() === '') return null;
        return (
          <p key={i} className="mb-2 last:mb-0">
            {paragraph}
          </p>
        );
      })}
    </div>
  );
}
