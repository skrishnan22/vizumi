'use client';

import ReactMarkdown from 'react-markdown';
import type { NodeProps } from 'reactflow';
import styles from './NoteBoard.module.css';
import { DiagramRenderer } from './DiagramRenderer';
import type { NoteNodeData } from './NoteBoard';

export function NoteBlockNode({ data }: NodeProps<NoteNodeData>) {
  const { block, accent } = data;
  const showDiagram = block.visualType === 'diagram' && Boolean(block.d2Code?.trim());

  return (
    <div className={styles.nodeCard} style={{ background: accent }}>
      <div className={styles.nodeHeader}>
        <h3 className={styles.nodeTitle}>{block.title}</h3>
      </div>
      <div className={styles.nodeBody}>
        <ReactMarkdown>{block.summary}</ReactMarkdown>
      </div>
      {showDiagram && (
        <div className={styles.nodeDiagramWrapper}>
          <DiagramRenderer code={block.d2Code ?? ''} className={styles.nodeDiagram} />
        </div>
      )}
    </div>
  );
}
