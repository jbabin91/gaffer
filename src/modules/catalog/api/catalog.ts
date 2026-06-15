import { createServerFn } from '@tanstack/react-start';

import { searchCatalogInput } from '#/modules/catalog/schemas/catalog';

// Dynamic import keeps the server-only query layer out of the client bundle.
export const searchCatalogFn = createServerFn({ method: 'GET' })
  .validator(searchCatalogInput)
  .handler(async ({ data }) => {
    const { getDb } = await import('#/db/client');
    const { searchCatalog } =
      await import('#/modules/catalog/services/catalog');
    return searchCatalog(getDb(), data);
  });
