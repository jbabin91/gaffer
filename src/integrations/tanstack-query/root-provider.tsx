import { QueryClient } from '@tanstack/react-query';

export function getContext() {
  // Local-first: a failed read (e.g. a wedged IndexedDB) should be loud, not a
  // benign empty state. Query errors propagate to the route errorComponent.
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Mutations invalidate the keys they touch; nothing goes stale on its
        // own, so refetching on focus/remount against IndexedDB is wasteful.
        staleTime: Infinity,
        throwOnError: true,
      },
    },
  });

  return { queryClient };
}
export default function TanstackQueryProvider() {
  /* empty */
}
