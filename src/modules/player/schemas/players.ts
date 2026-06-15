import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { players, playerSnapshots } from '#/db/schema';

const rating = z.number().int().min(0).max(99);

// Player columns are column-synced via drizzle-zod; overall/potential/value are
// extra inputs that seed the week-0 snapshot rather than the player row.
export const addPlayerInput = createInsertSchema(players)
  .pick({
    age: true,
    catalogId: true,
    contractUntil: true,
    name: true,
    nationality: true,
    primaryPosition: true,
    secondaryPositions: true,
    squadNumber: true,
    wageEur: true,
  })
  .extend({
    marketValueEur: z.number().int().optional(),
    name: z.string().min(1),
    overall: rating.optional(),
    potential: rating.optional(),
  });

export type AddPlayerInput = z.infer<typeof addPlayerInput>;

export const recordSnapshotInput = createInsertSchema(playerSnapshots)
  .pick({
    form: true,
    inGameWeek: true,
    marketValueEur: true,
    overall: true,
    potential: true,
    seasonId: true,
  })
  .extend({ overall: rating, potential: rating.optional() });

export type RecordSnapshotInput = z.infer<typeof recordSnapshotInput>;

export const addPlayerArgs = z.object({
  careerId: z.string(),
  input: addPlayerInput,
});

export type AddPlayerArgs = z.infer<typeof addPlayerArgs>;

export const recordSnapshotArgs = z.object({
  input: recordSnapshotInput,
  playerId: z.string(),
});

export type RecordSnapshotArgs = z.infer<typeof recordSnapshotArgs>;
