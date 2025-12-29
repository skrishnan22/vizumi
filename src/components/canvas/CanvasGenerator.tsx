'use client';

import { useEffect, useState, useMemo } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import {
  CanvasAgentResponseSchema,
  type CanvasEdge as CanvasEdgeType,
} from '@/lib/canvas/schemas-v2';
import { CanvasBoard } from './CanvasBoard';
import { postProcessCards } from '@/lib/canvas/post-process';
import Link from 'next/link';
import { toast } from 'sonner';
import { logger } from '@/lib/logger.client';
import { useSettings } from '@/hooks/use-settings';
import { showApiErrorToast } from '@/lib/api/client-error-handler';
import { HEADERS } from '@/lib/constants';
import { ModelSelector } from '@/components/ModelSelector';

export function CanvasGenerator() {
  const { apiKey, modelPrefs } = useSettings();

  const [sessionModel, setSessionModel] = useState<string | null>(null);
  const effectiveModel = sessionModel ?? modelPrefs.generate;

  const requestHeaders = useMemo(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      [HEADERS.MODEL]: effectiveModel,
    };
    if (apiKey) {
      headers[HEADERS.API_KEY] = apiKey;
    }
    return headers;
  }, [effectiveModel, apiKey]);

  const { object, submit, isLoading, error } = useObject({
    api: '/api/canvas-agent',
    schema: CanvasAgentResponseSchema,
    headers: requestHeaders,
  });

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [generationStage, setGenerationStage] = useState<'fetching' | 'generating' | null>(null);

  const { cards, edges, layoutType } = useMemo(() => {
    if (isLoading || !object) {
      return { cards: [], edges: [], layoutType: 'layered' as const };
    }

    const responseCards = object.cards as any[];
    const responseEdges = object.edges as any[];
    const responseLayoutType = object.layout || 'layered';

    const { cards: processedCards, edges: validEdges } = postProcessCards(
      responseCards,
      responseEdges
    );

    return {
      cards: processedCards,
      edges: validEdges,
      layoutType: responseLayoutType,
    };
  }, [object, isLoading]);

  useEffect(() => {
    if (isLoading) {
      setGenerationStage('generating');
    } else {
      setGenerationStage(null);
    }
  }, [isLoading]);

  useEffect(() => {
    if (error) {
      showApiErrorToast(error, { showRetryHint: true });
      setGenerationStage(null);
    }
  }, [error]);

  const handleGenerate = async () => {
    if (!url.trim()) return;

    setGenerationStage('fetching');

    try {
      let fetchedMarkdown: string | undefined;

      try {
        const metadataRes = await fetch('/api/url-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        if (metadataRes.ok) {
          const { title: fetchedTitle, markdown: responseMarkdown } = await metadataRes.json();
          if (fetchedTitle) setTitle(fetchedTitle);
          if (responseMarkdown) {
            fetchedMarkdown = responseMarkdown;
          }
        }
      } catch (err) {
        logger.error('Error fetching metadata:', err);
      }

      submit({ url, markdown: fetchedMarkdown });
    } catch (err) {
      logger.error('Error in handleGenerate:', err);
      toast.error('Failed to generate canvas');
      setGenerationStage(null);
    }
  };

  const hasContent = cards.length > 0;

  return (
    <section className="w-full min-h-screen relative overflow-hidden bg-stone-50 flex flex-col">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[80px] opacity-40 bg-gradient-to-br from-teal-500/15 to-emerald-500/10 -top-[200px] -right-[100px]" />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[80px] opacity-40 bg-gradient-to-br from-orange-500/8 to-orange-400/6 -bottom-[150px] -left-[100px]" />
      </div>

      <div className="fixed top-6 left-6 z-50">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-stone-600 font-medium text-sm hover:border-teal-300 hover:text-stone-900 transition-all shadow-sm"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span>Home</span>
        </Link>
      </div>

      <div
        className={`
          w-full max-w-[720px] absolute left-1/2 -translate-x-1/2 px-6 z-20
          transition-all duration-500 ease-out
          ${hasContent ? 'top-[40%] opacity-0 pointer-events-none' : 'top-[45%] -translate-y-1/2 opacity-100'}
        `}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 mb-4">
            Canvas Agent
          </h1>
          <p className="text-lg text-stone-600 max-w-[500px] mx-auto">
            Transform any article into visual whiteboard-style cards
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-2 shadow-lg flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          <div className="flex-1 relative flex items-center">
            <svg
              className="absolute left-3 w-5 h-5 text-stone-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && url.trim() && !generationStage) {
                  handleGenerate();
                }
              }}
              className="w-full py-3.5 px-4 pl-10 text-base text-stone-900 bg-transparent border-none rounded-xl outline-none placeholder:text-stone-400"
              placeholder="Paste article URL..."
            />
          </div>

          <div className="hidden sm:block w-px h-6 bg-stone-200 mx-2" />

          <ModelSelector
            value={effectiveModel}
            onChange={setSessionModel}
            disabled={!!generationStage}
            className="!border-none !bg-transparent !text-teal-700 !px-3 !font-medium !shadow-none hover:!bg-teal-50"
          />

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!!generationStage || !url.trim()}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl px-5 py-3 text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {generationStage ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{generationStage === 'fetching' ? 'Fetching...' : 'Generating...'}</span>
              </>
            ) : (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>Generate Canvas</span>
              </>
            )}
          </button>
        </div>
      </div>

      {hasContent && (
        <>
          <header className="w-full max-w-[900px] mx-auto px-6 pt-8 pb-4 text-center z-30">
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight mb-2">
              {title || 'Visual Canvas'}
            </h1>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-mono text-xs text-stone-500 bg-stone-100 px-3 py-1.5 rounded-md hover:bg-stone-200 hover:text-teal-600 transition-colors truncate max-w-full"
            >
              {url}
            </a>
          </header>

          <div
            className="w-full relative"
            style={{ height: 'calc(100vh - 120px)', minHeight: '500px' }}
          >
            <CanvasBoard
              cards={cards}
              edges={edges}
              layoutType={layoutType}
              isLoading={isLoading}
            />
          </div>
        </>
      )}
    </section>
  );
}
