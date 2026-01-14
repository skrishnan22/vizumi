import type { Edge, Node } from 'reactflow';
import type * as Y from 'yjs';
import { getOrCreateGraphDoc } from './doc';

export type GraphMetaValue = string | number | boolean;
export type GraphMetaPatch = Record<string, GraphMetaValue | undefined>;

function applyMetaPatch(meta: Y.Map<GraphMetaValue>, metaPatch?: GraphMetaPatch) {
  if (!metaPatch) return;

  Object.entries(metaPatch).forEach(([key, value]) => {
    if (value === undefined) {
      meta.delete(key);
    } else {
      meta.set(key, value);
    }
  });
}

export function setGraph(
  docId: string,
  nodes: Node[],
  edges: Edge[],
  metaPatch?: GraphMetaPatch
): void {
  const { doc } = getOrCreateGraphDoc(docId);

  doc.transact(() => {
    const yNodes = doc.getMap('nodes');
    const yEdges = doc.getMap('edges');
    const yMeta = doc.getMap<GraphMetaValue>('meta');

    yNodes.clear();
    nodes.forEach((node) => {
      yNodes.set(node.id, node);
    });

    yEdges.clear();
    edges.forEach((edge) => {
      yEdges.set(edge.id, edge);
    });

    applyMetaPatch(yMeta, metaPatch);
  });
}

export function updateNode(docId: string, nodeId: string, patch: Partial<Node>): void {
  const { doc } = getOrCreateGraphDoc(docId);
  doc.transact(() => {
    const yNodes = doc.getMap('nodes');
    const existing = yNodes.get(nodeId) as Node | undefined;

    if (existing) {
      yNodes.set(nodeId, { ...existing, ...patch });
    }
  });
}

export function updateEdge(docId: string, edgeId: string, patch: Partial<Edge>): void {
  const { doc } = getOrCreateGraphDoc(docId);
  doc.transact(() => {
    const yEdges = doc.getMap('edges');
    const existing = yEdges.get(edgeId) as Edge | undefined;

    if (existing) {
      yEdges.set(edgeId, { ...existing, ...patch });
    }
  });
}

export function setMeta(docId: string, metaPatch: GraphMetaPatch): void {
  const { doc } = getOrCreateGraphDoc(docId);
  doc.transact(() => {
    const yMeta = doc.getMap<GraphMetaValue>('meta');
    applyMetaPatch(yMeta, metaPatch);
  });
}
