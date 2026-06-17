import * as Sentry from '@sentry/tanstackstart-react';

import { env } from '#/configs/env/server';
import { sentryInitConfig } from '#/integrations/sentry/init-config';

Sentry.init(
  sentryInitConfig({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE,
  }),
);
