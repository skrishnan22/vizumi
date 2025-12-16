'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import parse, { domToReact, type DOMNode, type HTMLReactParserOptions } from 'html-react-parser';
import type { Element } from 'domhandler';

type DiagramRendererProps = {
  code: string;
  cachedSvg?: string;
  className?: string;
  onSuccess?: () => void;
  onSvgRendered?: (svg: string) => void;
  onRenderFailure?: () => void;
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

export function DiagramRenderer({ code, cachedSvg, className, onSuccess, onSvgRendered, onRenderFailure }: DiagramRendererProps) {
  const sanitizedCode = code?.trim() ?? '';

  const {
    data: svg,
    error,
    isLoading,
  } = useSWR(
    // Only fetch if we don't have cached SVG
    cachedSvg ? null : (sanitizedCode || null),
    fetchDiagramSvg,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 0, // Disable retries - render-d2 handles LLM-based fixes internally
      onSuccess: (data) => {
        onSuccess?.();
        onSvgRendered?.(data);
      },
      onError: () => {
        // Clear d2Code from block to prevent retrying on every load
        onRenderFailure?.();
      },
    }
  );

  // Use cached SVG if available, otherwise use fetched SVG
  const finalSvg = cachedSvg || svg;

  const { parsedSvg, parseError } = useMemo(() => {
    if (!finalSvg) {
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
      return { parsedSvg: parse(finalSvg, options), parseError: null };
    } catch (err) {
      console.error('Failed to parse rendered D2 SVG', err);
      const message =
        err instanceof Error ? err.message : 'Unable to display this diagram.';
      return { parsedSvg: null, parseError: message };
    }
  }, [finalSvg]);

  if (!sanitizedCode) {
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
