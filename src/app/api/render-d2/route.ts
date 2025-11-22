import { NextResponse } from 'next/server';
import { D2 } from '@terrastruct/d2';

const d2 = new D2();

const D2_THEMES = [
  // Yellow/Orange (Warm)
  `vars: { d2-config: { theme-id: 101 } }
*: { style: { stroke-width: 2; fill-pattern: lines; stroke: "#1e1e1e"; fill: "#ffec99" } }`,
  // Blue (Cool)
  `vars: { d2-config: { theme-id: 101 } }
*: { style: { stroke-width: 2; fill-pattern: lines; stroke: "#1e1e1e"; fill: "#a5d8ff" } }`,
  // Green (Nature)
  `vars: { d2-config: { theme-id: 101 } }
*: { style: { stroke-width: 2; fill-pattern: lines; stroke: "#1e1e1e"; fill: "#b2f2bb" } }`,
  // Red/Pink (Urgent)
  `vars: { d2-config: { theme-id: 101 } }
*: { style: { stroke-width: 2; fill-pattern: lines; stroke: "#1e1e1e"; fill: "#ffc9c9" } }`,
  // Purple (Mystic)
  `vars: { d2-config: { theme-id: 101 } }
*: { style: { stroke-width: 2; fill-pattern: lines; stroke: "#1e1e1e"; fill: "#e5dbff" } }`,
];

function extractD2ErrorMessage(error: unknown): string {
  const rawMessage =
    error instanceof Error ? error.message : 'Unknown rendering error';

  const tryParse = (text: string) => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const trimmed = rawMessage.trim();
  let parsed = tryParse(trimmed);

  if (!parsed) {
    const bracketIndex = trimmed.indexOf('[');
    if (bracketIndex !== -1) {
      parsed = tryParse(trimmed.slice(bracketIndex));
    }
  }

  if (Array.isArray(parsed)) {
    const formatted = parsed
      .map((item) => {
        if (item && typeof item === 'object') {
          if (typeof item.errmsg === 'string') {
            return item.errmsg;
          }
          if (typeof item.message === 'string') {
            return item.message;
          }
        }
        return JSON.stringify(item);
      })
      .filter(Boolean)
      .join(' ');

    if (formatted) {
      return `Unable to render diagram: ${formatted}`;
    }
  }

  return `Unable to render diagram: ${trimmed}`;
}

// Simple hash function to deterministically pick a theme based on code
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let code = '';
  let fullDiagramSource = '';

  try {
    const body = await req.json();
    code = body.code;

    if (typeof code !== 'string' || !code.trim()) {
      return NextResponse.json(
        { error: 'Diagram code is required.' },
        { status: 400 },
      );
    }

    // Pick a theme deterministically based on the code content
    // Same code = same color every time
    const themeIndex = hashCode(code.trim()) % D2_THEMES.length;
    const selectedTheme = D2_THEMES[themeIndex];
    fullDiagramSource = `${selectedTheme}\n\n${code.trim()}`;

    const compiled = await d2.compile(fullDiagramSource, {
      options: {
        sketch: true,
        themeID: 101,
        pad: 24,
      },
    });

    const svg = await d2.render(compiled.diagram, {
      ...compiled.renderOptions,
      sketch: true,
      themeID: 101,
      pad: 24,
      noXMLTag: true,
    });

    return NextResponse.json({ svg });
  } catch (error) {
    console.error('Failed to render D2 diagram', error);

    const message = extractD2ErrorMessage(error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
