import { DocumentPageContent } from '@/components/DocumentPageContent';

type Props = {
  params: Promise<{ noteId: string }>;
};

export default async function NotePage({ params }: Props) {
  const { noteId } = await params;

  return <DocumentPageContent docId={noteId} />;
}
