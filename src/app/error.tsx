'use client';

import { RouteErrorUI } from '@/components/RouteErrorUI';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  return (
    <RouteErrorUI
      title="Something went wrong"
      message="An unexpected error occurred. Please try again or return to the home page."
      onReset={reset}
    />
  );
}
