import { beforeEach, describe, expect, it } from 'vitest';

import type { DB } from '#/db/client';
import type { CatalogPlayer } from '#/db/schema';

import { getTestDb, resetDb } from '#test/db';

import { catalogCount, importCatalog, searchCatalog } from './catalog';

let db: DB;

beforeEach(async () => {
  await resetDb();
  db = getTestDb();
});

function row(id: number, fullName: string, extra: Partial<CatalogPlayer> = {}) {
  return { fullName, id, ...extra };
}

describe('importCatalog', () => {
  it('is idempotent on id and reports only newly inserted rows', async () => {
    expect(
      await importCatalog(db, [
        row(1, 'Alpha'),
        row(2, 'Bravo'),
        row(3, 'Charlie'),
      ]),
    ).toBe(3);

    const inserted = await importCatalog(db, [
      row(1, 'Alpha Renamed'),
      row(2, 'Bravo'),
      row(4, 'Delta'),
    ]);
    expect(inserted).toBe(1);
    expect(await catalogCount(db)).toBe(4);
  });

  it('does not overwrite existing rows (onConflictDoNothing, not upsert)', async () => {
    await importCatalog(db, [row(1, 'Alpha', { overall: 80 })]);
    await importCatalog(db, [row(1, 'Alpha Renamed', { overall: 99 })]);

    const [found] = await searchCatalog(db, 'Alpha');
    expect(found.fullName).toBe('Alpha');
    expect(found.overall).toBe(80);
  });

  it('inserts across chunk boundaries (>500 rows)', async () => {
    const rows = Array.from({ length: 501 }, (_, i) =>
      row(i + 1, `Player ${i + 1}`),
    );
    expect(await importCatalog(db, rows)).toBe(501);
    expect(await catalogCount(db)).toBe(501);
  });
});

describe('searchCatalog', () => {
  it('orders by overall descending with unrated players last', async () => {
    await importCatalog(db, [
      row(1, 'Striker One', { overall: 90 }),
      row(2, 'Striker Two'),
      row(3, 'Striker Three', { overall: 75 }),
    ]);

    const results = await searchCatalog(db, 'Striker');
    expect(results.map((r) => r.overall)).toEqual([90, 75, null]);
  });

  it('matches case-insensitively', async () => {
    await importCatalog(db, [row(1, 'Lionel Messi')]);
    const lower = await searchCatalog(db, 'messi');
    const upper = await searchCatalog(db, 'MESSI');
    expect(lower.map((r) => r.id)).toEqual([1]);
    expect(upper.map((r) => r.id)).toEqual([1]);
  });

  it('returns nothing for terms shorter than two characters', async () => {
    await importCatalog(db, [row(1, 'Alpha')]);
    expect(await searchCatalog(db, 'a')).toEqual([]);
    expect(await searchCatalog(db, ' x ')).toEqual([]);
  });
});
