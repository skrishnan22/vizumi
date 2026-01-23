import { WhiteboardCard } from './nodes/WhiteboardCard';
import { SkeletonCard } from './nodes/SkeletonCard';
import { ChipEdge } from './edges/ChipEdge';

export const canvasNodeTypes = {
  whiteboardCard: WhiteboardCard,
  skeletonCard: SkeletonCard,
} as const;

export const canvasEdgeTypes = {
  chip: ChipEdge,
} as const;
