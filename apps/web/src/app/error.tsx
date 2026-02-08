'use client';

import { useEffect } from 'react';
import { RouteErrorUI } from '@/components/RouteErrorUI';
import { trackClientError } from '@/lib/posthog';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    trackClientError(error, {
      source: 'app_error_route',
    });
  }, [error]);

  return (
    <RouteErrorUI
      title="Something went wrong"
      message="An unexpected error occurred. Please try again or return to the home page."
      onReset={reset}
    />
  );
}
