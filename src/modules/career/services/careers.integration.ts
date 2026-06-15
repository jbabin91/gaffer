import { beforeEach, describe, expect, it } from 'vitest';

import type { DB } from '#/db/client';

import { seasons } from '#/db/schema';
import { getTestDb, resetDb } from '#test/db';

import { createCareer, getCurrentSeason } from './careers';

let db: DB;

beforeEach(async () => {
  await resetDb();
  db = getTestDb();
});

describe('createCareer', () => {
  it('seeds an initial current season with defaults and the given club', async () => {
    const career = await createCareer(db, {
      clubName: 'Newcastle',
      name: 'Rebuild',
    });

    const season = await getCurrentSeason(db, career.id);
    expect(season?.isCurrent).toBe(true);
    expect(season?.label).toBe('Season 1');
    expect(season?.clubName).toBe('Newcastle');
  });

  it('honours a provided season label', async () => {
    const career = await createCareer(db, {
      name: 'X',
      seasonLabel: '2025/26',
    });
    const season = await getCurrentSeason(db, career.id);
    expect(season?.label).toBe('2025/26');
  });
});

describe('getCurrentSeason', () => {
  it('returns the flagged current season even when a newer non-current season exists', async () => {
    const career = await createCareer(db, {
      name: 'X',
      seasonLabel: 'Season 1',
    });
    const current = await getCurrentSeason(db, career.id);

    await db
      .insert(seasons)
      .values({ careerId: career.id, isCurrent: false, label: 'Season 2' });

    const resolved = await getCurrentSeason(db, career.id);
    expect(resolved?.id).toBe(current?.id);
    expect(resolved?.label).toBe('Season 1');
  });
});
