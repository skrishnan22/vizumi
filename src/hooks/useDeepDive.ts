'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { useNoteStore } from '@/store/noteStore';
import { getModeTitle, type DeepDiveMode } from '@/lib/deepDiveHelpers';
import { addNodeFromBlock, updateNodeData, addEdge } from '@/lib/yjs/actions';
import { debounce } from '@/lib/yjs/utils';
import type { NoteBlock } from '@/lib/schemas';
import { MarkerType } from 'reactflow';

export function useDeepDive() {
    const noteId = useNoteStore((state) => state.noteId);
    const storeNodes = useNoteStore((state) => state.nodes);
    const setDeepDiveStreaming = useNoteStore((state) => state.setDeepDiveStreaming);

    const currentDeepDiveNodeIdRef = useRef<string | null>(null);

    const { completion, complete, isLoading, error } = useCompletion({
        api: '/api/deep-dive',
    });

    // Debounced update for streaming - 200ms delay
    const debouncedUpdateSummary = useMemo(
        () =>
            debounce((nodeId: string, summary: string, nId: string) => {
                updateNodeData(nId, nodeId, { summary });
            }, 200),
        []
    );

    // Update summary as streaming progresses (debounced)
    useEffect(() => {
        if (currentDeepDiveNodeIdRef.current && completion && noteId) {
            debouncedUpdateSummary(currentDeepDiveNodeIdRef.current, completion, noteId);
        }
    }, [completion, debouncedUpdateSummary, noteId]);

    // Sync streaming state to store for UI
    useEffect(() => {
        setDeepDiveStreaming(isLoading);
    }, [isLoading, setDeepDiveStreaming]);

    const requestDeepDive = useCallback(
        async (parentNodeId: string, mode: DeepDiveMode) => {
            if (!noteId) {
                console.error('No noteId available');
                return;
            }

            // Find parent node to get its data (block)
            const parentNode = storeNodes.find((n: any) => n.id === parentNodeId);
            if (!parentNode) {
                console.error('Parent node not found:', parentNodeId);
                return;
            }
            const parentBlock = parentNode.data?.block as NoteBlock | undefined;
            if (!parentBlock) {
                console.error('Parent block data not found');
                return;
            }

            const deepDiveNodeId = `deep-dive-${parentNodeId}-${mode}-${Date.now()}`;
            currentDeepDiveNodeIdRef.current = deepDiveNodeId;

            // Create the deep dive block
            const deepDiveBlock: NoteBlock = {
                id: deepDiveNodeId,
                parentId: parentNodeId,
                title: getModeTitle(mode),
                summary: '',
                visualType: 'none',
                blockType: 'deep-dive',
                deepDiveMode: mode,
                isStreaming: true,
            };

            // Add node to Y.Doc - index doesn't matter much for deep dive nodes
            const currentNodeCount = storeNodes.length;
            addNodeFromBlock(noteId, deepDiveBlock, currentNodeCount);

            // Add edge from parent to deep dive node
            addEdge(noteId, {
                id: `edge-${parentNodeId}-${deepDiveNodeId}`,
                source: parentNodeId,
                target: deepDiveNodeId,
                type: 'default',
                animated: false,
                style: { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '5,5' },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#94a3b8',
                },
            });

            try {
                await complete('', {
                    body: {
                        nodeId: parentNodeId,
                        mode,
                        blockTitle: parentBlock.title,
                        blockSummary: parentBlock.summary,
                    },
                });
            } catch (err) {
                console.error('Deep dive request failed:', err);
                if (currentDeepDiveNodeIdRef.current && noteId) {
                    updateNodeData(noteId, currentDeepDiveNodeIdRef.current, {
                        summary: 'Failed to generate explanation. Please try again.',
                        isStreaming: false,
                    });
                }
            } finally {
                // Final flush of debounced update and mark streaming as complete
                debouncedUpdateSummary.cancel();
                if (currentDeepDiveNodeIdRef.current && noteId) {
                    // Final update with complete summary and streaming = false
                    updateNodeData(noteId, currentDeepDiveNodeIdRef.current, {
                        isStreaming: false,
                    });
                }
                currentDeepDiveNodeIdRef.current = null;
            }
        },
        [noteId, storeNodes, complete, debouncedUpdateSummary]
    );

    return {
        requestDeepDive,
        isLoading,
        error,
    };
}
