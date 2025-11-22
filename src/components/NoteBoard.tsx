'use client';

import { useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
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
const NODE_HEIGHT = 400;
const COLUMN_GAP = 120;
const ROW_GAP = 160;
const NODE_COLORS = [
  '#FFF6D9',
  '#E5F4FF',
  '#EAFBE7',
  '#FFF0F5',
  '#F3E8FF',
  '#FFEFE0',
];

export type NoteNodeData = { block: NoteBlock; accent: string };

function buildNodes(blocks: NoteBlock[]): Node<NoteNodeData>[] {
  return blocks.map((block, index) => {
    const column = index % COLUMN_COUNT;
    const row = Math.floor(index / COLUMN_COUNT);
    const x = column * (NODE_WIDTH + COLUMN_GAP);
    const y = row * (NODE_HEIGHT + ROW_GAP);
    const accent = NODE_COLORS[index % NODE_COLORS.length];

    return {
      id: block.id ?? `block-${index}`,
      type: 'note',
      data: { block, accent },
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
  const initialNodes = useMemo(() => buildNodes(blocks), [blocks]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  if (!blocks.length) {
    return null;
  }

  return (
    <section className={styles.boardSection} aria-label="Generated visual notes">
      <div className={styles.flowShell}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          className={styles.flowCanvas}
          defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
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
