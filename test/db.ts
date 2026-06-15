import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { inject } from 'vitest';

import type { DB } from '#/db/client';

import * as schema from '#/db/schema';

let pool: Pool | undefined;
let db: DB | undefined;

/**
 * A drizzle handle bound to the shared Postgres container started in
 * global-setup. The connection URL is provided across the process boundary via
 * Vitest's inject(); `allowExitOnIdle` keeps idle clients from wedging exit.
 */
export function getTestDb(): DB {
  if (!db) {
    pool = new Pool({
      allowExitOnIdle: true,
      connectionString: inject('databaseUrl'),
    });
    db = drizzle(pool, { casing: 'snake_case', schema });
  }
  return db;
}

/**
 * Wipe all rows between tests. The container and its schema persist across the
 * run; only data is reset, which is far cheaper than a fresh container per test.
 */
export async function resetDb(): Promise<void> {
  await getTestDb().execute(
    sql`TRUNCATE player_snapshots, players, seasons, careers, player_catalog RESTART IDENTITY CASCADE`,
  );
}
