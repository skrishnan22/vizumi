import { DocumentPageContent } from '@/components/DocumentPageContent';

type Props = {
  params: Promise<{ canvasId: string }>;
};

export default async function CanvasPage({ params }: Props) {
  const { canvasId } = await params;

  return <DocumentPageContent docId={canvasId} />;
}
