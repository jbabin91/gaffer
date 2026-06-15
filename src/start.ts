import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from '@tanstack/react-start';

import { handleRequestError } from '#/lib/handle-request-error';

const errorLogger = createMiddleware({ type: 'request' }).server(
  async ({ handlerType, next, pathname, request, serverFnMeta }) => {
    try {
      return await next();
    } catch (error) {
      // Dynamic import: pino is server-only; this file is client-shared, so
      // eager evaluation would run server logging code in the browser.
      const { logger } = await import('#/lib/logger');
      handleRequestError(logger, error, {
        fn: serverFnMeta?.name,
        handlerType,
        method: request.method,
        pathname,
      });
    }
  },
);

// Defining start.ts opts out of Start's automatic server-fn CSRF protection, so
// re-add it explicitly (scoped to server functions, the RPC endpoints).
const csrf = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorLogger, csrf],
}));
