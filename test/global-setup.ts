import type { TestProject } from 'vitest/node';

import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { runMigrations } from '#/db/migrate';
import * as schema from '#/db/schema';

// One Postgres container for the whole run, migrated once; tests reset data between them.
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
