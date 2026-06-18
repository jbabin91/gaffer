import { createServerFn } from '@tanstack/react-start';

import { getDb } from '#/db/client';
import { searchCatalogInput } from '#/modules/catalog/schemas/catalog';
import { searchCatalog } from '#/modules/catalog/services/catalog';

export const searchCatalogFn = createServerFn({ method: 'GET' })
  .validator(searchCatalogInput)
  .handler(({ data }) => searchCatalog(getDb(), data));
