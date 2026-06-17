import '@tanstack/react-start/client-only';

import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  client: {
    VITE_SENTRY_DSN: z.url().optional(),
    VITE_SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).optional(),
  },
  clientPrefix: 'VITE_',
  emptyStringAsUndefined: true,
  // runtimeEnvStrict with literal import.meta.env accesses: Vite only inlines
  // the VITE_ vars it sees literally, and strict mode type-errors on a miss.
  runtimeEnvStrict: {
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    VITE_SENTRY_TRACES_SAMPLE_RATE: import.meta.env
      .VITE_SENTRY_TRACES_SAMPLE_RATE,
  },
});
