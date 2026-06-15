import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

/** A QueryClient with retries off so failures surface immediately in tests. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

/**
 * renderHook wrapped in a fresh QueryClientProvider. Returns the client too so
 * tests can assert on cache state. Pair with a `vi.mock` of the relevant api
 * module that routes server functions to services against the test db.
 */
export function renderHookWithClient<Result>(render: () => Result) {
  const queryClient = createTestQueryClient();
  return {
    queryClient,
    ...renderHook(render, {
      wrapper: ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children),
    }),
  };
}
