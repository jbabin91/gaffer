import { PGlite } from '@electric-sql/pglite';
import { describe, expect, it } from 'vitest';

import { runMigrations } from './migrate';

describe('runMigrations', () => {
  it('is idempotent — a second run applies nothing and leaves a usable schema', async () => {
    const pg = await PGlite.create();

    await runMigrations(pg);
    await runMigrations(pg);

    const applied = await pg.query<{ c: number }>(
      'SELECT count(*)::int AS c FROM __migrations',
    );
    expect(applied.rows[0].c).toBe(1);

    // Schema is present and queryable (would throw if migrations hadn't run).
    const players = await pg.query<{ c: number }>(
      'SELECT count(*)::int AS c FROM players',
    );
    expect(players.rows[0].c).toBe(0);
  });
});
