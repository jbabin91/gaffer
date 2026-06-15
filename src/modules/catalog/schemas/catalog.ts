import { z } from 'zod';

// The search term; length/trim rules live in the service (searchCatalog).
export const searchCatalogInput = z.string();

export type SearchCatalogInput = z.infer<typeof searchCatalogInput>;
