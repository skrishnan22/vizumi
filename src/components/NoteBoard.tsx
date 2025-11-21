'use client';

import { useState } from 'react';
import Masonry from 'react-masonry-css';
import ReactMarkdown from 'react-markdown';
import { NoteBlock } from '@/lib/schemas';
import { DiagramSection } from './DiagramSection';
import { DiagramModal } from './DiagramModal';
import styles from './NoteBoard.module.css';
import { DiagramRenderer } from './DiagramRenderer';

type NoteBoardProps = {
  blocks: NoteBlock[];
};

const masonryBreakpoints = {
  default: 3,
  1200: 2,
  768: 1,
};

const accentVariants = ['cardYellow', 'cardBlue', 'cardGreen'] as const;

type ActiveDiagram = {
  code: string;
  title: string;
};

export function NoteBoard({ blocks }: NoteBoardProps) {
  const [activeDiagram, setActiveDiagram] = useState<ActiveDiagram | null>(null);

  if (!blocks.length) {
    return null;
  }

  return (
    <section className={styles.boardSection} aria-label="Generated visual notes">
      <div className={styles.canvas}>
        <div className={styles.canvasInner}>
          <header className={styles.boardHeader}>
            <p className={styles.boardSubtitle}>Sketchbook</p>
            <h2 className={styles.boardTitle}>Generated Visual Notes</h2>
          </header>

          <Masonry
            breakpointCols={masonryBreakpoints}
            className={styles.masonryGrid}
            columnClassName={styles.masonryColumn}
          >
            {blocks.map((block, index) => {
              const accentKey = accentVariants[index % accentVariants.length];
              const accentClass = styles[accentKey];
              const key = block.id || `block-${index}`;

              return (
                <article key={key} className={`${styles.card} ${accentClass}`}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.title}>{block.title}</h3>
                  </div>

                  <div className={styles.markdown}>
                    <ReactMarkdown>{block.summary}</ReactMarkdown>
                  </div>

                  {block.visualType === 'diagram' && block.d2Code && (
                    <div className={styles.diagramSection}>
                      <DiagramRenderer
                        code={block.d2Code}
                        className={styles.diagramWrapper}
                      />
                      <button
                        type="button"
                        className={styles.diagramButton}
                        onClick={() =>
                          setActiveDiagram({
                            code: block.d2Code ?? '',
                            title: block.title || 'Diagram',
                          })
                        }
                      >
                        View full diagram
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </Masonry>
        </div>
      </div>
      {activeDiagram && (
        <DiagramModal
          code={activeDiagram.code}
          title={activeDiagram.title}
          onClose={() => setActiveDiagram(null)}
        />
      )}
    </section>
  );
}
