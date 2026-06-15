import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { inject } from 'vitest';

import type { DB } from '#/db/client';

import * as schema from '#/db/schema';

let pool: Pool | undefined;
let db: DB | undefined;

// allowExitOnIdle keeps idle clients from wedging process exit.
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

// Reset data only; the container and schema persist, far cheaper than a fresh container per test.
export async function resetDb(): Promise<void> {
  await getTestDb().execute(
    sql`TRUNCATE player_snapshots, players, seasons, careers, player_catalog, "user", verification RESTART IDENTITY CASCADE`,
  );
}
