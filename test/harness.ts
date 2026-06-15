import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

// Retries off so failures surface immediately in tests.
export function createTestQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

// Returns the client too so tests can assert on cache state.
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
