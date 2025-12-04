import { getOrCreateYDoc } from './doc';
import { Node, Edge } from 'reactflow';

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
