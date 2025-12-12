import { NoteBoard } from '@/components/NoteBoard';

type Props = {
  params: Promise<{ noteId: string }>;
};

export default async function NotePage({ params }: Props) {
  const { noteId } = await params;

  return (
    <main className="min-h-screen bg-white">
      <NoteBoard noteId={noteId} />
    </main>
  );
}
