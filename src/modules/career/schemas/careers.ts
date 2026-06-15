import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { careers } from '#/db/schema';

// Season fields are extended here because createCareer seeds a season alongside
// the career; they aren't columns on the careers table.
export const createCareerInput = createInsertSchema(careers)
  .pick({ managerName: true, name: true })
  .extend({
    clubName: z.string().optional(),
    name: z.string().min(1),
    seasonLabel: z.string().optional(),
  });

export type CreateCareerInput = z.infer<typeof createCareerInput>;
