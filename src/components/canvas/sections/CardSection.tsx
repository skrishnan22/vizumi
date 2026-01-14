import { TextSection } from './TextSection';
import { VisualSection } from './VisualSection';
import { CalloutSectionWrapper } from './CalloutSection';
import type { Section } from '@/lib/canvas/schemas-v2';

interface CardSectionProps {
  section: Section;
}

export function CardSection({ section }: CardSectionProps) {
  switch (section.type) {
    case 'text':
      return <TextSection section={section} />;
    case 'visual':
      return <VisualSection section={section} />;
    case 'callout':
      return <CalloutSectionWrapper section={section} />;
    default:
      return null;
  }
}
