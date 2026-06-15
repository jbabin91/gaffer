import { z } from 'zod';

// Length/trim rules live in the service (searchCatalog).
export const searchCatalogInput = z.string();

export type SearchCatalogInput = z.infer<typeof searchCatalogInput>;
