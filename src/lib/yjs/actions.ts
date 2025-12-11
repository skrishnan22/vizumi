import { getOrCreateYDoc } from './doc';
import { Node, Edge } from 'reactflow';
import type { NoteBlock } from '@/lib/schemas';
import { blockToNode, buildEdgesFromBlocks, NoteNodeData } from './utils';

export function updateNode(noteId: string, nodeId: string, patch: Partial<Node>) {
    const doc = getOrCreateYDoc(noteId);
    doc.transact(() => {
        const yNodes = doc.getMap('nodes');
        const existing = yNodes.get(nodeId) as Node | undefined;

        if (existing) {
            yNodes.set(nodeId, { ...existing, ...patch });
        }
    });
}

export function updateNodePosition(noteId: string, nodeId: string, position: { x: number, y: number }) {
    updateNode(noteId, nodeId, { position });
}

export function addNode(noteId: string, node: Node) {
    const doc = getOrCreateYDoc(noteId);
    doc.transact(() => {
        const yNodes = doc.getMap('nodes');
        yNodes.set(node.id, node);
    });
}

export function removeNode(noteId: string, nodeId: string) {
    const doc = getOrCreateYDoc(noteId);
    doc.transact(() => {
        const yNodes = doc.getMap('nodes');
        yNodes.delete(nodeId);
    });
}

export function setEdges(noteId: string, edges: Edge[]) {
    const doc = getOrCreateYDoc(noteId);
    doc.transact(() => {
        const yEdges = doc.getMap('edges');
        yEdges.clear();
        edges.forEach(edge => {
            yEdges.set(edge.id, edge);
        });
    });
}

export function setNodes(noteId: string, nodes: Node[]) {
    const doc = getOrCreateYDoc(noteId);
    doc.transact(() => {
        const yNodes = doc.getMap('nodes');
        yNodes.clear();
        nodes.forEach(node => {
            yNodes.set(node.id, node);
        });
    });
}

// ============================================
// Phase 3: Streaming Helpers
// ============================================

/**
 * Add a node from a NoteBlock.
 * Used during LLM streaming to persist blocks as they arrive.
 */
export function addNodeFromBlock(
    noteId: string,
    block: NoteBlock,
    index: number,
    callbacks?: {
        onMeasure?: (id: string, height: number) => void;
        onSaveSummary?: (id: string, summary: string) => void;
        onOpenDrawer?: (id: string) => void;
    }
): void {
    const node = blockToNode(block, index, callbacks);
    addNode(noteId, node);
}

/**
 * Update the data portion of a node.
 * Used during streaming to update summary as it grows.
 */
export function updateNodeData(
    noteId: string,
    nodeId: string,
    dataPatch: Partial<NoteBlock>
): void {
    const doc = getOrCreateYDoc(noteId);
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
 * Add a single edge to Y.Doc.
 */
export function addEdge(noteId: string, edge: Edge): void {
    const doc = getOrCreateYDoc(noteId);
    doc.transact(() => {
        const yEdges = doc.getMap('edges');
        yEdges.set(edge.id, edge);
    });
}

/**
 * Sync a list of blocks to Y.Doc as nodes + edges.
 * Used for initial generation to bulk-write all blocks.
 */
export function syncBlocksToYDoc(
    noteId: string,
    blocks: NoteBlock[],
    callbacks?: {
        onMeasure?: (id: string, height: number) => void;
        onSaveSummary?: (id: string, summary: string) => void;
        onOpenDrawer?: (id: string) => void;
    }
): void {
    const doc = getOrCreateYDoc(noteId);
    doc.transact(() => {
        const yNodes = doc.getMap('nodes');
        const yEdges = doc.getMap('edges');

        // Clear existing and add new nodes
        yNodes.clear();
        blocks.forEach((block, index) => {
            const node = blockToNode(block, index, callbacks);
            yNodes.set(node.id, node);
        });

        // Build and add edges
        yEdges.clear();
        const edges = buildEdgesFromBlocks(blocks);
        edges.forEach(edge => {
            yEdges.set(edge.id, edge);
        });
    });
}
