/**
 * Client-side logger for browser environment
 * Simple wrapper around console with consistent formatting
 * Suppresses debug/info logs in production
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
    // Hook for future error monitoring (e.g., Sentry)
    // if (typeof window !== 'undefined' && window.errorMonitoring) {
    //   window.errorMonitoring.captureException(args[0]);
    // }
  },
};
