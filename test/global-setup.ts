import type { TestProject } from 'vitest/node';

import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { runMigrations } from '#/db/migrate';
import * as schema from '#/db/schema';

/**
 * Start one Postgres container for the whole integration run, migrate it once,
 * and hand the connection URL to the test workers via provide()/inject().
 * Integration tests reset data between tests rather than restarting the engine.
 */
export default async function setup({ provide }: TestProject) {
  const container = await new PostgreSqlContainer('postgres:17-alpine').start();
  try {
    const url = container.getConnectionUri();

    const pool = new Pool({ connectionString: url });
    try {
      await runMigrations(drizzle(pool, { casing: 'snake_case', schema }));
    } finally {
      await pool.end();
    }

    provide('databaseUrl', url);
  } catch (error) {
    // Don't leak the container if bootstrap migration fails.
    await container.stop();
    throw error;
  }

  return async () => {
    await container.stop();
  };
}
