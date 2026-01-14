import { createNoteMetadata, deleteNoteMetadata, getNoteByUrl } from '@/lib/db/actions';
import type { NoteMetadata, DocKind } from '@/lib/db/noteMetadata';
import { setMeta } from '@/lib/graph/actions';
import { logger } from '@/lib/logger.client';

export type DocGenerationMetadata = {
  url: string;
  title: string;
  ogImage?: string;
  markdown?: string;
};

export type PrepareDocGenerationResult =
  | { kind: 'ready'; metadata: DocGenerationMetadata }
  | { kind: 'duplicate'; existing: NoteMetadata };

type PrepareDocGenerationParams = {
  docId: string;
  kind: DocKind;
  url: string;
  fallbackTitle: string;
};

export async function prepareDocGeneration({
  docId,
  kind,
  url,
  fallbackTitle,
}: PrepareDocGenerationParams): Promise<PrepareDocGenerationResult> {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    throw new Error('URL is required to generate a document.');
  }

  const existing = await getNoteByUrl(trimmedUrl, kind);
  if (existing) {
    return { kind: 'duplicate', existing };
  }

  setMeta(docId, { kind, url: trimmedUrl });

  let resolvedTitle = fallbackTitle;
  let resolvedOgImage: string | undefined;
  let resolvedMarkdown: string | undefined;

  try {
    const metadataRes = await fetch('/api/url-metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: trimmedUrl }),
    });

    if (metadataRes.ok) {
      const { title, ogImage, markdown } = await metadataRes.json();
      resolvedTitle = title || resolvedTitle;
      resolvedOgImage = ogImage || resolvedOgImage;
      resolvedMarkdown = markdown || resolvedMarkdown;
    }
  } catch (error) {
    logger.error('Error fetching metadata:', error);
  }

  if (resolvedTitle) {
    setMeta(docId, { title: resolvedTitle });
  }

  await createNoteMetadata({
    noteId: docId,
    url: trimmedUrl,
    title: resolvedTitle,
    ogImage: resolvedOgImage,
    kind,
  });

  return {
    kind: 'ready',
    metadata: {
      url: trimmedUrl,
      title: resolvedTitle,
      ogImage: resolvedOgImage,
      markdown: resolvedMarkdown,
    },
  };
}

export async function cleanupDocGeneration(docId: string): Promise<void> {
  try {
    await deleteNoteMetadata(docId);
  } catch (error) {
    logger.error('Failed to cleanup metadata on error:', error);
  }
}
