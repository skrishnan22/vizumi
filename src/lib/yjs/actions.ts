import { getOrCreateYDoc } from './doc';
import { Node, Edge } from 'reactflow';
import type { NoteBlock } from '@/lib/schemas';
import { blockToNode, buildEdgesFromBlocks, NoteNodeData } from './utils';
import { calculateLayout } from '@/lib/layout/elkLayout';

export function updateNode(noteId: string, nodeId: string, patch: Partial<Node>) {
    const { doc } = getOrCreateYDoc(noteId);
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
    const { doc } = getOrCreateYDoc(noteId);
    doc.transact(() => {
        const yNodes = doc.getMap('nodes');
        yNodes.set(node.id, node);
    });
}

export function removeNode(noteId: string, nodeId: string) {
    const { doc } = getOrCreateYDoc(noteId);
    doc.transact(() => {
        const yNodes = doc.getMap('nodes');
        yNodes.delete(nodeId);
    });
}

export function setEdges(noteId: string, edges: Edge[]) {
    const { doc } = getOrCreateYDoc(noteId);
    doc.transact(() => {
        const yEdges = doc.getMap('edges');
        yEdges.clear();
        edges.forEach(edge => {
            yEdges.set(edge.id, edge);
        });
    });
}

export function setNodes(noteId: string, nodes: Node[]) {
    const { doc } = getOrCreateYDoc(noteId);
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
 * Add a node from a NoteBlock with automatic layout calculation.
 * Used during deep dive or when adding individual nodes.
 *
 * This recalculates layout for ALL nodes to place the new one correctly.
 */
export async function addNodeFromBlock(
    noteId: string,
    block: NoteBlock,
    index: number,
    callbacks?: {
        onMeasure?: (id: string, height: number) => void;
        onSaveSummary?: (id: string, summary: string) => void;
        onOpenDrawer?: (id: string) => void;
        onSaveRenderedSvg?: (id: string, svg: string) => void;
    }
): Promise<void> {
    const { doc } = getOrCreateYDoc(noteId);

    // Get existing nodes and edges
    const yNodes = doc.getMap('nodes');
    const yEdges = doc.getMap('edges');
    const existingNodes = Array.from(yNodes.values()) as Node<NoteNodeData>[];
    const existingEdges = Array.from(yEdges.values()) as Edge[];

    // Create the new node
    const newNode = blockToNode(block, index, callbacks);

    // Create the new edge if there's a parent
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

    // Combine with existing
    const allNodes = [...existingNodes, newNode];
    const allEdges = newEdge ? [...existingEdges, newEdge] : existingEdges;

    // Recalculate layout for all nodes
    const layouted = await calculateLayout(allNodes, allEdges);

    // Write back to Y.Doc
    doc.transact(() => {
        yNodes.clear();
        layouted.nodes.forEach(node => {
            yNodes.set(node.id, node);
        });

        yEdges.clear();
        layouted.edges.forEach(edge => {
            yEdges.set(edge.id, edge);
        });
    });
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
    const { doc } = getOrCreateYDoc(noteId);
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
 * Sync a list of blocks to Y.Doc as nodes + edges.
 * Used for initial generation to bulk-write all blocks.
* Calculates layout BEFORE writing to Y.Doc.
 * This prevents the render → layout → write → render loop.
 */
export async function syncBlocksToYDoc(
    noteId: string,
    blocks: NoteBlock[],
    callbacks?: {
        onMeasure?: (id: string, height: number) => void;
        onSaveSummary?: (id: string, summary: string) => void;
        onOpenDrawer?: (id: string) => void;
        onSaveRenderedSvg?: (id: string, svg: string) => void;
    }
): Promise<void> {
    const nodes = blocks.map((block, index) => blockToNode(block, index, callbacks));
    const edges = buildEdgesFromBlocks(blocks);

    const layouted = await calculateLayout(nodes, edges);

    const { doc } = getOrCreateYDoc(noteId);
    doc.transact(() => {
        const yNodes = doc.getMap('nodes');
        const yEdges = doc.getMap('edges');

        yNodes.clear();
        layouted.nodes.forEach(node => {
            yNodes.set(node.id, node);
        });

        yEdges.clear();
        layouted.edges.forEach(edge => {
            yEdges.set(edge.id, edge);
        });
    });
}
