import { sql } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { runMigrations } from '#/db/migrate';
import { getTestDb } from '#test/db';

const journalCount = sql`SELECT count(*)::int AS c FROM drizzle.__drizzle_migrations`;

describe('runMigrations', () => {
  it('is idempotent — a second run records nothing and leaves a usable schema', async () => {
    const db = getTestDb();

    // The container is already migrated by global-setup; the journal is populated
    // and a second run must add no entries.
    const before = await db.execute<{ c: number }>(journalCount);
    expect(before.rows[0]?.c).toBeGreaterThan(0);

    await runMigrations(db);

    const after = await db.execute<{ c: number }>(journalCount);
    expect(after.rows[0]?.c).toBe(before.rows[0]?.c);

    // Schema is present and queryable (would throw if migrations hadn't run).
    await db.execute(sql`SELECT 1 FROM players LIMIT 0`);
  });
});
