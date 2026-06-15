import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { env } from '#/configs/env';
import { logger } from '#/lib/logger';

import * as schema from './schema';

export type DB = NodePgDatabase<typeof schema>;

// Inferred from the callback signature — no named transaction type is exported.
export type Transaction = Parameters<Parameters<DB['transaction']>[0]>[0];

export type Database = DB | Transaction;

let pool: Pool | undefined;
let dbInstance: DB | undefined;

/**
 * The server database, reached over a shared connection pool. node-postgres
 * connects lazily on first query, so this is cheap to call; migrations run out
 * of band (drizzle-kit / runMigrations), not on open.
 *
 * Server-only: data access flows through TanStack Start server functions, never
 * straight from the browser.
 *
 * @throws {TypeError} when called in the browser.
 */
export function getDb(): DB {
  if (globalThis.window !== undefined) {
    throw new TypeError(
      'getDb() is server-only; the database is not reachable from the browser.',
    );
  }

  if (!pool) {
    pool = new Pool({ connectionString: env.DATABASE_URL });
    // pg emits 'error' on idle pooled clients (server restart, failover); with
    // no listener Node treats it as unhandled and crashes the process. pg
    // discards the client and reconnects on the next query.
    pool.on('error', (error) => {
      logger.error({ err: error }, 'idle pool client error');
    });
  }
  dbInstance ??= drizzle(pool, { casing: 'snake_case', schema });
  return dbInstance;
}
