import type * as Sentry from '@sentry/tanstackstart-react';

import { scrubSentryPayload } from '#/integrations/sentry/scrub';

type SentryInitOptions = NonNullable<Parameters<typeof Sentry.init>[0]>;

/**
 * Shared Sentry.init config so the client and server can't drift on the scrub
 * wiring, the enabled gate, or environment. Only the DSN and trace rate differ
 * per runtime.
 */
export function sentryInitConfig({
  dsn,
  tracesSampleRate,
}: {
  dsn: string | undefined;
  tracesSampleRate: number | undefined;
}) {
  return {
    beforeSend: (event) => scrubSentryPayload(event),
    beforeSendLog: (log) => scrubSentryPayload(log),
    dsn,
    // Dev sink is pino; Sentry only active in prod with a DSN.
    enabled: Boolean(dsn) && import.meta.env.PROD,
    enableLogs: true,
    environment: import.meta.env.MODE,
    tracesSampleRate: tracesSampleRate ?? (import.meta.env.PROD ? 0.1 : 1),
  } satisfies SentryInitOptions;
}
