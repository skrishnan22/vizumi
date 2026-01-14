'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { LLMNoteSchema, LLMNoteBlockSchema } from '@/lib/schemas';
import type { LLMNoteBlock } from '@/lib/schemas';
import { CanvasAgentResponseSchema } from '@/lib/canvas/schemas-v2';
import { NoteBoard } from './NoteBoard';
import { CanvasDocBoard } from './canvas/CanvasDocBoard';
import styles from './NoteGenerator.module.css';
import { syncBlocksToGraph } from '@/lib/graph/noteActions';
import { useNoteStore } from '@/store/noteStore';
import { useGraphDoc } from '@/hooks/useGraphDoc';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeroIllustration } from './HeroIllustration';
import { toast } from 'sonner';
import { logger } from '@/lib/logger.client';
import { useSettings } from '@/hooks/use-settings';
import { showApiErrorToast } from '@/lib/api/client-error-handler';
import { HEADERS } from '@/lib/constants';
import { ModelSelector } from './ModelSelector';
import { postProcessCards } from '@/lib/canvas/post-process';
import { buildCanvasGraph } from '@/lib/canvas/graph';
import { setGraph, type GraphMetaPatch } from '@/lib/graph/actions';
import { prepareDocGeneration, cleanupDocGeneration } from '@/lib/generator';
import type { DocKind } from '@/lib/db/noteMetadata';

type NoteGeneratorProps = {
  docId: string;
};

type GeneratorMode = DocKind;

export function NoteGenerator({ docId }: NoteGeneratorProps) {
  const router = useRouter();
  const { modelPrefs, getRequestHeaders } = useSettings();
  const { isLoading: isDocLoading } = useGraphDoc({ docId });

  const [mode, setMode] = useState<GeneratorMode>('canvas');
  const [isModeLocked, setIsModeLocked] = useState(false);

  const [sessionModel, setSessionModel] = useState<string | null>(null);
  const effectiveModel = sessionModel ?? modelPrefs.generate;

  const requestHeaders = useMemo(() => {
    const headers = getRequestHeaders('generate');
    if (sessionModel) {
      return { ...headers, [HEADERS.MODEL]: sessionModel };
    }
    return headers;
  }, [getRequestHeaders, sessionModel]);

  const noteResponse = useObject({
    api: '/api/note',
    schema: LLMNoteSchema,
    headers: requestHeaders,
  });

  const canvasResponse = useObject({
    api: '/api/canvas',
    schema: CanvasAgentResponseSchema,
    headers: requestHeaders,
  });

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [generationStage, setGenerationStage] = useState<'fetching' | 'generating' | null>(null);

  const setNoteId = useNoteStore((state) => state.setNoteId);
  const setMarkdownForNote = useNoteStore((state) => state.setMarkdownForNote);
  const setGenerating = useNoteStore((state) => state.setGenerating);

  useEffect(() => {
    if (mode !== 'note') {
      setNoteId(null);
      return;
    }

    setNoteId(docId);
    return () => setNoteId(null);
  }, [docId, mode, setNoteId]);

  const syncedBlockIdsRef = useRef<Set<string>>(new Set());
  const layoutRunRef = useRef(0);

  const noteBlocks = useMemo(() => {
    return (noteResponse.object?.blocks || [])
      .reduce((acc, block) => {
        const result = LLMNoteBlockSchema.safeParse(block);
        if (result.success) {
          acc.push(result.data);
        }
        return acc;
      }, [] as LLMNoteBlock[])
      .map((block, index) => {
        if (index === 0) {
          return { ...block, parentId: undefined, blockType: 'content' as const };
        }

        const rootId = noteResponse.object?.blocks?.[0]?.id;
        return { ...block, parentId: rootId, blockType: 'content' as const };
      });
  }, [noteResponse.object]);

  useEffect(() => {
    if (mode !== 'note' || noteBlocks.length === 0) return;

    const newBlocks = noteBlocks.filter((block) => !syncedBlockIdsRef.current.has(block.id));

    if (newBlocks.length > 0) {
      syncBlocksToGraph(docId, noteBlocks);
      newBlocks.forEach((block) => syncedBlockIdsRef.current.add(block.id));
    }
  }, [docId, mode, noteBlocks]);

  useEffect(() => {
    if (noteResponse.isLoading) {
      syncedBlockIdsRef.current.clear();
    }
  }, [noteResponse.isLoading]);

  useEffect(() => {
    if (mode !== 'note') {
      setGenerating(false);
      return;
    }

    setGenerating(noteResponse.isLoading);
  }, [mode, noteResponse.isLoading, setGenerating]);

  const {
    cards: canvasCards,
    edges: canvasEdges,
    layoutType,
    hasIncompleteCard,
  } = useMemo(() => {
    if (!canvasResponse.object) {
      return {
        cards: [],
        edges: [],
        layoutType: 'layered' as const,
        hasIncompleteCard: false,
      };
    }

    const responseCards = (canvasResponse.object.cards as any[]) ?? [];
    const responseEdges = (canvasResponse.object.edges as any[]) ?? [];
    const responseLayoutType = canvasResponse.object.layout || 'layered';

    if (canvasResponse.isLoading) {
      logger.info(
        `[Streaming] Cards received: ${responseCards.length}, isLoading: ${canvasResponse.isLoading}`
      );
    }

    const cardsToProcess =
      canvasResponse.isLoading && responseCards.length > 0
        ? responseCards.slice(0, responseCards.length - 1)
        : responseCards;

    const validCards = cardsToProcess.filter((card) => {
      if (!card || typeof card !== 'object') return false;
      if (!card.id || typeof card.id !== 'string') return false;
      if (!card.title || typeof card.title !== 'string') return false;
      if (!Array.isArray(card.sections) || card.sections.length === 0) return false;
      if (!card.sections[0]?.type) return false;
      return true;
    });

    if (canvasResponse.isLoading) {
      logger.info(`[Streaming] Valid cards after N-1: ${validCards.length}`);
    }

    const { cards: processedCards, edges: validEdges } = postProcessCards(
      validCards,
      responseEdges
    );

    return {
      cards: processedCards,
      edges: validEdges,
      layoutType: responseLayoutType,
      hasIncompleteCard: canvasResponse.isLoading && responseCards.length > cardsToProcess.length,
    };
  }, [canvasResponse.isLoading, canvasResponse.object]);

  useEffect(() => {
    if (mode !== 'canvas' || canvasCards.length === 0) return;

    let isCancelled = false;
    const runId = ++layoutRunRef.current;

    const persistLayout = async () => {
      try {
        const { nodes, edges: layoutedEdges } = await buildCanvasGraph(
          canvasCards,
          canvasEdges,
          layoutType
        );

        if (isCancelled || runId !== layoutRunRef.current) return;

        const metaPatch: GraphMetaPatch = {
          kind: 'canvas',
          layoutType,
        };

        setGraph(docId, nodes, layoutedEdges, metaPatch);
      } catch (error) {
        if (!isCancelled) {
          logger.error('Failed to persist canvas layout:', error);
        }
      }
    };

    persistLayout();

    return () => {
      isCancelled = true;
    };
  }, [canvasCards, canvasEdges, docId, layoutType, mode]);

  const activeIsLoading = mode === 'note' ? noteResponse.isLoading : canvasResponse.isLoading;
  const activeError = mode === 'note' ? noteResponse.error : canvasResponse.error;

  useEffect(() => {
    if (activeIsLoading) {
      setGenerationStage('generating');
      return;
    }

    if (generationStage === 'generating') {
      setGenerationStage(null);
    }
  }, [activeIsLoading, generationStage]);

  useEffect(() => {
    if (!activeError) return;

    showApiErrorToast(activeError, { showRetryHint: true });
    cleanupDocGeneration(docId);
    setGenerationStage(null);
  }, [activeError, docId]);

  const handleGenerate = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl || generationStage) return;

    if (!isModeLocked) {
      setIsModeLocked(true);
    }

    setGenerationStage('fetching');

    try {
      const result = await prepareDocGeneration({
        docId,
        kind: mode,
        url: trimmedUrl,
        fallbackTitle: mode === 'canvas' ? 'Visual Canvas' : 'Visual Note',
      });

      if (result.kind === 'duplicate') {
        const label = mode === 'canvas' ? 'Canvas' : 'Note';
        toast.info(`A ${label.toLowerCase()} already exists for this URL`, {
          description: result.existing.title || `View the existing ${label.toLowerCase()}`,
          action: {
            label: `View ${label}`,
            onClick: () => router.push(`/doc/${result.existing.noteId}`),
          },
          duration: 8000,
        });
        setGenerationStage(null);
        return;
      }

      setTitle(result.metadata.title);
      setUrl(result.metadata.url);

      if (result.metadata.markdown && mode === 'note') {
        setMarkdownForNote(docId, result.metadata.markdown);
      }

      const payload = { url: result.metadata.url, markdown: result.metadata.markdown };

      if (mode === 'note') {
        noteResponse.submit(payload);
      } else {
        canvasResponse.submit(payload);
      }
    } catch (error) {
      logger.error('Error in handleGenerate:', error);
      toast.error('Failed to generate the document.');
      setGenerationStage(null);
    }
  };

  const hasCanvasContent =
    canvasCards.length > 0 || (canvasResponse.isLoading && canvasResponse.object !== undefined);
  const hasNoteContent = noteBlocks.length > 0;
  const hasContent = mode === 'note' ? hasNoteContent : hasCanvasContent;

  const heroSubtitle =
    mode === 'canvas'
      ? 'Paste a URL and watch as AI creates a visual canvas of key ideas'
      : 'Paste a URL and watch as AI creates an interactive mind map of key concepts';

  return (
    <section className={styles.wrapper}>
      <div className={styles.backgroundOrbs} aria-hidden="true">
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
      </div>

      <div className={styles.homeButtonWrapper}>
        <Link href="/" className={styles.homeButton}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span>Home</span>
        </Link>
      </div>

      <div
        className={`${styles.contentContainer} ${
          hasContent ? styles.contentHidden : styles.contentCentered
        }`}
      >
        <div className={styles.illustrationWrapper}>
          <HeroIllustration />
        </div>

        <div className={styles.heroSection}>
          <h1 className={styles.heroTitle}>Transform any article into visual notes</h1>
          <p className={styles.heroSubtitle}>{heroSubtitle}</p>
        </div>

        <div className={styles.inputCard}>
          <div className={styles.inputWrapper}>
            <svg
              className={styles.inputIcon}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
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
              className={styles.urlInput}
              placeholder="Paste article URL..."
              data-testid="url-input"
            />
          </div>

          <div className={styles.inputDivider} />

          <div className={styles.modeToggle} aria-label="Document mode">
            <button
              type="button"
              className={`${styles.modeButton} ${mode === 'canvas' ? styles.modeButtonActive : ''}`}
              onClick={() => setMode('canvas')}
              disabled={isModeLocked || !!generationStage}
            >
              Canvas
            </button>
            <button
              type="button"
              className={`${styles.modeButton} ${mode === 'note' ? styles.modeButtonActive : ''}`}
              onClick={() => setMode('note')}
              disabled={isModeLocked || !!generationStage}
            >
              Note
            </button>
          </div>

          <ModelSelector
            value={effectiveModel}
            onChange={setSessionModel}
            disabled={!!generationStage}
            className={styles.embeddedModelSelector}
          />

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!!generationStage || !url.trim()}
            className={styles.generateButton}
            data-testid="generate-button"
          >
            {generationStage ? (
              <>
                <span className={styles.spinner} />
                <span>
                  {generationStage === 'fetching'
                    ? 'Fetching content...'
                    : mode === 'canvas'
                      ? 'Creating canvas...'
                      : 'Creating notes...'}
                </span>
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
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>{mode === 'canvas' ? 'Generate Canvas' : 'Generate Notes'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {hasContent && (
        <>
          <header className={styles.generatedHeader}>
            <h1 className={styles.generatedTitle}>
              {title || (mode === 'canvas' ? 'Visual Canvas' : 'Visual Note')}
            </h1>
            <a href={url} target="_blank" rel="noopener noreferrer" className={styles.generatedUrl}>
              {url}
            </a>
          </header>
          <div className={styles.boardContainer}>
            {mode === 'canvas' ? (
              <div className="w-full relative" style={{ height: 'calc(100vh - 120px)' }}>
                <CanvasDocBoard
                  docId={docId}
                  isLoading={canvasResponse.isLoading || isDocLoading}
                  showSkeletonCard={hasIncompleteCard}
                />
              </div>
            ) : (
              <NoteBoard noteId={docId} sessionModel={effectiveModel} />
            )}
          </div>
        </>
      )}
    </section>
  );
}
