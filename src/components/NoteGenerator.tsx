'use client';

import { useState } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { NoteSchema } from '@/lib/schemas';
import { NoteBoard } from './NoteBoard';
import styles from './NoteGenerator.module.css';

type NoteGeneratorProps = {
    initialUrl?: string;
};

export function NoteGenerator({ initialUrl = '' }: NoteGeneratorProps) {
    const { object, submit, isLoading, error } = useObject({
        api: '/api/generate',
        schema: NoteSchema,
    });

    const [url, setUrl] = useState(initialUrl);

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

            {object?.blocks?.length ? <NoteBoard blocks={object.blocks} /> : null}
        </section>
    );
}
