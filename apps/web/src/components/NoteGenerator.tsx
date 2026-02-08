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
import { getNoteByUrl } from '@/lib/db/actions';
import type { DocKind } from '@/lib/db/noteMetadata';
import { useGenerationStore } from '@/store/generationStore';
import { validateUrl } from '@/lib/validation';
import {
  trackClientError,
  trackGenerationDuplicate,
  trackGenerationFailed,
  trackGenerationStarted,
  trackGenerationSucceeded,
  type GenerationAttempt,
} from '@/lib/posthog';

type NoteGeneratorProps = {
  docId: string;
};

type GeneratorMode = DocKind;

export function NoteGenerator({ docId }: NoteGeneratorProps) {
  const router = useRouter();
  const { modelPrefs, getRequestHeaders, hasApiKey } = useSettings();
  const { isLoading: isDocLoading } = useGraphDoc({ docId });
  const clearPending = useGenerationStore((state) => state.clearPending);

  const [mode, setMode] = useState<GeneratorMode>('canvas');
  const [isModeLocked, setIsModeLocked] = useState(false);

  const [sessionModel, setSessionModel] = useState<string | null>(null);
  const effectiveModel = sessionModel ?? modelPrefs.generate;

  // Track if we've consumed pending data to avoid re-triggering
  const pendingConsumedRef = useRef(false);

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
  const [urlError, setUrlError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [generationStage, setGenerationStage] = useState<'fetching' | 'generating' | null>(null);
  const [shouldAutoGenerate, setShouldAutoGenerate] = useState(false);
  const [cameFromHome, setCameFromHome] = useState(false);

  const setNoteId = useNoteStore((state) => state.setNoteId);
  const setMarkdownForNote = useNoteStore((state) => state.setMarkdownForNote);
  const setGenerating = useNoteStore((state) => state.setGenerating);

  // Check for pending generation data on mount
  useEffect(() => {
    if (pendingConsumedRef.current) return;

    const pending = clearPending();
    if (pending) {
      pendingConsumedRef.current = true;
      setUrl(pending.url);
      setMode(pending.mode);
      if (pending.model) {
        setSessionModel(pending.model);
      }
      setCameFromHome(true);
      setShouldAutoGenerate(true);
    }
  }, [clearPending]);

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
  const generationAttemptRef = useRef<GenerationAttempt | null>(null);

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

  // Create a stable key based on card/edge IDs to prevent effect re-runs when
  // array references change but content is the same (rule: rerender-dependencies)
  const canvasLayoutKey = useMemo(() => {
    const cardIds = canvasCards.map((c) => c.id).join(',');
    const edgeIds = canvasEdges.map((e) => e.id).join(',');
    return `${layoutType}|${cardIds}|${edgeIds}`;
  }, [canvasCards, canvasEdges, layoutType]);

  // Store current canvas data in refs to access in effect without adding to dependencies
  const canvasDataRef = useRef({ cards: canvasCards, edges: canvasEdges, layoutType });
  canvasDataRef.current = { cards: canvasCards, edges: canvasEdges, layoutType };

  useEffect(() => {
    const { cards, edges, layoutType: layout } = canvasDataRef.current;
    if (mode !== 'canvas' || cards.length === 0) return;

    let isCancelled = false;
    const runId = ++layoutRunRef.current;

    const persistLayout = async () => {
      try {
        const { nodes, edges: layoutedEdges } = await buildCanvasGraph(cards, edges, layout);

        if (isCancelled || runId !== layoutRunRef.current) return;

        const metaPatch: GraphMetaPatch = {
          kind: 'canvas',
          layoutType: layout,
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
  }, [canvasLayoutKey, docId, mode]);

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

    const attempt = generationAttemptRef.current;
    if (attempt) {
      trackGenerationFailed(attempt, activeError, {
        failure_stage: 'response',
      });
      generationAttemptRef.current = null;
    }

    trackClientError(activeError, {
      source: 'note_generator_response',
      generation_mode: mode,
      doc_id: docId,
      model: effectiveModel,
    });

    showApiErrorToast(activeError, { showRetryHint: true });
    cleanupDocGeneration(docId);
    setGenerationStage(null);
    router.push('/');
  }, [activeError, docId, effectiveModel, mode, router]);

  useEffect(() => {
    const attempt = generationAttemptRef.current;
    if (!attempt || activeIsLoading) {
      return;
    }

    const isSuccess = attempt.mode === 'note' ? noteBlocks.length > 0 : canvasCards.length > 0;
    if (!isSuccess) {
      return;
    }

    trackGenerationSucceeded(attempt, {
      title: title || null,
    });
    generationAttemptRef.current = null;
  }, [activeIsLoading, canvasCards.length, noteBlocks.length, title]);

  const handleGenerate = async () => {
    if (generationStage) return;

    const validation = validateUrl(url);
    if (!validation.valid) {
      setUrlError(validation.error);
      return;
    }

    const validatedUrl = validation.url;

    // Check for duplicate before showing loading state
    const existing = await getNoteByUrl(validatedUrl, mode);
    if (existing) {
      trackGenerationDuplicate({
        mode,
        model: effectiveModel,
        url: validatedUrl,
        existingDocId: existing.noteId,
      });

      const label = mode === 'canvas' ? 'Canvas' : 'Blueprint';
      toast.info(`A ${label.toLowerCase()} already exists for this URL`, {
        description: existing.title || `View the existing ${label.toLowerCase()}`,
        action: {
          label: `View ${label}`,
          onClick: () => router.push(`/doc/${existing.noteId}`),
        },
        duration: 8000,
      });
      router.push('/');
      return;
    }

    if (!isModeLocked) {
      setIsModeLocked(true);
    }

    setGenerationStage('fetching');

    const currentAttempt: GenerationAttempt = {
      docId,
      mode,
      model: effectiveModel,
      url: validatedUrl,
      startedAt: Date.now(),
      source: cameFromHome ? 'home' : 'new-page',
    };

    generationAttemptRef.current = currentAttempt;
    trackGenerationStarted(currentAttempt);

    try {
      const result = await prepareDocGeneration({
        docId,
        kind: mode,
        url: validatedUrl,
        fallbackTitle: mode === 'canvas' ? 'Visual Canvas' : 'Visual Blueprint',
      });

      // Should not happen since we check above, but handle for type safety
      if (result.kind === 'duplicate') {
        trackGenerationDuplicate({
          mode,
          model: effectiveModel,
          url: validatedUrl,
          existingDocId: result.existing.noteId,
        });
        generationAttemptRef.current = null;
        router.push('/');
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
      const attempt = generationAttemptRef.current;
      if (attempt) {
        trackGenerationFailed(attempt, error, {
          failure_stage: 'handle_generate',
        });
        generationAttemptRef.current = null;
      }

      trackClientError(error, {
        source: 'note_generator_handle_generate',
        generation_mode: mode,
        doc_id: docId,
        model: effectiveModel,
      });

      logger.error('Error in handleGenerate:', error);
      toast.error('Failed to generate the document.');
      cleanupDocGeneration(docId);
      setGenerationStage(null);
      router.push('/');
    }
  };

  // Auto-generate when coming from home page with pending data
  useEffect(() => {
    if (shouldAutoGenerate && url.trim()) {
      setShouldAutoGenerate(false);
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAutoGenerate, url]);

  const hasCanvasContent =
    canvasCards.length > 0 || (canvasResponse.isLoading && canvasResponse.object !== undefined);
  const hasNoteContent = noteBlocks.length > 0;
  const hasContent = mode === 'note' ? hasNoteContent : hasCanvasContent;

  // Determine if we should show loading state (came from home, no content yet)
  const showLoadingState = cameFromHome && !hasContent;

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

      {/* Hide content container entirely when came from home and has content */}
      {!(cameFromHome && hasContent) && (
        <div
          className={`${styles.contentContainer} ${
            hasContent ? styles.contentHidden : styles.contentCentered
          }`}
        >
          {showLoadingState ? (
            /* Loading state when auto-generating from home page */
            <div className={styles.loadingState}>
              <div className={styles.loadingIllustration}>
                {/* Placeholder for custom loading illustration */}
                <img
                  src="/loading-illustration.png"
                  alt="Generating visual notes"
                  width={320}
                  height={240}
                  className={styles.loadingImage}
                />
              </div>
              <div className={styles.loadingContent}>
                <h2 className={styles.loadingTitle}>
                  {generationStage === 'fetching'
                    ? 'Fetching article content...'
                    : mode === 'canvas'
                      ? 'Creating your visual canvas...'
                      : 'Creating your visual blueprint...'}
                </h2>
                <p className={styles.loadingSubtitle}>{url}</p>
                {/*<div className={styles.loadingSpinner}>
                <span className={styles.spinnerLarge} />
              </div>*/}
              </div>
            </div>
          ) : (
            /* Normal input UI */
            <>
              <div className={styles.illustrationWrapper}>
                <HeroIllustration />
              </div>

              <div className={styles.heroSection}>
                <h1 className={styles.heroTitle}>Transform any article into visual notes</h1>
                <p className={styles.heroSubtitle}>{heroSubtitle}</p>
              </div>

              <div className={styles.modeToggleRow}>
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
                    Blueprint
                  </button>
                </div>
              </div>

              <div className={`${styles.inputCard} ${urlError ? styles.inputCardError : ''}`}>
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
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (urlError) setUrlError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !generationStage) {
                        handleGenerate();
                      }
                    }}
                    className={styles.urlInput}
                    placeholder="Paste article URL..."
                    data-testid="url-input"
                  />
                </div>

                <div className={styles.inputDivider} />

                <ModelSelector
                  value={effectiveModel}
                  onChange={setSessionModel}
                  disabled={!!generationStage}
                  className={styles.embeddedModelSelector}
                  hasApiKey={hasApiKey}
                />

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!!generationStage}
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
                            : 'Creating blueprint...'}
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
                      <span>{mode === 'canvas' ? 'Generate Canvas' : 'Generate Blueprint'}</span>
                    </>
                  )}
                </button>
              </div>
              {urlError && <p className={styles.errorMessage}>{urlError}</p>}
            </>
          )}
        </div>
      )}

      {hasContent && (
        <>
          <header className={styles.generatedHeader}>
            <h1 className={styles.generatedTitle}>
              {title || (mode === 'canvas' ? 'Visual Canvas' : 'Visual Blueprint')}
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
