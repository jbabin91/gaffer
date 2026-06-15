import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { careers } from '#/db/schema';

// Column-synced via drizzle-zod, extended with the season fields createCareer
// seeds. Shared by the api validator and any client-side form.
export const createCareerInput = createInsertSchema(careers)
  .pick({ managerName: true, name: true })
  .extend({
    clubName: z.string().optional(),
    name: z.string().min(1),
    seasonLabel: z.string().optional(),
  });

export type CreateCareerInput = z.infer<typeof createCareerInput>;
