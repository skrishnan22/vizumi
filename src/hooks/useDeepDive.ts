'use client';

import { useEffect, useRef } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { useNoteStore } from '@/store/noteStore';
import { getModeTitle, getModeIcon, type DeepDiveMode } from '@/lib/deepDiveHelpers';

export function useDeepDive() {
    const addBlock = useNoteStore((state) => state.addBlock);
    const updateBlockSummary = useNoteStore((state) => state.updateBlockSummary);
    const setDeepDiveStreaming = useNoteStore((state) => state.setDeepDiveStreaming);

    const currentDeepDiveBlockIdRef = useRef<string | null>(null);

    const { completion, complete, isLoading, error } = useCompletion({
        api: '/api/deep-dive',
    });

    useEffect(() => {

        if (currentDeepDiveBlockIdRef.current && completion) {
            updateBlockSummary(currentDeepDiveBlockIdRef.current, completion);
        }
    }, [completion, updateBlockSummary]);


    useEffect(() => {
        if (isLoading) {
            setDeepDiveStreaming(true);
        } else {
            setDeepDiveStreaming(false);
        }
    }, [isLoading, setDeepDiveStreaming]);

    const requestDeepDive = async (
        parentNodeId: string,
        mode: DeepDiveMode
    ) => {

        const blocks = useNoteStore.getState().blocks;

        // Find the parent block to get its content
        const parentBlock = blocks.find(b => b.id === parentNodeId);
        if (!parentBlock) {
            console.error('Parent block not found:', parentNodeId);
            return;
        }

        const deepDiveBlockId = `deep-dive-${parentNodeId}-${mode}-${Date.now()}`;

        currentDeepDiveBlockIdRef.current = deepDiveBlockId;

        addBlock({
            id: deepDiveBlockId,
            parentId: parentNodeId,
            title: `${getModeTitle(mode)}`,
            summary: "...", // Placeholder
            visualType: 'none',
            blockType: 'deep-dive',
            deepDiveMode: mode,
            isStreaming: true,
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
            if (currentDeepDiveBlockIdRef.current) {
                updateBlockSummary(
                    currentDeepDiveBlockIdRef.current,
                    'Failed to generate explanation. Please try again.'
                );
            }
        } finally {
            if (currentDeepDiveBlockIdRef.current) {
                useNoteStore.getState().setBlockStreaming(currentDeepDiveBlockIdRef.current, false);
            }
            currentDeepDiveBlockIdRef.current = null;
        }
    };

    return {
        requestDeepDive,
        isLoading,
        error,
    };
}
