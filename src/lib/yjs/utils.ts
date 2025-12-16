import { type Node, type Edge, MarkerType } from 'reactflow';
import type { NoteBlock } from '@/lib/schemas';
import { getDeepDiveAccent } from '@/lib/deepDiveHelpers';

const NODE_WIDTH = 320;
const NODE_HEIGHT = 440;
const NODE_COLORS = [
    '#FFF6D9',
    '#E5F4FF',
    '#EAFBE7',
    '#FFF0F5',
    '#F3E8FF',
    '#FFEFE0',
];

export type NoteNodeData = {
    block: NoteBlock;
    accent: string;
    onMeasure?: (id: string, height: number) => void;
    onSaveSummary?: (id: string, summary: string) => void;
    onOpenDrawer?: (id: string) => void;
    onSaveRenderedSvg?: (id: string, svg: string) => void;
    onUpdateBlockData?: (id: string, data: Partial<NoteBlock>) => void;
};

/**
 * Convert a NoteBlock to a React Flow Node.
 * This is the single source of truth for block → node conversion.
 */
export function blockToNode(
    block: NoteBlock,
    index: number,
    callbacks?: {
        onMeasure?: (id: string, height: number) => void;
        onSaveSummary?: (id: string, summary: string) => void;
        onOpenDrawer?: (id: string) => void;
        onSaveRenderedSvg?: (id: string, svg: string) => void;
        onUpdateBlockData?: (id: string, data: Partial<NoteBlock>) => void;
    }
): Node<NoteNodeData> {
    const accent = block.blockType === 'deep-dive'
        ? getDeepDiveAccent(block.deepDiveMode)
        : NODE_COLORS[index % NODE_COLORS.length];

    return {
        id: block.id ?? `block-${index}`,
        type: 'note',
        data: {
            block,
            accent,
            onMeasure: callbacks?.onMeasure,
            onSaveSummary: callbacks?.onSaveSummary,
            onOpenDrawer: callbacks?.onOpenDrawer,
            onSaveRenderedSvg: callbacks?.onSaveRenderedSvg,
            onUpdateBlockData: callbacks?.onUpdateBlockData,
        },
        position: { x: 0, y: 0 },
        style: {
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
        },
    };
}

/**
 * Build edges from a list of nodes based on their parent-child relationships.
 */
export function buildEdgesFromBlocks(blocks: NoteBlock[]): Edge[] {
    return blocks
        .filter(block => block.parentId)
        .map(block => ({
            id: `edge-${block.parentId}-${block.id}`,
            source: block.parentId!,
            target: block.id ?? `block-${blocks.indexOf(block)}`,
            type: 'default',
            animated: false,
            style: { stroke: '#64748b', strokeWidth: 3 },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#64748b',
            },
        }));
}

/**
 * Extract NoteBlock from a React Flow Node.
 */
export function nodeToBlock(node: Node<NoteNodeData>): NoteBlock {
    return node.data.block;
}

/**
 * Create a debounced version of a function.
 */
export function debounce<T extends (...args: any[]) => void>(
    fn: T,
    ms: number
): T & { cancel: () => void } {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const debounced = ((...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, ms);
    }) as T & { cancel: () => void };

    debounced.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    return debounced;
}

export { NODE_WIDTH, NODE_HEIGHT, NODE_COLORS };
