'use client';

import { useState } from 'react';
import { DiagramRenderer } from './DiagramRenderer';
import styles from './NoteBoard.module.css';

type DiagramSectionProps = {
    code: string;
    title: string;
    onViewFull: () => void;
};

export function DiagramSection({ code, title, onViewFull }: DiagramSectionProps) {
    const [hasError, setHasError] = useState(false);

    return (
        <div className={styles.diagramSection}>
            <DiagramRenderer
                code={code}
                className={styles.diagramWrapper}
                onError={() => setHasError(true)}
                onSuccess={() => setHasError(false)}
            />
            {!hasError && (
                <button
                    type="button"
                    className={styles.diagramButton}
                    onClick={onViewFull}
                >
                    View full diagram
                </button>
            )}
        </div>
    );
}
