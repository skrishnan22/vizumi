/**
 * Client-side logger utility
 * - Only logs in development mode (except errors and warnings)
 * - Provides structured logging with prefixes
 * - Safe to use in browser environments
 */

const isDev = process.env.NODE_ENV === 'development';

export const clientLogger = {
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  },
};
