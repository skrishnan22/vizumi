'use client';

import { useEffect } from 'react';
import { RouteErrorUI } from '@/components/RouteErrorUI';
import { trackClientError } from '@/lib/posthog';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function NoteError({ error, reset }: ErrorProps) {
  useEffect(() => {
    trackClientError(error, {
      source: 'note_route_error',
    });
  }, [error]);

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
