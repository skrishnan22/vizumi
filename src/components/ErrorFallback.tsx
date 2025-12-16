import Link from 'next/link';

type ErrorFallbackProps = {
  title: string;
  message: string;
  onReset?: () => void;
  showHomeButton?: boolean;
  containerClassName?: string;
};

export function ErrorFallback({
  title,
  message,
  onReset,
  showHomeButton = false,
  containerClassName = 'min-h-screen',
}: ErrorFallbackProps) {
  return (
    <div className={`flex items-center justify-center p-6 ${containerClassName}`}>
      <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-900 mb-1">{title}</h3>
            <p className="text-sm text-red-700 mb-4">{message}</p>
            <div className="flex gap-2">
              {onReset && (
                <button
                  onClick={onReset}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Try again
                </button>
              )}
              {showHomeButton && (
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Go home
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
