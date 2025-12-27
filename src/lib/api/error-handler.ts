import { APICallError } from 'ai';
import { logger } from '@/lib/logger';

interface ParsedError {
  code: string;
  message: string;
  retryable: boolean;
  status: number;
}

/**
 * User-friendly error messages for common HTTP status codes
 */
const STATUS_ERRORS: Record<number, { code: string; message: string }> = {
  400: { code: 'BAD_REQUEST', message: 'Invalid request' },
  401: { code: 'UNAUTHORIZED', message: 'Invalid API key. Check your settings.' },
  402: {
    code: 'PAYMENT_REQUIRED',
    message: 'Insufficient credits on API key. Please add funds.',
  },
  403: { code: 'FORBIDDEN', message: 'Access denied to this model.' },
  404: { code: 'NOT_FOUND', message: 'Model not found or removed.' },
  429: {
    code: 'RATE_LIMITED',
    message: 'Too many requests. Please wait and try again.',
  },
  500: { code: 'SERVER_ERROR', message: 'AI service error. Please try again.' },
  502: {
    code: 'BAD_GATEWAY',
    message: 'Service temporarily unavailable. Please try again.',
  },
  503: {
    code: 'UNAVAILABLE',
    message: 'Model at capacity. Please try again shortly.',
  },
};

/**
 * Parse any error into a consistent format
 */
function parseError(error: unknown): ParsedError {
  // Handle AI SDK APICallError
  if (APICallError.isInstance(error)) {
    const statusCode = error.statusCode ?? 500;
    const statusInfo = STATUS_ERRORS[statusCode] || {
      code: 'API_ERROR',
      message: 'An API error occurred',
    };

    return {
      code: statusInfo.code,
      message: statusInfo.message,
      retryable: error.isRetryable ?? (statusCode >= 500 || statusCode === 429),
      status: statusCode,
    };
  }

  // Handle standard Error
  // Sanitize error messages to prevent exposing sensitive data like API keys
  if (error instanceof Error) {
    // Check if error message might contain sensitive data
    const message = error.message;
    const sanitizedMessage = message.includes('OPENROUTER_API_KEY') || 
                            message.includes('apiKey') || 
                            message.includes('sk-or-') ||
                            message.length > 200
      ? 'An unexpected error occurred'
      : message;
    
    return {
      code: 'ERROR',
      message: sanitizedMessage,
      retryable: false,
      status: 500,
    };
  }

  // Handle unknown errors
  return {
    code: 'UNKNOWN',
    message: 'An unexpected error occurred',
    retryable: false,
    status: 500,
  };
}

/**
 * Handle errors in API routes and return appropriate Response
 * Logs error details and returns user-friendly error message
 */
export function handleRouteError(error: unknown): Response {
  const parsed = parseError(error);

  logger.error({ code: parsed.code, status: parsed.status }, 'Route error');

  return Response.json(
    {
      error: {
        code: parsed.code,
        message: parsed.message,
        retryable: parsed.retryable,
      },
    },
    { status: parsed.status }
  );
}
