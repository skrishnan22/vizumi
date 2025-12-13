import { NotePageContent } from '@/components/NotePageContent';

type Props = {
  params: Promise<{ noteId: string }>;
};

export default async function NotePage({ params }: Props) {
  const { noteId } = await params;

  return <NotePageContent noteId={noteId} />;
}
