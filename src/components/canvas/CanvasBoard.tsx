'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';

import { WhiteboardCard } from './nodes/WhiteboardCard';
import { ChipEdge } from './edges/ChipEdge';
import type { ProcessedCard, CanvasEdge as CanvasEdgeType } from '@/lib/canvas/schemas-v2';
import { calculateLayout } from '@/lib/canvas/layout';

const nodeTypes = {
  whiteboardCard: WhiteboardCard,
} as const;

const edgeTypes = {
  chip: ChipEdge,
} as const;

type CanvasBoardProps = {
  cards: ProcessedCard[];
  edges: CanvasEdgeType[];
  layoutType: 'hierarchical' | 'layered' | 'radial' | 'grid';
  isLoading?: boolean;
};

export function CanvasBoard({ cards, edges, layoutType, isLoading }: CanvasBoardProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [flowEdges, setFlowEdges] = useState<Edge[]>([]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [isLayouting, setIsLayouting] = useState(false);
  const fitViewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (cards.length === 0) {
      setNodes([]);
      setFlowEdges([]);
      return;
    }

    setIsLayouting(true);
    calculateLayout(cards, edges, layoutType)
      .then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
        const processedEdges: Edge[] = layoutedEdges.map((edge) => ({
          ...edge,
          type: 'chip',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#94a3b8',
          },
        }));
        setNodes(layoutedNodes);
        setFlowEdges(processedEdges);
      })
      .finally(() => setIsLayouting(false));
  }, [cards, edges, layoutType]);

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

  return (
    <div
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
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
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
}
