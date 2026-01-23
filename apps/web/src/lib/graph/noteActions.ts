import type { Edge, Node } from 'reactflow';
import type { NoteBlock } from '@/lib/schemas';
import { calculateLayout } from '@/lib/layout/elkLayout';
import { blockToNode, buildEdgesFromBlocks, type NoteNodeData } from './noteUtils';
import { getOrCreateGraphDoc } from './doc';
import { setGraph, updateNode } from './actions';

export function updateNodePosition(
  docId: string,
  nodeId: string,
  position: { x: number; y: number }
): void {
  getOrCreateGraphDoc(docId, 'note');
  updateNode(docId, nodeId, { position });
}

/**
 * Update the data portion of a note node.
 * Used during streaming to update summary as it grows.
 */
export function updateNodeData(docId: string, nodeId: string, dataPatch: Partial<NoteBlock>): void {
  const { doc } = getOrCreateGraphDoc(docId, 'note');
  doc.transact(() => {
    const yNodes = doc.getMap('nodes');
    const existing = yNodes.get(nodeId) as Node<NoteNodeData> | undefined;

    if (existing) {
      yNodes.set(nodeId, {
        ...existing,
        data: {
          ...existing.data,
          block: {
            ...existing.data.block,
            ...dataPatch,
          },
        },
      });
    }
  });
}

/**
 * Add a node from a NoteBlock with automatic layout calculation.
 * Used during deep dive or when adding individual nodes.
 */
export async function addNodeFromBlock(
  docId: string,
  block: NoteBlock,
  index: number,
  callbacks?: {
    onMeasure?: (id: string, height: number) => void;
    onSaveSummary?: (id: string, summary: string) => void;
    onOpenDrawer?: (id: string) => void;
    onSaveRenderedSvg?: (id: string, svg: string) => void;
    onUpdateBlockData?: (id: string, data: Partial<NoteBlock>) => void;
  }
): Promise<void> {
  const { doc } = getOrCreateGraphDoc(docId, 'note');

  const yNodes = doc.getMap('nodes');
  const yEdges = doc.getMap('edges');
  const existingNodes = Array.from(yNodes.values()) as Node<NoteNodeData>[];
  const existingEdges = Array.from(yEdges.values()) as Edge[];

  const newNode = blockToNode(block, index, callbacks);

  let newEdge: Edge | null = null;
  if (block.parentId) {
    newEdge = {
      id: `edge-${block.parentId}-${block.id}`,
      source: block.parentId,
      target: block.id ?? `block-${index}`,
      type: 'default',
      animated: false,
      style: { stroke: '#64748b', strokeWidth: 3 },
    };
  }

  const allNodes = [...existingNodes, newNode];
  const allEdges = newEdge ? [...existingEdges, newEdge] : existingEdges;

  const layouted = await calculateLayout(allNodes, allEdges);
  setGraph(docId, layouted.nodes, layouted.edges);
}

/**
 * Sync a list of blocks to the shared graph doc.
 * Used for initial generation to bulk-write all blocks.
 */
export async function syncBlocksToGraph(
  docId: string,
  blocks: NoteBlock[],
  callbacks?: {
    onMeasure?: (id: string, height: number) => void;
    onSaveSummary?: (id: string, summary: string) => void;
    onOpenDrawer?: (id: string) => void;
    onSaveRenderedSvg?: (id: string, svg: string) => void;
    onUpdateBlockData?: (id: string, data: Partial<NoteBlock>) => void;
  }
): Promise<void> {
  const nodes = blocks.map((block, index) => blockToNode(block, index, callbacks));
  const edges = buildEdgesFromBlocks(blocks);
  const layouted = await calculateLayout(nodes, edges);

  getOrCreateGraphDoc(docId, 'note');
  setGraph(docId, layouted.nodes, layouted.edges);
}
