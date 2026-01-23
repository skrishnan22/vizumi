import { toast } from 'sonner';

interface ApiError {
  code: string;
  message: string;
  retryable: boolean;
}

/**
 * Parse error from AI SDK hooks or fetch responses.
 * Extracts structured error format { code, message, retryable } when available.
 */
export function parseApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyError = error as any;

    // AI SDK may attach responseBody with our structured error
    const errorData =
      anyError.responseBody?.error || anyError.data?.error || tryParseJson(error.message);

    if (errorData?.code && errorData?.message) {
      return {
        code: errorData.code,
        message: errorData.message,
        retryable: errorData.retryable ?? false,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      retryable: false,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    retryable: false,
  };
}

function tryParseJson(message: string): ApiError | null {
  try {
    const parsed = JSON.parse(message);
    return parsed?.error ?? null;
  } catch {
    return null;
  }
}

/**
 * Show toast for API error with parsed message.
 * Returns the parsed error for additional handling if needed.
 */
export function showApiErrorToast(
  error: unknown,
  options?: {
    fallbackMessage?: string;
    showRetryHint?: boolean;
  }
): ApiError {
  const parsed = parseApiError(error);
  const message = parsed.message || options?.fallbackMessage || 'Something went wrong';

  toast.error(message, {
    description:
      options?.showRetryHint && parsed.retryable
        ? 'This may be temporary. Try again shortly.'
        : undefined,
  });

  return parsed;
}
