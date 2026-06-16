import { count, desc, like, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from '#/db/schema';

import { E2E_DATABASE_URL } from './env';

function makeDb() {
  const pool = new Pool({
    allowExitOnIdle: true,
    connectionString: E2E_DATABASE_URL,
  });
  return drizzle(pool, { casing: 'snake_case', schema });
}

let db: ReturnType<typeof makeDb> | undefined;

function getDb() {
  db ??= makeDb();
  return db;
}

// TRUNCATE and pg_tables have no drizzle query-builder equivalent, so they run as
// raw SQL through drizzle's executor. Tables are read from the live catalog so the
// reset stays current as tables are added; the drizzle journal sits in its own schema.
export async function resetE2eDb(): Promise<void> {
  const { rows } = await getDb().execute<{ name: string }>(
    sql`SELECT tablename AS name FROM pg_tables WHERE schemaname = 'public'`,
  );
  if (rows.length === 0) return;
  const tables = rows.map((row) => `"${row.name}"`).join(', ');
  await getDb().execute(sql.raw(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`));
}

/** Row count straight from the e2e database, to assert the app wrote there. */
export async function countCareers(): Promise<number> {
  const [row] = await getDb().select({ value: count() }).from(schema.careers);
  return row?.value ?? 0;
}

// Better Auth stores the token as `reset-password:<token>` in verification.identifier.
export async function latestResetToken(): Promise<string> {
  const prefix = 'reset-password:';
  const [row] = await getDb()
    .select({ identifier: schema.verification.identifier })
    .from(schema.verification)
    .where(like(schema.verification.identifier, `${prefix}%`))
    .orderBy(desc(schema.verification.createdAt))
    .limit(1);
  if (!row) throw new Error('no reset token in the e2e database');
  return row.identifier.slice(prefix.length);
}
