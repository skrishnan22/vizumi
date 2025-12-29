import { Callout } from '../visuals/Callout';
import type { CalloutSection } from '@/lib/canvas/schemas-v2';

interface CalloutSectionProps {
  section: CalloutSection;
}

export function CalloutSectionWrapper({ section }: CalloutSectionProps) {
  return <Callout section={section} />;
}
