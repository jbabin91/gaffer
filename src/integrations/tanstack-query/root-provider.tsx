import { QueryClient } from '@tanstack/react-query';

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // staleTime Infinity: mutations invalidate the keys they touch, so
        // nothing else goes stale and refetch-on-focus/remount is wasted work.
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
