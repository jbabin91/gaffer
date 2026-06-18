import '@tanstack/react-start/server-only';

import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: {
    ...process.env,
    // A Sentry DSN isn't secret. The client needs VITE_SENTRY_DSN, so the server
    // reuses it — set the DSN once. SENTRY_DSN overrides (e.g. a separate
    // project). || not ??: a blank SENTRY_DSN= must still fall back to the client var.
    // oxlint-disable-next-line typescript/prefer-nullish-coalescing
    SENTRY_DSN: process.env.SENTRY_DSN || process.env.VITE_SENTRY_DSN,
  },
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
    // Designates the bootstrap admin on a fresh DB: only this email may sign up
    // (becoming admin) while no admin exists, which removes the first-signup race.
    // Required to bootstrap; ignored once an admin exists.
    INITIAL_ADMIN_EMAIL: z.email().optional(),
    // Defaults to VITE_SENTRY_DSN (see runtimeEnv). Unset = disabled; fails loud
    // at boot on a bad value (no users hit).
    SENTRY_DSN: z.url().optional(),
    // Falls back to 0.1 in prod, 1 in dev when unset.
    SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).optional(),
    // Any SMTP provider URL; takes precedence over CF_EMAIL_TOKEN.
    SMTP_URL: z.url().optional(),
  },
});
