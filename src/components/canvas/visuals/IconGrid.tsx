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
  // Tech/Development
  Terminal,
  Server,
  Cpu,
  GitBranch,
  Globe,
  Webhook,
  Package,
  Layers,
  // Security/Auth
  Key,
  Lock,
  Shield,
  // Actions
  Zap,
  Search,
  Link,
  Download,
  Upload,
  RefreshCw,
  // Organization
  Folder,
  Target,
  Filter,
  // Communication
  Mail,
  Calendar,
  Clock,
  Bot,
  Sparkles,
  Network,
} from 'lucide-react';
import type { IconGridVisual } from '@/lib/canvas/schemas-v2';

const ICON_MAP = {
  // Original icons
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
  // Tech/Development
  terminal: Terminal,
  server: Server,
  cpu: Cpu,
  'git-branch': GitBranch,
  globe: Globe,
  api: Webhook,
  package: Package,
  layers: Layers,
  // Security/Auth
  key: Key,
  lock: Lock,
  shield: Shield,
  // Actions
  zap: Zap,
  search: Search,
  link: Link,
  download: Download,
  upload: Upload,
  refresh: RefreshCw,
  // Organization
  folder: Folder,
  target: Target,
  filter: Filter,
  // Communication
  mail: Mail,
  calendar: Calendar,
  clock: Clock,
  bot: Bot,
  sparkles: Sparkles,
  network: Network,
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
