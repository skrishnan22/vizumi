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
  onRenderFailure?: () => void;
};

export function DiagramModal({
  code,
  cachedSvg,
  title,
  onClose,
  onSvgRendered,
  onRenderFailure,
}: DiagramModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  }, [onClose]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    },
    [handleClose]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, isMounted]);

  if (!isMounted || typeof document === 'undefined') {
    return null;
  }

  const modalContent = (
    <div
      className={`${styles.modalOverlay} ${isClosing ? styles.modalOverlayClosing : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Diagram for ${title}`}
      onClick={handleClose}
    >
      <div
        className={`${styles.modalContent} ${isClosing ? styles.modalContentClosing : ''}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleWrapper}>
            <span className={styles.modalAccent} aria-hidden="true" />
            <h3 className={styles.modalTitle}>{title}</h3>
          </div>
          <button
            type="button"
            className={styles.modalClose}
            onClick={handleClose}
            aria-label="Close diagram"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className={styles.modalBody}>
          <DiagramRenderer
            code={code}
            cachedSvg={cachedSvg}
            className={styles.modalDiagram}
            onSvgRendered={onSvgRendered}
            onRenderFailure={onRenderFailure}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
