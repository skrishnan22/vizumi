'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useCompletion } from '@ai-sdk/react';
import type { Node } from 'reactflow';
import { useGraphStore } from '@/store/graphStore';
import { useNoteStore } from '@/store/noteStore';
import { getModeTitle, type DeepDiveMode } from '@/lib/deepDiveHelpers';
import { addNodeFromBlock, updateNodeData } from '@/lib/graph/noteActions';
import type { NoteBlock } from '@/lib/schemas';
import type { NoteNodeData } from '@/lib/graph/noteUtils';
import { logger } from '@/lib/logger.client';
import { useSettings } from '@/hooks/use-settings';
import { showApiErrorToast } from '@/lib/api/client-error-handler';
import { getNoteMetadata } from '@/lib/db/actions';

export function useDeepDive() {
  const noteId = useNoteStore((state) => state.noteId);
  const storeNodes = useGraphStore((state) => state.nodes) as Node<NoteNodeData>[];
  const setDeepDiveStreaming = useNoteStore((state) => state.setDeepDiveStreaming);
  const markdownCache = useNoteStore((state) => state.markdownCache);
  const { getRequestHeaders } = useSettings();

  const currentDeepDiveNodeIdRef = useRef<string | null>(null);

  const { completion, complete, isLoading, error } = useCompletion({
    api: '/api/deep-dive',
    headers: getRequestHeaders('deepDive'),
  });

  // Update summary as streaming progresses
  // React 18 automatically batches these updates - no manual debouncing needed!
  useEffect(() => {
    if (currentDeepDiveNodeIdRef.current && completion && noteId) {
      updateNodeData(noteId, currentDeepDiveNodeIdRef.current, { summary: completion });
    }
  }, [completion, noteId]);

  // Sync streaming state to store for UI
  useEffect(() => {
    setDeepDiveStreaming(isLoading);
  }, [isLoading, setDeepDiveStreaming]);

  const requestDeepDive = useCallback(
    async (parentNodeId: string, mode: DeepDiveMode) => {
      if (!noteId) {
        logger.error('No noteId available');
        return;
      }

      // Find parent node to get its data (block)
      const parentNode = storeNodes.find((n: Node<NoteNodeData>) => n.id === parentNodeId);
      if (!parentNode) {
        logger.error('Parent node not found:', parentNodeId);
        return;
      }
      const parentBlock = parentNode.data?.block as NoteBlock | undefined;
      if (!parentBlock) {
        logger.error('Parent block data not found');
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

      // Add node to Y.Doc with automatic layout and edge creation
      // addNodeFromBlock now handles both node and edge, plus layout calculation
      const currentNodeCount = storeNodes.length;
      await addNodeFromBlock(noteId, deepDiveBlock, currentNodeCount);

      // Get markdown from cache and URL from metadata
      const markdown = markdownCache[noteId];
      let url: string | undefined;
      try {
        const metadata = await getNoteMetadata(noteId);
        url = metadata?.url;
      } catch (err) {
        logger.warn('Failed to fetch note metadata for URL:', err);
      }

      try {
        await complete('', {
          body: {
            nodeId: parentNodeId,
            mode,
            blockTitle: parentBlock.title,
            blockSummary: parentBlock.summary,
            markdown,
            url,
          },
        });
      } catch (err) {
        logger.error('Deep dive request failed:', err);
        showApiErrorToast(err, { showRetryHint: true });
        if (currentDeepDiveNodeIdRef.current && noteId) {
          updateNodeData(noteId, currentDeepDiveNodeIdRef.current, {
            summary: 'Failed to generate explanation. Please try again.',
            isStreaming: false,
          });
        }
      } finally {
        // Mark streaming as complete
        if (currentDeepDiveNodeIdRef.current && noteId) {
          updateNodeData(noteId, currentDeepDiveNodeIdRef.current, {
            isStreaming: false,
          });
        }
        currentDeepDiveNodeIdRef.current = null;
      }
    },
    [noteId, storeNodes, complete, markdownCache]
  );

  return {
    requestDeepDive,
    isLoading,
    error,
  };
}
