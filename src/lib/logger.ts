import pino from 'pino';

/**
 * Server-side logger using Pino
 * - Structured JSON logging for all environments
 * - Configurable log level via LOG_LEVEL environment variable
 * - Pipe output through pino-pretty in CLI for human-readable logs: npm run dev | pino-pretty
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info'),
  base: {
    env: process.env.NODE_ENV,
  },
});
