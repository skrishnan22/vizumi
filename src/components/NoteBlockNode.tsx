'use client';

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { NodeResizer, type NodeProps } from 'reactflow';
import styles from './NoteBoard.module.css';
import { DiagramRenderer } from './DiagramRenderer';
import type { NoteNodeData } from './NoteBoard';

export function NoteBlockNode({ id, data, selected }: NodeProps<NoteNodeData>) {
  const { block, accent, onMeasure } = data;
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const baseKey = useMemo(
    () => `${block.id ?? 'block'}:${block.visualType}:${block.d2Code ?? ''}`,
    [block.id, block.visualType, block.d2Code],
  );
  const diagramAvailable = block.visualType === 'diagram' && Boolean(block.d2Code?.trim());
  const [hiddenKeys, setHiddenKeys] = useState<Record<string, boolean>>({});
  const shouldShowDiagram = diagramAvailable && !hiddenKeys[baseKey];

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
        </div>
        <div className={styles.nodeBody}>
          <ReactMarkdown>{block.summary}</ReactMarkdown>
        </div>
        {shouldShowDiagram && (
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
        )}
      </div>
    </div>
  );
}
