import '@tanstack/react-start/server-only';

import type { Logger } from 'pino';

import { AsyncLocalStorage } from 'node:async_hooks';

type RequestStore = { fields: Record<string, unknown>; log: Logger };

const storage = new AsyncLocalStorage<RequestStore>();

export function runWithRequestContext<T>(store: RequestStore, fn: () => T): T {
  return storage.run(store, fn);
}

/** No-op outside a request so call sites in services and db layers never need to guard. */
export function addRequestFields(fields: Record<string, unknown>): void {
  const store = storage.getStore();
  if (store) Object.assign(store.fields, fields);
}

export function getRequestLog(): Logger | undefined {
  return storage.getStore()?.log;
}

/**
 * Prefer an inbound correlation id (cf-ray ties app logs to Cloudflare's edge
 * logs) before minting one.
 */
export function makeRequestId(request: Request): string {
  return (
    request.headers.get('cf-ray') ??
    request.headers.get('x-request-id') ??
    crypto.randomUUID()
  );
}
