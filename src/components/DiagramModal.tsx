'use client';

import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { DiagramRenderer } from './DiagramRenderer';
import styles from './NoteBoard.module.css';

type DiagramModalProps = {
  code: string;
  cachedSvg?: string;
  title: string;
  onClose: () => void;
  onSvgRendered?: (svg: string) => void;
};

export function DiagramModal({ code, cachedSvg, title, onClose, onSvgRendered }: DiagramModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    setIsMounted(true);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isMounted || typeof document === 'undefined') {
    return null;
  }

  const modalContent = (
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
          <DiagramRenderer
            code={code}
            cachedSvg={cachedSvg}
            className={styles.modalDiagram}
            onSvgRendered={onSvgRendered}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
