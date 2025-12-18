'use client';

import { useEffect, useState, useRef } from 'react';
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
import { toast } from 'sonner';
import { logger } from '@/lib/logger.client';
import { useSettings } from '@/hooks/use-settings';
import { showApiErrorToast } from '@/lib/api/client-error-handler';

type NoteGeneratorProps = {
  noteId: string;
};

export function NoteGenerator({ noteId }: NoteGeneratorProps) {
  const router = useRouter();
  const { getRequestHeaders } = useSettings();
  const { object, submit, isLoading, error } = useObject({
    api: '/api/generate',
    schema: LLMNoteSchema,
    headers: getRequestHeaders('generate'),
  });

  const [url, setUrl] = useState('');
  const setNoteId = useNoteStore((state) => state.setNoteId);

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
    }
  }, [isLoading]);

  // Show toast on API error and cleanup metadata
  useEffect(() => {
    if (error) {
      showApiErrorToast(error, { showRetryHint: true });
      // Delete metadata so user can retry with same URL
      deleteNoteMetadata(noteId).catch((err) => {
        logger.error('Failed to cleanup metadata on error:', err);
      });
    }
  }, [error, noteId]);

  // Handle generation with metadata saving
  const handleGenerate = async () => {
    if (!url.trim()) return;

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
      return;
    }

    try {
      // 1. Fetch metadata
      const metadataRes = await fetch('/api/url-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (metadataRes.ok) {
        const { title, ogImage } = await metadataRes.json();

        // 2. Save to metadata index
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

    // 3. Start generation
    submit({ url });
  };

  return (
    <section className={styles.wrapper}>
      {/* Home button */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="font-medium text-gray-700">Home</span>
        </Link>
      </div>

      <header className={styles.intro}>
        <p className={styles.introSubtitle}>Sketch your study sheet</p>
        <h1 className={styles.introTitle}>Visual Note Generator</h1>
      </header>

      <div className={styles.panel}>
        <label className={styles.label}>Source URL</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={styles.urlInput}
          placeholder="https://example.com/source-article"
        />

        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !url.trim()}
            className={styles.button}
          >
            {isLoading ? 'Sketching notes...' : 'Generate Notes'}
          </button>
        </div>
      </div>

      {blocks.length > 0 ? <NoteBoard noteId={noteId} /> : null}
    </section>
  );
}
