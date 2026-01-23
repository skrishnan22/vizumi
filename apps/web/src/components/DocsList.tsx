'use client';

import { useDocsList } from '@/hooks/useDocsList';
import { DocCard } from './DocCard';
import { deleteNote } from '@/lib/db/actions';
import type { DocKind } from '@/lib/db/noteMetadata';
import { toast } from 'sonner';

export function DocsList() {
  const { docs, isLoading, refetch } = useDocsList();

  const handleDelete = async (docId: string, title: string, kind: DocKind) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteNote(docId, kind);
      toast.success(`"${title}" deleted successfully`);
      // Refresh the documents list
      refetch();
    } catch (error) {
      console.error('Failed to delete document:', error);
      toast.error('Failed to delete document');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16" data-testid="docs-list-loading">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Loading your documents...</p>
        </div>
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div
        className="col-span-full flex flex-col items-center justify-center py-24 px-6 text-center bg-gray-50 rounded-3xl border border-gray-100"
        data-testid="docs-list-empty"
      >
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
          <svg
            className="w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Your collection is empty</h3>
        <p className="text-gray-500 max-w-sm mx-auto mb-8 leading-relaxed">
          Start building your visual knowledge base. Create your first document to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="docs-list">
      {docs.map((doc) => (
        <DocCard
          key={doc.noteId}
          title={doc.title}
          url={doc.url}
          href={`/doc/${doc.noteId}`}
          ogImage={doc.ogImage}
          updatedAt={doc.updatedAt}
          kind={doc.kind}
          onDelete={() => handleDelete(doc.noteId, doc.title, doc.kind)}
        />
      ))}
    </div>
  );
}
