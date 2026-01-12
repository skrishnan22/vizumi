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
  type NodeChange,
  type EdgeChange,
  type ReactFlowInstance,
  ReactFlowProvider,
  getNodesBounds,
  getViewportForBounds,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';

import { useGraphStore } from '@/store/graphStore';
import { updateNode as persistNode } from '@/lib/graph/actions';
import { CANVAS_EDGE_MARKER } from '@/lib/canvas/graph';
import { canvasEdgeTypes, canvasNodeTypes } from './flowConfig';

type CanvasDocBoardProps = {
  docId: string;
  isLoading?: boolean;
  showSkeletonCard?: boolean;
};

export type CanvasBoardHandle = {
  exportPng: () => Promise<string>;
};

function getNodeHeightForPlacement(node: Node): number {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeAny = node as any;
  return nodeAny.measured?.height ?? nodeAny.height ?? 300;
}

function buildSkeletonNode(nodes: Node[]): Node {
  if (nodes.length === 0) {
    return {
      id: '__skeleton__',
      type: 'skeletonCard',
      position: { x: 100, y: 100 },
      data: {},
      width: 340,
      height: 200,
      draggable: false,
      selectable: false,
    };
  }

  let maxY = 0;
  let nodeAtMaxY: Node | null = null;

  for (const node of nodes) {
    const nodeBottom = node.position.y + getNodeHeightForPlacement(node);
    if (nodeBottom > maxY) {
      maxY = nodeBottom;
      nodeAtMaxY = node;
    }
  }

  const skeletonX = nodeAtMaxY ? nodeAtMaxY.position.x : 100;
  const skeletonY = maxY + 80;

  return {
    id: '__skeleton__',
    type: 'skeletonCard',
    position: { x: skeletonX, y: skeletonY },
    data: {},
    width: 340,
    height: 200,
    draggable: false,
    selectable: false,
  };
}

const CanvasDocBoardInner = forwardRef<CanvasBoardHandle, CanvasDocBoardProps>(
  function CanvasDocBoardInner({ docId, isLoading, showSkeletonCard }, ref) {
    const nodes = useGraphStore((state) => state.nodes);
    const edges = useGraphStore((state) => state.edges);
    const updateNode = useGraphStore((state) => state.updateNode);

    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
    const fitViewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const renderNodes = useMemo(() => {
      const baseNodes = nodes.filter((node) => node.id !== '__skeleton__');

      if (!showSkeletonCard) {
        return baseNodes;
      }

      return [...baseNodes, buildSkeletonNode(baseNodes)];
    }, [nodes, showSkeletonCard]);

    const renderEdges = useMemo(() => {
      return edges.map((edge) => {
        const nextType = edge.type ?? 'chip';
        const nextMarker = edge.markerEnd ?? CANVAS_EDGE_MARKER;

        if (edge.type === nextType && edge.markerEnd === nextMarker) {
          return edge;
        }

        return {
          ...edge,
          type: nextType,
          markerEnd: nextMarker,
        };
      });
    }, [edges]);

    useEffect(() => {
      if (rfInstance && nodes.length > 0) {
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
    }, [nodes.length, rfInstance]);

    const handleNodesChange = useCallback(
      (changes: NodeChange[]) => {
        for (const change of changes) {
          if (change.id === '__skeleton__') continue;

          if (change.type === 'select') {
            updateNode(change.id, { selected: change.selected });
            continue;
          }

          if (change.type !== 'position') continue;

          if (change.dragging && change.position) {
            updateNode(change.id, { position: change.position });
            continue;
          }

          if (change.dragging === false) {
            const finalPosition =
              change.position ?? nodes.find((n) => n.id === change.id)?.position;
            if (!finalPosition) continue;
            persistNode(docId, change.id, { position: finalPosition });
          }
        }
      },
      [docId, nodes, updateNode]
    );

    const handleEdgesChange = useCallback((_changes: EdgeChange[]) => {}, []);

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

    const hasRenderableNodes = renderNodes.length > 0;
    const showLoading = isLoading && !hasRenderableNodes;

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
          nodes={renderNodes}
          edges={renderEdges}
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

        {showLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-50/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-stone-300 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-stone-600 font-medium">Generating canvas...</p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export const CanvasDocBoard = forwardRef<CanvasBoardHandle, CanvasDocBoardProps>(
  function CanvasDocBoard(props, ref) {
    return (
      <ReactFlowProvider>
        <CanvasDocBoardInner {...props} ref={ref} />
      </ReactFlowProvider>
    );
  }
);
