import { and, desc, eq } from 'drizzle-orm';

import type { DB } from '#/db/client';
import type { CreateCareerInput } from '#/modules/career/schemas/careers';

import { type Career, careers, type Season, seasons } from '#/db/schema';

const DEFAULT_SEASON_LABEL = 'Season 1';

export async function listCareers(db: DB): Promise<Career[]> {
  return db.select().from(careers).orderBy(desc(careers.createdAt));
}

export async function getCareer(
  db: DB,
  id: string,
): Promise<Career | undefined> {
  const [career] = await db.select().from(careers).where(eq(careers.id, id));
  return career;
}

export async function createCareer(
  db: DB,
  input: CreateCareerInput,
): Promise<Career> {
  return db.transaction(async (tx) => {
    const [career] = await tx
      .insert(careers)
      .values({ managerName: input.managerName, name: input.name })
      .returning();

    if (!career) throw new Error('createCareer: insert returned no row');

    await tx
      .insert(seasons)
      .values({
        careerId: career.id,
        clubName: input.clubName,
        isCurrent: true,
        label: input.seasonLabel ?? DEFAULT_SEASON_LABEL,
      });

    return career;
  });
}

/**
 * The career's current season, honoring the one-current-per-career invariant
 * (partial-unique index). Returns undefined when no season is flagged current
 * rather than guessing the newest.
 */
export async function getCurrentSeason(
  db: DB,
  careerId: string,
): Promise<Season | undefined> {
  const [season] = await db
    .select()
    .from(seasons)
    .where(and(eq(seasons.careerId, careerId), eq(seasons.isCurrent, true)))
    .limit(1);
  return season;
}
