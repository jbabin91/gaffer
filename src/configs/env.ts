import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
  server: {
    // Reject short values and the placeholder so a verbatim-copied deploy fails fast.
    BETTER_AUTH_SECRET: z
      .string()
      .min(32)
      .refine((value) => !value.startsWith('changeme'), {
        message:
          'BETTER_AUTH_SECRET is still the placeholder; generate a real secret',
      }),
    BETTER_AUTH_URL: z.url(),
    DATABASE_URL: z.url(),
  },
});
