import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { runMigrations } from '#/db/migrate';
import * as schema from '#/db/schema';

import { setContainer, stopContainer } from './support/container';
import {
  E2E_DATABASE_URL,
  E2E_DB_NAME,
  E2E_DB_PASSWORD,
  E2E_DB_PORT,
  E2E_DB_USER,
} from './support/env';

// Fixed host port keeps the URL static for the webServer config in playwright.config.ts.
export default async function globalSetup(): Promise<void> {
  let container: StartedPostgreSqlContainer;
  try {
    container = await new PostgreSqlContainer('postgres:17-alpine')
      .withDatabase(E2E_DB_NAME)
      .withUsername(E2E_DB_USER)
      .withPassword(E2E_DB_PASSWORD)
      .withExposedPorts({ container: 5432, host: E2E_DB_PORT })
      .start();
  } catch (error) {
    throw new Error(
      `Failed to start the e2e Postgres container — is port ${E2E_DB_PORT} free? A previous run may have leaked a container (docker ps).`,
      { cause: error },
    );
  }
  setContainer(container);

  // Playwright skips globalTeardown when globalSetup throws, so stop the
  // container here if migration fails rather than leaking it on port 5440.
  const pool = new Pool({ connectionString: E2E_DATABASE_URL });
  try {
    await runMigrations(drizzle(pool, { casing: 'snake_case', schema }));
  } catch (error) {
    await stopContainer();
    throw error;
  } finally {
    await pool.end();
  }
}
