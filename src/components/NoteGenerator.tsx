'use client';

import { useEffect, useState } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { LLMNoteSchema, LLMNoteBlockSchema } from '@/lib/schemas';
import type { LLMNoteBlock, NoteBlock } from '@/lib/schemas';
import { NoteBoard } from './NoteBoard';
import styles from './NoteGenerator.module.css';
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
    const setBlocksInStore = useNoteStore((state) => state.setBlocks);

    const blocks = Array.isArray(object?.blocks)
        ? object.blocks.reduce((acc, block) => {
            const result = LLMNoteBlockSchema.safeParse(block);
            if (result.success) {
                acc.push(result.data);
            }
            return acc;
        }, [] as LLMNoteBlock[])
            // Assign parentId: first block is root, all others are children of first block
            // Also add blockType since LLM doesn't generate it
            .map((block, index) => {
                if (index === 0) {
                    // Root block - no parent
                    return { ...block, parentId: undefined, blockType: 'content' as const };
                } else {
                    // All other blocks are children of the first block
                    const rootId = object?.blocks?.[0]?.id;
                    return { ...block, parentId: rootId, blockType: 'content' as const };
                }
            })
        : [];

    useEffect(() => {
        setBlocksInStore(blocks);
    }, [blocks, setBlocksInStore]);

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

            {blocks.length > 0 ? <NoteBoard blocks={blocks} /> : null}
        </section>
    );
}
