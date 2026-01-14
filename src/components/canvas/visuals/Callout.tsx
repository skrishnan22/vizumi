import { Info, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import type { CalloutSection } from '@/lib/canvas/schemas-v2';

interface CalloutProps {
  section: CalloutSection;
}

const CALLOUT_STYLES = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    Icon: Info,
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    Icon: AlertTriangle,
  },
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    Icon: CheckCircle,
  },
  tip: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    Icon: Lightbulb,
  },
};

export function Callout({ section }: CalloutProps) {
  const {
    bg,
    border,
    text: textColor,
    Icon,
  } = CALLOUT_STYLES[section.style] || CALLOUT_STYLES.info;

  return (
    <div className={`flex gap-2 p-3 rounded-lg border ${bg} ${border}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 ${textColor}`} />
      <span className={`text-sm ${textColor}`}>{section.text}</span>
    </div>
  );
}
