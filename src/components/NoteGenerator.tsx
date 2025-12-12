'use client';

import { useEffect, useState, useRef } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { LLMNoteSchema, LLMNoteBlockSchema } from '@/lib/schemas';
import type { LLMNoteBlock, NoteBlock } from '@/lib/schemas';
import { NoteBoard } from './NoteBoard';
import styles from './NoteGenerator.module.css';
import { syncBlocksToYDoc } from '@/lib/yjs/actions';
import { useNoteStore } from '@/store/noteStore';

type NoteGeneratorProps = {
    initialUrl?: string;
};

export function NoteGenerator({ initialUrl = '' }: NoteGeneratorProps) {
    const { object, submit, isLoading, error } = useObject({
        api: '/api/generate',
        schema: LLMNoteSchema,
    });

    const [url, setUrl] = useState(initialUrl);
    const [noteId] = useState(() => crypto.randomUUID());
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

    const blocks = Array.isArray(object?.blocks)
        ? object.blocks.reduce((acc, block) => {
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
            })
        : [];

    // Sync blocks to Y.Doc incrementally as they arrive.This is efficient because layout calculation is async and batched
    useEffect(() => {
        if (blocks.length === 0) return;

        const newBlocks = blocks.filter(block => !syncedBlockIdsRef.current.has(block.id));

        if (newBlocks.length > 0) {
            syncBlocksToYDoc(noteId, blocks);

            newBlocks.forEach(block => syncedBlockIdsRef.current.add(block.id));
        }
    }, [blocks, noteId]);

    useEffect(() => {
        if (isLoading) {
            syncedBlockIdsRef.current.clear();
        }
    }, [isLoading]);

    return (
        <section className={styles.wrapper}>
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
                        onClick={() => submit({ url })}
                        disabled={isLoading || !url.trim()}
                        className={styles.button}
                    >
                        {isLoading ? 'Sketching notes...' : 'Generate Notes'}
                    </button>
                </div>
            </div>

            {error && (
                <div className={styles.error}>Error: {error.message}</div>
            )}

            {blocks.length > 0 ? <NoteBoard noteId={noteId} /> : null}
        </section>
    );
}
