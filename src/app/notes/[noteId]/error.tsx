'use client';

import { RouteErrorUI } from '@/components/RouteErrorUI';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function NoteError({ error, reset }: ErrorProps) {
  return (
    <RouteErrorUI
      title="Failed to load note"
      message="This note couldn't be displayed. You can try again or return to your notes list."
      onReset={reset}
      homeButtonText="Back to notes"
      bgClassName="bg-white"
    />
  );
}
