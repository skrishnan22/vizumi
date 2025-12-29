import type { CardNode, CanvasEdge, ProcessedCard, ColorTheme } from './schemas-v2';

const COLOR_THEMES: ColorTheme[] = [
  {
    header: 'bg-slate-800',
    headerText: 'text-white',
    body: 'bg-white',
    border: 'border-slate-200',
  },
  {
    header: 'bg-teal-600',
    headerText: 'text-white',
    body: 'bg-teal-50',
    border: 'border-teal-200',
  },
  {
    header: 'bg-purple-600',
    headerText: 'text-white',
    body: 'bg-purple-50',
    border: 'border-purple-200',
  },
  {
    header: 'bg-amber-500',
    headerText: 'text-white',
    body: 'bg-amber-50',
    border: 'border-amber-200',
  },
  {
    header: 'bg-blue-600',
    headerText: 'text-white',
    body: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    header: 'bg-rose-600',
    headerText: 'text-white',
    body: 'bg-rose-50',
    border: 'border-rose-200',
  },
  {
    header: 'bg-emerald-600',
    headerText: 'text-white',
    body: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  {
    header: 'bg-indigo-600',
    headerText: 'text-white',
    body: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
];

const VISUAL_HEIGHTS: Record<string, number> = {
  'icon-grid': 120,
  flow: 80,
  list: 150,
  stats: 60,
  comparison: 200,
};

export function assignColors(cards: CardNode[]): ProcessedCard[] {
  return cards.map((card, i) => ({
    ...card,
    theme: COLOR_THEMES[i % COLOR_THEMES.length],
  }));
}

function calculateCardSize(card: CardNode): { width: number; height: number } {
  const baseHeight = 60;
  let contentHeight = 0;

  for (const section of card.sections) {
    if (section.type === 'text') {
      const lines = Math.ceil(section.content.length / 80);
      contentHeight += lines * 25 + 20;
    } else if (section.type === 'visual') {
      contentHeight += VISUAL_HEIGHTS[section.visualType] || 100;
    } else if (section.type === 'callout') {
      contentHeight += 60;
    }
  }

  const height = Math.min(baseHeight + contentHeight + 40, 600);

  return {
    width: card.sections.some((s) => s.type === 'visual') ? 420 : 340,
    height,
  };
}

export function calculateSizes(cards: ProcessedCard[]): ProcessedCard[] {
  return cards.map((card) => {
    const size = calculateCardSize(card);
    return {
      ...card,
      width: size.width,
      height: size.height,
    };
  });
}

export function validateEdges(edges: CanvasEdge[], cardIds: Set<string>): CanvasEdge[] {
  return edges.filter((edge) => cardIds.has(edge.source) && cardIds.has(edge.target));
}

export function postProcessCards(
  cards: CardNode[],
  edges: CanvasEdge[]
): {
  cards: ProcessedCard[];
  edges: CanvasEdge[];
} {
  const cardIds = new Set(cards.map((c) => c.id));
  const coloredCards = assignColors(cards);
  const sizedCards = calculateSizes(coloredCards);
  const validEdges = validateEdges(edges, cardIds);

  return {
    cards: sizedCards,
    edges: validEdges,
  };
}
