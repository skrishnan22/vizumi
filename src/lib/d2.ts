import { D2 } from '@terrastruct/d2';
import { D2_CONFIG, D2_THEME_COLORS } from './constants';

const d2 = new D2();

// Generate D2 theme strings from constants
const D2_THEMES = D2_THEME_COLORS.map(
  (color) =>
    `vars: { d2-config: { theme-id: ${D2_CONFIG.THEME_ID} } }
*: { style: { stroke-width: ${D2_CONFIG.STROKE_WIDTH}; fill-pattern: ${D2_CONFIG.FILL_PATTERN}; stroke: "${D2_CONFIG.STROKE_COLOR}"; fill: "${color}" } }`
);

export type D2RenderSuccess = {
  ok: true;
  svg: string;
  themeIndex: number;
  diagramSource: string;
};

export type D2RenderError = {
  ok: false;
  error: string;
  details?: string;
};

export function extractD2ErrorMessage(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message : 'Unknown rendering error';

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

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export async function renderD2ToSvg(code: string): Promise<D2RenderSuccess | D2RenderError> {
  try {
    const trimmed = code?.trim();
    if (!trimmed) {
      return { ok: false, error: 'Diagram code is required.' };
    }

    const themeIndex = hashCode(trimmed) % D2_THEMES.length;
    const selectedTheme = D2_THEMES[themeIndex];
    const diagramSource = `${selectedTheme}\n\n${trimmed}`;

    const compiled = await d2.compile(diagramSource, {
      options: {
        sketch: D2_CONFIG.SKETCH_MODE,
        themeID: D2_CONFIG.THEME_ID,
        pad: D2_CONFIG.PADDING,
      },
    });

    const svg = await d2.render(compiled.diagram, {
      ...compiled.renderOptions,
      sketch: D2_CONFIG.SKETCH_MODE,
      themeID: D2_CONFIG.THEME_ID,
      pad: D2_CONFIG.PADDING,
      noXMLTag: D2_CONFIG.NO_XML_TAG,
    });

    return {
      ok: true,
      svg,
      themeIndex,
      diagramSource,
    };
  } catch (error) {
    return {
      ok: false,
      error: extractD2ErrorMessage(error),
      details:
        error instanceof Error
          ? error.stack || error.message
          : typeof error === 'string'
            ? error
            : undefined,
    };
  }
}
