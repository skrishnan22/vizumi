import { IconGrid } from '../visuals/IconGrid';
import { InlineFlow } from '../visuals/InlineFlow';
import { AnnotatedList } from '../visuals/AnnotatedList';
import { StatsDisplay } from '../visuals/StatsDisplay';
import { ComparisonDisplay } from '../visuals/ComparisonDisplay';
import type { VisualSection } from '@/lib/canvas/schemas-v2';

interface VisualSectionProps {
  section: VisualSection;
}

export function VisualSection({ section }: VisualSectionProps) {
  switch (section.visualType) {
    case 'icon-grid':
      return <IconGrid visual={section} />;
    case 'flow':
      return <InlineFlow visual={section} />;
    case 'list':
      return <AnnotatedList visual={section} />;
    case 'stats':
      return <StatsDisplay visual={section} />;
    case 'comparison':
      return <ComparisonDisplay visual={section} />;
    default:
      return null;
  }
}
