import { queryOptions, useQuery } from '@tanstack/react-query';

import { searchCatalogFn } from '#/modules/catalog/api/catalog';

export const catalogQueries = {
  all: () => ['catalog'] as const,
  search: (term: string) =>
    queryOptions({
      enabled: term.trim().length >= 2,
      queryFn: () => searchCatalogFn({ data: term }),
      queryKey: [...catalogQueries.searches(), term],
      // Optional sub-feature: degrade inline (CatalogResults) instead of letting
      // a search failure trip the global throwOnError and crash the whole app.
      throwOnError: false,
    }),
  searches: () => [...catalogQueries.all(), 'search'] as const,
};

export function useCatalogSearch(term: string) {
  return useQuery(catalogQueries.search(term));
}
