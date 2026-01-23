import type { Node } from 'reactflow';

/**
 * Collision resolution algorithm based on ReactFlow's naive approach.
 * Runs in O(n²) which is fast for typical canvas sizes (<100 nodes).
 *
 * Reference: https://xyflow.com/blog/node-collision-detection-algorithms
 */

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ResolveCollisionsOptions {
  /** Minimum gap between nodes in pixels (default: 50) */
  margin?: number;
  /** Maximum iterations to prevent infinite loops (default: 100) */
  maxIterations?: number;
}

/**
 * Get node dimensions from various possible sources
 */
function getNodeDimensions(node: Node): { width: number; height: number } {
  // ReactFlow v11 stores actual rendered size under `measured`.
  // Fall back to explicit width/height (if provided), then node.data, then defaults.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeAny = node as any;

  const measuredWidth = nodeAny.measured?.width;
  const measuredHeight = nodeAny.measured?.height;

  const width = measuredWidth ?? nodeAny.width ?? node.data?.width ?? 380;
  const height = measuredHeight ?? nodeAny.height ?? node.data?.height ?? 300;

  return { width, height };
}

/**
 * Get node bounding rectangle with margin buffer
 */
function getNodeRect(node: Node, margin: number): Rect {
  const { width, height } = getNodeDimensions(node);

  // Add margin to create buffer zone around node
  return {
    x: node.position.x,
    y: node.position.y,
    width: width + margin,
    height: height + margin,
  };
}

/**
 * Calculate overlap between two rectangles
 * Returns { x: overlapX, y: overlapY } where positive values mean overlap
 */
function getOverlap(rectA: Rect, rectB: Rect): { x: number; y: number } {
  const overlapX =
    Math.min(rectA.x + rectA.width, rectB.x + rectB.width) - Math.max(rectA.x, rectB.x);
  const overlapY =
    Math.min(rectA.y + rectA.height, rectB.y + rectB.height) - Math.max(rectA.y, rectB.y);

  return {
    x: Math.max(0, overlapX),
    y: Math.max(0, overlapY),
  };
}

/**
 * Resolve node collisions by pushing overlapping nodes apart.
 *
 * Algorithm:
 * 1. Check all node pairs for overlap (O(n²))
 * 2. For overlapping pairs, find axis with smallest overlap
 * 3. Push nodes apart along that axis (split displacement evenly)
 * 4. Repeat until no overlaps remain (with max iteration limit)
 *
 * @param nodes - Array of ReactFlow nodes with positions
 * @param options - Configuration options
 * @returns New array of nodes with resolved positions
 */
export function resolveCollisions(nodes: Node[], options: ResolveCollisionsOptions = {}): Node[] {
  const { margin = 50, maxIterations = 100 } = options;

  if (nodes.length < 2) {
    return nodes;
  }

  // Clone nodes to avoid mutation
  const result = nodes.map((n) => ({
    ...n,
    position: { ...n.position },
  }));

  let iteration = 0;
  let hasOverlap = true;

  while (hasOverlap && iteration < maxIterations) {
    hasOverlap = false;
    iteration++;

    // Check all pairs for collisions
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const nodeA = result[i];
        const nodeB = result[j];

        // Get bounding boxes with margin
        const rectA = getNodeRect(nodeA, margin);
        const rectB = getNodeRect(nodeB, margin);

        // Calculate overlap
        const overlap = getOverlap(rectA, rectB);

        // If overlapping on both axes, resolve collision
        if (overlap.x > 0 && overlap.y > 0) {
          hasOverlap = true;

          // Push apart along axis with smaller overlap (easier to resolve)
          if (overlap.x < overlap.y) {
            // Move horizontally
            const shift = overlap.x / 2 + 1; // +1 to ensure separation
            if (nodeA.position.x < nodeB.position.x) {
              nodeA.position.x -= shift;
              nodeB.position.x += shift;
            } else {
              nodeA.position.x += shift;
              nodeB.position.x -= shift;
            }
          } else {
            // Move vertically
            const shift = overlap.y / 2 + 1; // +1 to ensure separation
            if (nodeA.position.y < nodeB.position.y) {
              nodeA.position.y -= shift;
              nodeB.position.y += shift;
            } else {
              nodeA.position.y += shift;
              nodeB.position.y -= shift;
            }
          }
        }
      }
    }
  }

  return result;
}
