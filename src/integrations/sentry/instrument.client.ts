import * as Sentry from '@sentry/tanstackstart-react';

import { env } from '#/configs/env/client';
import { sentryInitConfig } from '#/integrations/sentry/init-config';

Sentry.init(
  sentryInitConfig({
    dsn: env.VITE_SENTRY_DSN,
    tracesSampleRate: env.VITE_SENTRY_TRACES_SAMPLE_RATE,
  }),
);
