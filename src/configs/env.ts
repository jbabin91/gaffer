import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

// Import only from server-only modules (db/client); t3-env throws on the
// browser side.
export const env = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
  server: { DATABASE_URL: z.url() },
});
