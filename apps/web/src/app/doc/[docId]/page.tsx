import { DocumentPageContent } from '@/components/DocumentPageContent';

type Props = {
  params: Promise<{ docId: string }>;
};

export default async function DocumentPage({ params }: Props) {
  const { docId } = await params;

  return <DocumentPageContent docId={docId} />;
}
