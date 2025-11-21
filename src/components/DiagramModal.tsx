'use client';

import { useEffect, useCallback } from 'react';
import { DiagramRenderer } from './DiagramRenderer';
import styles from './NoteBoard.module.css';

type DiagramModalProps = {
  code: string;
  title: string;
  onClose: () => void;
};

export function DiagramModal({ code, title, onClose }: DiagramModalProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={`Diagram for ${title}`}
      onClick={onClose}
    >
      <div
        className={styles.modalContent}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Close diagram"
          >
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
          <DiagramRenderer code={code} className={styles.modalDiagram} />
        </div>
      </div>
    </div>
  );
}
