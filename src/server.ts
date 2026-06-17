import '#/integrations/sentry/instrument.server';

import { wrapFetchWithSentry } from '@sentry/tanstackstart-react';
import handler, { createServerEntry } from '@tanstack/react-start/server-entry';

export default createServerEntry(
  wrapFetchWithSentry({
    // Start passes request options (context, early hints) as the second arg that
    // the default entry relays and SSR/server fns rely on; Sentry types it as
    // unknown, so re-narrow to handler.fetch's own param when forwarding.
    fetch(request: Request, opts?: unknown) {
      return handler.fetch(
        request,
        opts as Parameters<typeof handler.fetch>[1],
      );
    },
  }),
);
