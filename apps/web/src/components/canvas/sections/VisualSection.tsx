import { IconGrid } from '../visuals/IconGrid';
import { InlineFlow } from '../visuals/InlineFlow';
import { AnnotatedList } from '../visuals/AnnotatedList';
import { StatsDisplay } from '../visuals/StatsDisplay';
import { ComparisonDisplay } from '../visuals/ComparisonDisplay';
import { Timeline } from '../visuals/Timeline';
import { TableDisplay } from '../visuals/TableDisplay';
import { Quote } from '../visuals/Quote';
import { CodeBlock } from '../visuals/CodeBlock';
import { TagCloud } from '../visuals/TagCloud';
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
    case 'timeline':
      return <Timeline visual={section} />;
    case 'table':
      return <TableDisplay visual={section} />;
    case 'quote':
      return <Quote visual={section} />;
    case 'code-block':
      return <CodeBlock visual={section} />;
    case 'tags':
      return <TagCloud visual={section} />;
    default:
      return null;
  }
}
