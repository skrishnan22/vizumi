import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({

  server: {
    OPENROUTER_API_KEY: z.string().min(1, 'OPENROUTER_API_KEY is required'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).optional(),
  },

  client: {
    // Add client env vars here if needed
    // NEXT_PUBLIC_API_URL: z.string().url(),
  },

  runtimeEnv: {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    LOG_LEVEL: process.env.LOG_LEVEL,
  },

  emptyStringAsUndefined: true,
});
