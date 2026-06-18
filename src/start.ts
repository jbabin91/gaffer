import {
  sentryGlobalFunctionMiddleware,
  sentryGlobalRequestMiddleware,
} from '@sentry/tanstackstart-react';
import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from '@tanstack/react-start';

import type { RequestLogBase } from '#/lib/logging/request-log';

const requestLogger = createMiddleware({ type: 'request' }).server(
  async ({ handlerType, next, pathname, request, serverFnMeta }) => {
    // pino + node:async_hooks are server-only; dynamic import keeps them out of
    // the client bundle since this file is evaluated in both environments.
    const { logger } = await import('#/lib/logging/logger');
    const { runInstrumented } = await import('#/lib/logging/request-log');
    const { makeRequestId, runWithRequestContext } =
      await import('#/lib/logging/request-context');

    const log = logger.child({ reqId: makeRequestId(request) });
    const fields: Record<string, unknown> = {};
    const base: RequestLogBase = {
      fn: serverFnMeta?.name,
      handlerType,
      method: request.method,
      pathname,
    };

    return runWithRequestContext({ fields, log }, () =>
      runInstrumented(log, base, fields, next),
    );
  },
);

// Defining start.ts opts out of Start's automatic server-fn CSRF protection, so
// re-add it explicitly (scoped to server functions, the RPC endpoints).
const csrf = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
});

export const startInstance = createStart(() => ({
  functionMiddleware: [sentryGlobalFunctionMiddleware],
  // Sentry first so it wraps the rest of the chain and captures their throws.
  requestMiddleware: [sentryGlobalRequestMiddleware, requestLogger, csrf],
}));
