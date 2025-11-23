'use client';

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { NodeResizer, type NodeProps } from 'reactflow';
import styles from './NoteBoard.module.css';
import { DiagramRenderer } from './DiagramRenderer';
import { DiagramModal } from './DiagramModal';
import type { NoteNodeData } from './NoteBoard';
import { FiEdit3 } from 'react-icons/fi';
import dynamic from 'next/dynamic';

const NoteEditor = dynamic(() => import('./NoteEditor').then((mod) => mod.NoteEditor), {
  ssr: false,
  loading: () => <div className={`${styles.editorLoading} nodrag nopan`}>Preparing editor…</div>,
});

export function NoteBlockNode({ id, data, selected }: NodeProps<NoteNodeData>) {
  const { block, accent, onMeasure, onSaveSummary } = data;
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const baseKey = useMemo(
    () => `${block.id ?? 'block'}:${block.visualType}:${block.d2Code ?? ''}`,
    [block.id, block.visualType, block.d2Code],
  );
  const diagramAvailable = block.visualType === 'diagram' && Boolean(block.d2Code?.trim());
  const [hiddenKeys, setHiddenKeys] = useState<Record<string, boolean>>({});
  const shouldShowDiagram = diagramAvailable && !hiddenKeys[baseKey];
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(block.summary);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hideDiagram = () => {
    setHiddenKeys((prev) => (prev[baseKey] ? prev : { ...prev, [baseKey]: true }));
  };

  const clearHidden = () => {
    setHiddenKeys((prev) => {
      if (!prev[baseKey]) {
        return prev;
      }
      const next = { ...prev };
      delete next[baseKey];
      return next;
    });
  };

  const measureHeight = useCallback(() => {
    if (!nodeRef.current || !onMeasure) {
      return;
    }
    onMeasure(id, nodeRef.current.scrollHeight);
  }, [id, onMeasure]);

  useLayoutEffect(() => {
    measureHeight();
    if (!nodeRef.current) {
      return;
    }
    const observer = new ResizeObserver(() => measureHeight());
    observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, [measureHeight]);

  return (
    <div className={styles.nodeCard} style={{ background: accent }} ref={nodeRef}>
      <NodeResizer
        isVisible={selected}
        minWidth={260}
        minHeight={240}
        lineStyle={{ border: '1px dashed rgba(28,26,23,0.5)' }}
        handleStyle={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: '#1c1a17',
        }}
      />
      <div className={styles.nodeInner}>
        <div className={styles.nodeHeader}>
          <h3 className={styles.nodeTitle}>{block.title}</h3>
          <button
            type="button"
            className={styles.editButton}
            onClick={() => {
              setDraft(block.summary);
              setIsEditing(true);
            }}
            aria-label="Edit summary"
          >
            <FiEdit3 size={16} />
          </button>
        </div>
        {isEditing ? (
          <div className={styles.editorWrapper}>
            <NoteEditor value={draft} onChange={setDraft} />
            <div className={styles.editorActions}>
              <button
                type="button"
                className={styles.editorButton}
                onClick={() => {
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.editorButtonPrimary}
                onClick={() => {
                  onSaveSummary?.(id, draft);
                  setIsEditing(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.nodeBody}>
            <ReactMarkdown>{block.summary}</ReactMarkdown>
          </div>
        )}
        {shouldShowDiagram && (
          <button
            type="button"
            className={styles.diagramPreviewButton}
            onClick={() => setIsModalOpen(true)}
            aria-label="Open diagram in modal"
          >
            <div className={styles.nodeDiagramWrapper}>
              <DiagramRenderer
                key={baseKey}
                code={block.d2Code ?? ''}
                className={styles.nodeDiagram}
                onError={hideDiagram}
                onSuccess={() => {
                  clearHidden();
                  requestAnimationFrame(() => measureHeight());
                }}
              />
            </div>
          </button>
        )}
      </div>
      {isModalOpen && block.d2Code && (
        <DiagramModal
          code={block.d2Code}
          title={block.title || 'Diagram'}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
