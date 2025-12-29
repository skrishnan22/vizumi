'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { LLMNoteSchema, LLMNoteBlockSchema } from '@/lib/schemas';
import type { LLMNoteBlock } from '@/lib/schemas';
import { NoteBoard } from './NoteBoard';
import styles from './NoteGenerator.module.css';
import { syncBlocksToYDoc } from '@/lib/yjs/actions';
import { useNoteStore } from '@/store/noteStore';
import { createNoteMetadata, deleteNoteMetadata, getNoteByUrl } from '@/lib/db/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeroIllustration } from './HeroIllustration';
import { toast } from 'sonner';
import { logger } from '@/lib/logger.client';
import { useSettings } from '@/hooks/use-settings';
import { showApiErrorToast } from '@/lib/api/client-error-handler';
import { HEADERS } from '@/lib/constants';
import { ModelSelector } from './ModelSelector';

type NoteGeneratorProps = {
  noteId: string;
};

export function NoteGenerator({ noteId }: NoteGeneratorProps) {
  const router = useRouter();
  const { apiKey, modelPrefs } = useSettings();

  // Session-specific model selection (defaults to user's saved preference)
  const [sessionModel, setSessionModel] = useState<string | null>(null);
  const effectiveModel = sessionModel ?? modelPrefs.generate;

  // Compute headers with the effective model
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
    api: '/api/generate',
    schema: LLMNoteSchema,
    headers: requestHeaders,
  });

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [generationStage, setGenerationStage] = useState<'fetching' | 'generating' | null>(null);
  const setNoteId = useNoteStore((state) => state.setNoteId);
  const setMarkdownForNote = useNoteStore((state) => state.setMarkdownForNote);
  const setGenerating = useNoteStore((state) => state.setGenerating);

  // Set noteId in store once on mount
  useEffect(() => {
    setNoteId(noteId);
    // Cleanup: Clear noteId when component unmounts
    return () => setNoteId(null);
  }, [noteId, setNoteId]);

  /**
   * Track synced block IDs to prevent re-syncing.
   *
   * Why useRef instead of useState?
   * - During streaming, blocks array changes frequently
   * - We only want to sync INCREMENTAL changes (new blocks)
   * - Using state would trigger extra re-renders
   * - Ref lets us track "side effect state" without affecting render cycle
   */
  const syncedBlockIdsRef = useRef<Set<string>>(new Set());

  const blocks = (object?.blocks || [])
    .reduce((acc, block) => {
      const result = LLMNoteBlockSchema.safeParse(block);
      if (result.success) {
        acc.push(result.data);
      }
      return acc;
    }, [] as LLMNoteBlock[])
    .map((block, index) => {
      if (index === 0) {
        // Root block - no parent.adding blockType since LLM doesn't generate it
        return { ...block, parentId: undefined, blockType: 'content' as const };
      } else {
        // All other blocks are children of the first block
        const rootId = object?.blocks?.[0]?.id;
        return { ...block, parentId: rootId, blockType: 'content' as const };
      }
    });

  // Sync blocks to Y.Doc incrementally as they arrive. Layout calculation is async and batched
  useEffect(() => {
    if (blocks.length === 0) return;

    const newBlocks = blocks.filter((block) => !syncedBlockIdsRef.current.has(block.id));

    if (newBlocks.length > 0) {
      syncBlocksToYDoc(noteId, blocks);
      newBlocks.forEach((block) => syncedBlockIdsRef.current.add(block.id));
    }
  }, [blocks, noteId]);

  // Reset state when starting new generation
  useEffect(() => {
    if (isLoading) {
      syncedBlockIdsRef.current.clear();
      setGenerationStage('generating');
      setGenerating(true);
    } else {
      setGenerationStage(null);
      setGenerating(false);
    }
  }, [isLoading, setGenerating]);

  // Show toast on API error and cleanup metadata
  useEffect(() => {
    if (error) {
      showApiErrorToast(error, { showRetryHint: true });

      deleteNoteMetadata(noteId).catch((err) => {
        logger.error('Failed to cleanup metadata on error:', err);
      });

      setGenerationStage(null);
    }
  }, [error, noteId]);

  // Handle generation with metadata saving
  const handleGenerate = async () => {
    if (!url.trim()) return;

    setGenerationStage('fetching');

    try {
      const existingNote = await getNoteByUrl(url.trim());
      if (existingNote) {
        toast.info('A note already exists for this URL', {
          description: existingNote.title || 'View the existing note',
          action: {
            label: 'View Note',
            onClick: () => router.push(`/notes/${existingNote.noteId}`),
          },
          duration: 8000,
        });
        setGenerationStage(null);
        return;
      }

      let fetchedMarkdown: string | undefined;

      try {
        const metadataRes = await fetch('/api/url-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        if (metadataRes.ok) {
          const { title, ogImage, markdown: responseMarkdown } = await metadataRes.json();
          if (title) setTitle(title);
          if (responseMarkdown) {
            fetchedMarkdown = responseMarkdown;
            setMarkdown(responseMarkdown);
            setMarkdownForNote(noteId, responseMarkdown);
          }

          await createNoteMetadata({
            noteId,
            url,
            title,
            ogImage,
          });
        }
      } catch (error) {
        logger.error('Error saving metadata:', error);
      }

      submit({ url, markdown: fetchedMarkdown });
    } catch (error) {
      logger.error('Error in handleGenerate:', error);
      setGenerationStage(null);
    }
  };

  return (
    <section className={styles.wrapper}>
      {/* Animated background orbs */}
      <div className={styles.backgroundOrbs} aria-hidden="true">
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
      </div>

      {/* Home button */}
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

      {/* Main Input - Fades out when content is generated */}
      <div
        className={`${styles.contentContainer} ${blocks.length > 0 ? styles.contentHidden : styles.contentCentered}`}
      >
        {/* Animated Illustration */}
        <div className={styles.illustrationWrapper}>
          <HeroIllustration />
        </div>

        <div className={styles.heroSection}>
          <h1 className={styles.heroTitle}>Transform any article into visual notes</h1>
          <p className={styles.heroSubtitle}>
            Paste a URL and watch as AI creates an interactive mind map of key concepts
          </p>
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
                  {generationStage === 'fetching' ? 'Fetching content...' : 'Creating notes...'}
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
                <span>Generate Notes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Header - Appears when content is generated */}
      {blocks.length > 0 && (
        <>
          <header className={styles.generatedHeader}>
            <h1 className={styles.generatedTitle}>{title || 'Visual Note'}</h1>
            <a href={url} target="_blank" rel="noopener noreferrer" className={styles.generatedUrl}>
              {url}
            </a>
          </header>
          <div className={styles.boardContainer}>
            <NoteBoard noteId={noteId} sessionModel={effectiveModel} />
          </div>
        </>
      )}
    </section>
  );
}
