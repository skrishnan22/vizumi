'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
} from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type ReactFlowInstance,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  ReactFlowProvider,
  useNodesInitialized,
  getNodesBounds,
  getViewportForBounds,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';

import { canvasNodeTypes, canvasEdgeTypes } from './flowConfig';
import type { ProcessedCard, CanvasEdge as CanvasEdgeType } from '@/lib/canvas/schemas-v2';
import { calculateLayout } from '@/lib/canvas/layout';

type CanvasBoardProps = {
  cards: ProcessedCard[];
  edges: CanvasEdgeType[];
  layoutType: 'hierarchical' | 'layered' | 'radial' | 'grid';
  isLoading?: boolean;
  showSkeletonCard?: boolean;
};

type NodeDimensions = Record<string, { width: number; height: number }>;

type LayoutResult = { nodes: Node[]; edges: Edge[] };

export type CanvasBoardHandle = {
  exportPng: () => Promise<string>;
};

function buildNodeDimensions(nodes: Node[]): NodeDimensions {
  const dims: NodeDimensions = {};

  for (const node of nodes) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodeAny = node as any;

    const width = nodeAny.measured?.width ?? nodeAny.width;
    const height = nodeAny.measured?.height ?? nodeAny.height;

    if (typeof width === 'number' && typeof height === 'number' && width > 0 && height > 0) {
      dims[node.id] = { width, height };
    }
  }

  return dims;
}

function getNodeHeightForPlacement(node: Node): number {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeAny = node as any;
  return nodeAny.measured?.height ?? nodeAny.height ?? 300;
}

const CanvasBoardInner = forwardRef<CanvasBoardHandle, CanvasBoardProps>(function CanvasBoardInner(
  { cards, edges, layoutType, isLoading, showSkeletonCard },
  ref
) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [flowEdges, setFlowEdges] = useState<Edge[]>([]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [isLayouting, setIsLayouting] = useState(false);
  const fitViewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const nodesInitialized = useNodesInitialized();

  const layoutKey = useMemo(() => {
    const cardIds = cards.map((c) => c.id).join(',');
    const edgeIds = edges.map((e) => e.id).join(',');
    return `${layoutType}|${cardIds}|${edgeIds}`;
  }, [cards, edges, layoutType]);

  const rfEdgesInput: Edge[] = useMemo(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
      })),
    [edges]
  );

  const applyLayoutResult = useCallback(
    ({ nodes: layoutedNodes, edges: layoutedEdges }: LayoutResult) => {
      const processedEdges: Edge[] = layoutedEdges.map((edge) => ({
        ...edge,
        type: 'chip',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#94a3b8',
        },
      }));

      let finalNodes = layoutedNodes;

      if (showSkeletonCard) {
        let maxY = 0;
        let nodeAtMaxY: Node | null = null;

        for (const node of layoutedNodes) {
          const nodeBottom = node.position.y + getNodeHeightForPlacement(node);
          if (nodeBottom > maxY) {
            maxY = nodeBottom;
            nodeAtMaxY = node;
          }
        }

        const skeletonX = nodeAtMaxY ? nodeAtMaxY.position.x : 100;
        const skeletonY = maxY + 80;

        const skeletonNode: Node = {
          id: '__skeleton__',
          type: 'skeletonCard',
          position: { x: skeletonX, y: skeletonY },
          data: {},
          width: 340,
          height: 200,
        };

        finalNodes = [...layoutedNodes, skeletonNode];
      }

      setNodes(finalNodes);
      setFlowEdges(processedEdges);
    },
    [showSkeletonCard]
  );

  // We want to run a second layout pass (once) after ReactFlow has measured node sizes.
  const measuredRelayoutKeyRef = useRef<string | null>(null);

  useEffect(() => {
    // Reset the "measured" pass whenever the input graph changes.
    measuredRelayoutKeyRef.current = null;
  }, [layoutKey]);

  useEffect(() => {
    if (cards.length === 0 && !showSkeletonCard) {
      setNodes([]);
      setFlowEdges([]);
      return;
    }

    // If we only have skeleton to show (no cards yet during streaming), show it immediately.
    if (cards.length === 0 && showSkeletonCard) {
      const skeletonNode: Node = {
        id: '__skeleton__',
        type: 'skeletonCard',
        position: { x: 100, y: 100 },
        data: {},
        width: 340,
        height: 200,
      };
      setNodes([skeletonNode]);
      setFlowEdges([]);
      return;
    }

    let isCancelled = false;

    setIsLayouting(true);
    calculateLayout(cards, rfEdgesInput, layoutType)
      .then((result) => {
        if (isCancelled) return;
        applyLayoutResult(result);
      })
      .finally(() => {
        if (!isCancelled) setIsLayouting(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [cards, rfEdgesInput, layoutType, showSkeletonCard, applyLayoutResult]);

  useEffect(() => {
    if (!nodesInitialized) return;
    if (cards.length === 0) return;
    if (isLoading) return;

    // Wait for at least one node to have measurements.
    const nodeDimensions = buildNodeDimensions(nodes);
    if (Object.keys(nodeDimensions).length === 0) return;

    const hasAllCardDimensions = cards.every((card) => nodeDimensions[card.id]);
    if (!hasAllCardDimensions) return;

    // Only once per input graph after streaming completes.
    if (measuredRelayoutKeyRef.current === layoutKey) return;
    measuredRelayoutKeyRef.current = layoutKey;

    let isCancelled = false;

    setIsLayouting(true);
    calculateLayout(cards, rfEdgesInput, layoutType, nodeDimensions)
      .then((result) => {
        if (isCancelled) return;
        applyLayoutResult(result);
      })
      .finally(() => {
        if (!isCancelled) setIsLayouting(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [
    nodesInitialized,
    layoutKey,
    nodes,
    cards,
    rfEdgesInput,
    layoutType,
    applyLayoutResult,
    isLoading,
  ]);

  useEffect(() => {
    if (rfInstance && nodes.length > 0 && !isLayouting) {
      if (fitViewTimeoutRef.current) {
        clearTimeout(fitViewTimeoutRef.current);
      }
      fitViewTimeoutRef.current = setTimeout(() => {
        rfInstance.fitView({ padding: 0.15, duration: 500 });
      }, 100);
    }

    return () => {
      if (fitViewTimeoutRef.current) clearTimeout(fitViewTimeoutRef.current);
    };
  }, [nodes.length, rfInstance, isLayouting]);

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    setFlowEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const showLoading = isLoading || isLayouting;

  useImperativeHandle(
    ref,
    () => ({
      exportPng: async () => {
        const viewport = wrapperRef.current?.querySelector(
          '.react-flow__viewport'
        ) as HTMLElement | null;

        if (!viewport || nodes.length === 0) {
          throw new Error('Canvas is not ready to export.');
        }

        const bounds = getNodesBounds(nodes);
        const padding = 120;
        const width = Math.max(bounds.width + padding * 2, 1000);
        const height = Math.max(bounds.height + padding * 2, 700);
        const view = getViewportForBounds(bounds, width, height, 0.1, 2, 0.1);

        return toPng(viewport, {
          width,
          height,
          backgroundColor: '#fafaf9',
          style: {
            width: `${width}px`,
            height: `${height}px`,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
          },
        });
      },
    }),
    [nodes]
  );

  return (
    <div
      ref={wrapperRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={flowEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        nodeTypes={canvasNodeTypes}
        edgeTypes={canvasEdgeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable
        nodesConnectable={false}
        panOnScroll
        panOnDrag
        fitView
        onInit={setRfInstance}
        className="bg-stone-50"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="rgba(28,26,23,0.15)"
        />
        <Controls className="!bg-white !border-stone-200 !shadow-lg" />
        <MiniMap
          className="!bg-white !border-stone-200"
          nodeColor={() => '#0d9488'}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>

      {showLoading && nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-50/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-stone-300 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-stone-600 font-medium">
              {isLoading ? 'Generating canvas...' : 'Calculating layout...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

export const CanvasBoard = forwardRef<CanvasBoardHandle, CanvasBoardProps>(
  function CanvasBoard(props, ref) {
    return (
      <ReactFlowProvider>
        <CanvasBoardInner {...props} ref={ref} />
      </ReactFlowProvider>
    );
  }
);
