import { createServerFn } from '@tanstack/react-start';

import { searchCatalogInput } from '#/modules/catalog/schemas/catalog';

// Service import is dynamic so the server-only query layer stays out of the
// client bundle; only the RPC stub (and the validator) ships to the browser.
export const searchCatalogFn = createServerFn({ method: 'GET' })
  .validator(searchCatalogInput)
  .handler(async ({ data }) => {
    const { getDb } = await import('#/db/client');
    const { searchCatalog } =
      await import('#/modules/catalog/services/catalog');
    return searchCatalog(getDb(), data);
  });
