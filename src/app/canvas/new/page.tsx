'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { toast } from 'sonner';
import { ErrorFallback } from '@/components/ErrorFallback';
import { clientLogger } from '@/lib/client-logger';
import { CanvasGenerator } from '@/components/canvas/CanvasGenerator';

export default function NewCanvasPage() {
  return (
    <ErrorBoundary
      fallbackRender={({ resetErrorBoundary }) => (
        <ErrorFallback
          title="Canvas generation failed"
          message="An error occurred while generating the canvas. Please try again."
          onReset={resetErrorBoundary}
          showHomeButton
          containerClassName="min-h-screen bg-stone-50"
        />
      )}
      onError={(error, errorInfo) => {
        clientLogger.error('CanvasGenerator error:', error, errorInfo);
        toast.error('Something went wrong. Please try again.');
      }}
    >
      <CanvasGenerator />
    </ErrorBoundary>
  );
}
