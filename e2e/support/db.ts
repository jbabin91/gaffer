import { Pool } from 'pg';

import { E2E_DATABASE_URL } from './env';

let pool: Pool | undefined;

function getPool(): Pool {
  pool ??= new Pool({
    allowExitOnIdle: true,
    connectionString: E2E_DATABASE_URL,
  });
  return pool;
}

// Tables are read from the live schema so the reset stays current as tables are added.
// The drizzle journal lives in its own schema and is left untouched.
export async function resetE2eDb(): Promise<void> {
  const db = getPool();
  const { rows } = await db.query<{ name: string }>(
    `SELECT tablename AS name FROM pg_tables WHERE schemaname = 'public'`,
  );
  if (rows.length === 0) return;
  const tables = rows.map((row) => `"${row.name}"`).join(', ');
  await db.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
}

/** Row count straight from the e2e database, to assert the app wrote there. */
export async function countCareers(): Promise<number> {
  const { rows } = await getPool().query<{ count: number }>(
    `SELECT count(*)::int AS count FROM careers`,
  );
  return rows[0]?.count ?? 0;
}
