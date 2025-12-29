'use client';

import { useCallback, useLayoutEffect, useRef, useState, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { NodeResizer, Handle, Position, NodeToolbar, type NodeProps } from 'reactflow';
import styles from './NoteBoard.module.css';
import { DiagramRenderer } from './DiagramRenderer';
import { DiagramModal } from './DiagramModal';
import type { NoteNodeData } from '@/lib/yjs/utils';
import { Edit3, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useNoteStore } from '@/store/noteStore';
import {
  getModeIcon,
  getModeTitle,
  type DeepDiveMode,
  getDeepDiveColors,
} from '@/lib/deepDiveHelpers';
import { useDeepDive } from '@/hooks/useDeepDive';

const NoteEditor = dynamic(() => import('./NoteEditor').then((mod) => mod.NoteEditor), {
  ssr: false,
  loading: () => <div className={`${styles.editorLoading} nodrag nopan`}>Preparing editor…</div>,
});

/**
 * NoteBlockNode component - Wrapped in memo for performance.
 *
 * React.memo prevents re-renders when props haven't changed.
 * Combined with stable callbacks from parent, this ensures only
 * nodes with actual changes re-render (not ALL nodes on every update).
 */
function NoteBlockNodeComponent({ id, data, selected }: NodeProps<NoteNodeData>) {
  const {
    block,
    accent,
    onMeasure,
    onSaveSummary,
    onSaveRenderedSvg,
    onUpdateBlockData,
    onOpenDrawer,
    sessionModel,
  } = data;

  const nodeRef = useRef<HTMLDivElement | null>(null);
  const isDeepDiveStreaming = useNoteStore((state) => state.isDeepDiveStreaming);
  const isGenerating = useNoteStore((state) => state.isGenerating);
  const { requestDeepDive } = useDeepDive(data.sessionModel);

  // Only render diagram when we have complete d2Code (not while streaming)
  const hasDiagram = block.d2Code && Boolean(block.d2Code?.trim()) && !isGenerating;
  const hasSvgReady = block.renderedSvg && Boolean(block.renderedSvg?.trim());

  // Callback to clear d2Code when rendering fails
  const handleDiagramFailure = useCallback(() => {
    // Clear both d2Code and renderedSvg to prevent retry on next load
    onUpdateBlockData?.(id, { d2Code: undefined, renderedSvg: undefined });
  }, [id, onUpdateBlockData]);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(block.summary);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Show toolbar only for content blocks (not deep dive blocks)
  const showToolbar = selected && block.blockType === 'content';

  const handleDeepDive = (mode: DeepDiveMode) => {
    requestDeepDive(id, mode);
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

  // Determine colors and icons
  const isDeepDive = block.blockType === 'deep-dive';
  const deepDiveColors = isDeepDive ? getDeepDiveColors(block.deepDiveMode) : null;
  const backgroundColor = isDeepDive ? deepDiveColors?.bg : accent;
  const borderColor = isDeepDive ? deepDiveColors?.border : 'transparent';
  const textColor = isDeepDive ? deepDiveColors?.text : 'inherit';

  // Helper to render toolbar button with icon
  const renderToolbarButton = (mode: DeepDiveMode, title: string) => {
    const Icon = getModeIcon(mode);
    const colors = getDeepDiveColors(mode);

    return (
      <button
        onClick={() => handleDeepDive(mode)}
        disabled={isDeepDiveStreaming}
        className={styles.toolbarButton}
        title={title}
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          fontWeight: 500,
        }}
      >
        <Icon className="w-4 h-4" /> {getModeTitle(mode)}
      </button>
    );
  };

  return (
    <div
      className={styles.nodeCard}
      style={{
        backgroundColor,
        borderColor,
        borderWidth: isDeepDive ? 2 : 0,
        color: textColor,
      }}
      ref={nodeRef}
      data-block-type={block.blockType}
    >
      {/* Multiple handles on all sides for radial layout */}
      <Handle type="source" position={Position.Top} id="source-top" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="source-right" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="source-bottom" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="source-left" style={{ opacity: 0 }} />

      <Handle type="target" position={Position.Top} id="target-top" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Right} id="target-right" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Bottom} id="target-bottom" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="target-left" style={{ opacity: 0 }} />

      {/* Deep Dive Toolbar - only shows for content blocks when selected */}
      <NodeToolbar isVisible={showToolbar} position={Position.Top} offset={10}>
        <div className={styles.deepDiveToolbar} onMouseDown={(e) => e.stopPropagation()}>
          {renderToolbarButton('eli5', "Explain Like I'm 5")}
          {renderToolbarButton('analogy', 'Create an Analogy')}
          {renderToolbarButton('mental-model', 'Build a Mental Model')}
        </div>
      </NodeToolbar>

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
        {/* Badge for deep dive nodes */}
        {isDeepDive &&
          (() => {
            const BadgeIcon = getModeIcon(block.deepDiveMode);
            return (
              <div className={styles.deepDiveBadge} style={{ color: deepDiveColors?.accent }}>
                <BadgeIcon className="w-5 h-5" />
              </div>
            );
          })()}
        <div className={styles.nodeHeader}>
          <h3 className={styles.nodeTitle} style={{ color: isDeepDive ? textColor : undefined }}>
            {block.title}
          </h3>
          <button
            type="button"
            className={styles.editButton}
            onClick={() => {
              setDraft(block.summary);
              setIsEditing(true);
            }}
            aria-label="Edit summary"
            style={{ color: isDeepDive ? textColor : undefined }}
          >
            <Edit3 size={16} />
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
        ) : block.blockType === 'deep-dive' ? (
          <div className={styles.deepDiveContent}>
            <div className={styles.clippedText}>
              <ReactMarkdown>{block.summary}</ReactMarkdown>
            </div>
            {block.isStreaming ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                Generating...
              </div>
            ) : (
              <button
                type="button"
                className={styles.readMoreButton}
                onClick={() => onOpenDrawer?.(id)}
                aria-label="Read more"
                style={{ color: deepDiveColors?.accent }}
              >
                Read more <ChevronRight className="w-3 h-3 inline ml-1" />
              </button>
            )}
          </div>
        ) : (
          <div className={styles.nodeBody}>
            <ReactMarkdown>{block.summary}</ReactMarkdown>
          </div>
        )}
        {hasDiagram && (
          <div
            className={hasSvgReady ? styles.diagramPreviewButton : styles.nodeDiagramWrapper}
            onClick={hasSvgReady ? () => setIsModalOpen(true) : undefined}
            role={hasSvgReady ? 'button' : undefined}
            tabIndex={hasSvgReady ? 0 : undefined}
            aria-label={hasSvgReady ? 'Open diagram in modal' : undefined}
            style={
              hasSvgReady ? { cursor: 'pointer' } : { visibility: 'hidden', position: 'absolute' }
            }
          >
            <DiagramRenderer
              key={block.id}
              code={block.d2Code ?? ''}
              cachedSvg={block.renderedSvg}
              className={styles.nodeDiagram}
              model={sessionModel}
              onSuccess={() => requestAnimationFrame(() => measureHeight())}
              onSvgRendered={(svg) => onSaveRenderedSvg?.(id, svg)}
              onRenderFailure={handleDiagramFailure}
            />
          </div>
        )}
      </div>
      {isModalOpen && block.d2Code && (
        <DiagramModal
          code={block.d2Code}
          cachedSvg={block.renderedSvg}
          title={block.title || 'Diagram'}
          model={sessionModel}
          onClose={() => setIsModalOpen(false)}
          onSvgRendered={(svg) => onSaveRenderedSvg?.(id, svg)}
          onRenderFailure={handleDiagramFailure}
        />
      )}
    </div>
  );
}

/**
 * Memoized export of NoteBlockNode.
 *
 * React.memo does shallow comparison of props:
 * - id (string): Compared by value
 * - data.block, data.accent: Compared by reference
 * - data.onMeasure, data.onSaveSummary, data.onOpenDrawer: Stable callback references
 * - selected (boolean): Compared by value
 *
 * This means a node only re-renders when:
 * 1. Its own data changes (block content updated)
 * 2. Selection state changes (user clicks it)
 * 3. Callbacks change (shouldn't happen - they're stable)
 *
 * NOT when other nodes change!
 */
export const NoteBlockNode = memo(NoteBlockNodeComponent);
