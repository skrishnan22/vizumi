'use client';

import { useMemo, useEffect } from 'react';
import useSWR from 'swr';
import parse, { domToReact, type DOMNode, type HTMLReactParserOptions } from 'html-react-parser';
import type { Element } from 'domhandler';

type DiagramRendererProps = {
  code: string;
  className?: string;
  onError?: () => void;
  onSuccess?: () => void;
};

function normalizeAttributes(attribs: Record<string, string> = {}) {
  return Object.entries(attribs).reduce<Record<string, string>>((acc, [key, value]) => {
    if (key === 'class') {
      acc.className = value;
      return acc;
    }

    if (key.includes(':')) {
      const parts = key.split(':').filter(Boolean);
      if (parts.length) {
        const normalizedKey = parts
          .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
          .join('');
        acc[normalizedKey] = value;
        return acc;
      }
    }

    acc[key] = value;
    return acc;
  }, {});
}

async function fetchDiagramSvg(diagramCode: string) {
  const response = await fetch('/api/render-d2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: diagramCode }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      typeof payload?.error === 'string'
        ? payload.error
        : 'Server failed to render this diagram.';
    throw new Error(message);
  }

  const data = (await response.json()) as { svg?: string };
  if (!data.svg) {
    throw new Error('Diagram renderer did not return SVG output.');
  }

  return data.svg;
}

function StatusMessage({ message }: { message: string }) {
  return (
    <p
      style={{
        fontSize: '0.9rem',
        textAlign: 'center',
        margin: 0,
        color: 'rgba(28, 26, 23, 0.8)',
      }}
    >
      {message}
    </p>
  );
}

export function DiagramRenderer({ code, className, onError, onSuccess }: DiagramRendererProps) {
  const sanitizedCode = code?.trim() ?? '';
  const shouldFetch = Boolean(sanitizedCode);
  const {
    data: svg,
    error,
    isLoading,
  } = useSWR(shouldFetch ? sanitizedCode : null, fetchDiagramSvg, {
    revalidateOnFocus: false,
  });

  const { parsedSvg, parseError } = useMemo(() => {
    if (!svg) {
      return { parsedSvg: null, parseError: null };
    }

    const options: HTMLReactParserOptions = {
      replace(domNode) {
        const element = domNode as Element;
        if (element?.type === 'tag') {
          const attribs = normalizeAttributes(element.attribs ?? {});

          // Special handling for root SVG element
          if (element.name === 'svg') {
            delete attribs.style;
            return (
              <svg
                {...attribs}
                width="100%"
                height="auto"
                style={{ display: 'block', width: '100%', height: 'auto' }}
              >
                {domToReact(element.children as DOMNode[], options)}
              </svg>
            );
          }
        }
        return undefined;
      },
    };

    try {
      return { parsedSvg: parse(svg, options), parseError: null };
    } catch (err) {
      console.error('Failed to parse rendered D2 SVG', err);
      const message =
        err instanceof Error ? err.message : 'Unable to display this diagram.';
      return { parsedSvg: null, parseError: message };
    }
  }, [svg]);

  // Notify parent of error state
  useEffect(() => {
    if (error || parseError || !shouldFetch) {
      onError?.();
    } else if (parsedSvg) {
      onSuccess?.();
    }
  }, [error, parseError, parsedSvg, shouldFetch, onError, onSuccess]);

  if (!shouldFetch) {
    return null;
  }

  if (error) {
    console.warn('Diagram rendering failed:', error.message);
    return null;
  }

  if (parseError) {
    console.warn('Diagram parsing failed:', parseError);
    return null;
  }

  if (isLoading || !parsedSvg) {
    return (
      <div className={className}>
        <StatusMessage message="Sketching diagram..." />
      </div>
    );
  }

  return <div className={className}>{parsedSvg}</div>;
}
