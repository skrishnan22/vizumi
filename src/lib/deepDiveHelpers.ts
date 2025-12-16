import { GraduationCap, GitBranch, Brain, Lightbulb, type LucideIcon } from 'lucide-react';

export type DeepDiveMode = 'eli5' | 'analogy' | 'mental-model';

export const MODE_ICONS: Record<string, LucideIcon> = {
  eli5: GraduationCap,
  analogy: GitBranch,
  'mental-model': Brain,
  default: Lightbulb,
};

export function getModeIcon(mode?: string): LucideIcon {
  return (mode && MODE_ICONS[mode]) || MODE_ICONS.default;
}

export function getModeTitle(mode?: DeepDiveMode): string {
  switch (mode) {
    case 'eli5':
      return 'ELI5';
    case 'analogy':
      return 'Analogy';
    case 'mental-model':
      return 'Mental Model';
    default:
      return 'Deep Dive';
  }
}

export const DEEP_DIVE_COLORS = {
  eli5: {
    bg: '#FFD6C9', // Richer peach
    border: '#FFAB91',
    text: '#5D4037',
    accent: '#D84315',
  },
  analogy: {
    bg: '#E3F2FD', // Sky blue
    border: '#90CAF9',
    text: '#0D47A1',
    accent: '#1976D2',
  },
  'mental-model': {
    bg: '#B2DFDB', // Richer mint
    border: '#80CBC4',
    text: '#004D40',
    accent: '#00796B',
  },
  default: {
    bg: '#FFF9E6',
    border: '#FFE5A0',
    text: '#664D00',
    accent: '#664D00',
  },
};

export function getDeepDiveColors(mode?: string) {
  return DEEP_DIVE_COLORS[mode as keyof typeof DEEP_DIVE_COLORS] || DEEP_DIVE_COLORS.default;
}

export function getDeepDiveAccent(mode?: DeepDiveMode): string {
  return getDeepDiveColors(mode).accent;
}
