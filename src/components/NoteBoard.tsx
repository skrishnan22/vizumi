'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  NodeChange,
  useEdgesState,
  useNodesState,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { NoteBlock } from '@/lib/schemas';
import { NoteBlockNode } from './NoteBlockNode';
import styles from './NoteBoard.module.css';

type NoteBoardProps = {
  blocks: NoteBlock[];
};

const COLUMN_COUNT = 3;
const NODE_WIDTH = 320;
const NODE_HEIGHT = 440;
const COLUMN_GAP = 120;
const ROW_GAP = 190;
const NODE_COLORS = [
  '#FFF6D9',
  '#E5F4FF',
  '#EAFBE7',
  '#FFF0F5',
  '#F3E8FF',
  '#FFEFE0',
];

export type NoteNodeData = {
  block: NoteBlock;
  accent: string;
  onMeasure?: (id: string, height: number) => void;
};

function buildNodes(
  blocks: NoteBlock[],
  onMeasure: (id: string, height: number) => void,
): Node<NoteNodeData>[] {
  return blocks.map((block, index) => {
    const column = index % COLUMN_COUNT;
    const row = Math.floor(index / COLUMN_COUNT);
    const x = column * (NODE_WIDTH + COLUMN_GAP);
    const y = row * (NODE_HEIGHT + ROW_GAP);
    const accent = NODE_COLORS[index % NODE_COLORS.length];

    return {
      id: block.id ?? `block-${index}`,
      type: 'note',
      data: { block, accent, onMeasure },
      position: { x, y },
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      },
    };
  });
}

const nodeTypes = {
  note: NoteBlockNode,
};

export function NoteBoard({ blocks }: NoteBoardProps) {
  const [contentHeights, setContentHeights] = useState<Record<string, number>>({});
  const [autoLayoutEnabled, setAutoLayoutEnabled] = useState(true);
  const onMeasure = useCallback((nodeId: string, height: number) => {
    setContentHeights((prev) => {
      if (Math.abs((prev[nodeId] ?? 0) - height) < 1) {
        return prev;
      }
      return { ...prev, [nodeId]: height };
    });
  }, []);

  const initialNodes = useMemo(
    () => buildNodes(blocks, onMeasure),
    [blocks, onMeasure],
  );

  const [nodes, setNodes, internalOnNodesChange] = useNodesState(initialNodes);
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      internalOnNodesChange(changes);
      if (
        changes.some(
          (change) =>
            change.type === 'position' ||
            change.type === 'dimensions' ||
            change.type === 'select',
        )
      ) {
        setAutoLayoutEnabled(false);
      }
    },
    [internalOnNodesChange],
  );
  const [edges, , onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setContentHeights({});
      setAutoLayoutEnabled(true);
      setNodes(initialNodes);
    });
    return () => cancelAnimationFrame(frame);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    if (!blocks.length || !autoLayoutEnabled || !nodes.length) {
      return;
    }

    const allMeasured = nodes.every((node) => contentHeights[node.id] != null);
    if (!allMeasured) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const columnHeights = new Array(COLUMN_COUNT).fill(0);
      setNodes((current) =>
        current.map((node, index) => {
          const column = index % COLUMN_COUNT;
          const height = contentHeights[node.id] ?? NODE_HEIGHT;
          const x = column * (NODE_WIDTH + COLUMN_GAP);
          const y = columnHeights[column];
          columnHeights[column] += height + ROW_GAP;

          return {
            ...node,
            position: { x, y },
            style: {
              ...node.style,
              width: NODE_WIDTH,
              height,
            },
          };
        }),
      );

    });

    return () => cancelAnimationFrame(frame);
  }, [autoLayoutEnabled, blocks.length, contentHeights, nodes, setNodes]);

  if (!blocks.length) {
    return null;
  }

  return (
    <section className={styles.boardSection} aria-label="Generated visual notes">
      <div className={styles.flowShell}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          className={styles.flowCanvas}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.35}
          maxZoom={1.5}
          nodesDraggable
          nodesConnectable={false}
          panOnScroll
          panOnDrag
        >
          <Background gap={24} color="#e2dcd4" />
        </ReactFlow>
      </div>
    </section>
  );
}
