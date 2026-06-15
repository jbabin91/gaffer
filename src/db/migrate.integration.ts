import { sql } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { runMigrations } from '#/db/migrate';
import { getTestDb } from '#test/db';

const journalCount = sql`SELECT count(*)::int AS c FROM drizzle.__drizzle_migrations`;

describe('runMigrations', () => {
  it('is idempotent — a second run records nothing and leaves a usable schema', async () => {
    const db = getTestDb();

    // global-setup already migrated the container, so the journal is pre-populated.
    const before = await db.execute<{ c: number }>(journalCount);
    expect(before.rows[0]?.c).toBeGreaterThan(0);

    await runMigrations(db);

    const after = await db.execute<{ c: number }>(journalCount);
    expect(after.rows[0]?.c).toBe(before.rows[0]?.c);

    // No expect: a bare query throws if the schema isn't migrated.
    await db.execute(sql`SELECT 1 FROM players LIMIT 0`);
  });
});
