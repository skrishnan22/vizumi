import pino from 'pino';
import { env } from '@/env';

/**
 * Server-side logger using Pino
 * - Structured JSON logging for all environments
 * - Configurable log level via LOG_LEVEL environment variable
 * - Pipe output through pino-pretty in CLI for human-readable logs: npm run dev | pino-pretty
 */
export const logger = pino({
  level: env.LOG_LEVEL || (env.NODE_ENV === 'development' ? 'debug' : 'info'),
  base: {
    env: env.NODE_ENV,
  },
});
