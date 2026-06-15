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
    // Unset → dev log transport; set → Cloudflare Email Service SMTP.
    CF_EMAIL_TOKEN: z.string().min(1).optional(),
    DATABASE_URL: z.url(),
    // Optional in schema, but required once any SMTP transport is set.
    EMAIL_FROM: z.email().optional(),
    // Any SMTP provider URL; takes precedence over CF_EMAIL_TOKEN.
    SMTP_URL: z.url().optional(),
  },
});
