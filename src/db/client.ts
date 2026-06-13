import { PGlite } from '@electric-sql/pglite';
import { drizzle, type PgliteDatabase } from 'drizzle-orm/pglite';

import { runMigrations } from './migrate';
import * as schema from './schema';

export type DB = PgliteDatabase<typeof schema>;

// Inferred from the callback signature — no named transaction type is exported.
export type Transaction = Parameters<Parameters<DB['transaction']>[0]>[0];

// Repository helpers accept either so they can run standalone or be composed
// inside a transaction.
export type Database = DB | Transaction;

const IDB_NAME = 'idb://fc-2026';

let dbPromise: Promise<DB> | undefined;

/**
 * Lazily open the local-first database. PGlite persists to IndexedDB, so this
 * only runs in the browser — server/SSR code must not call it.
 *
 * All persistence flows through this module (and the repositories that use it),
 * which is the seam a future sync layer (Electric / TanStack DB) plugs into.
 */
export function getDb(): Promise<DB> {
  if (globalThis.window === undefined) {
    throw new TypeError(
      'getDb() is client-only; PGlite cannot run during SSR.',
    );
  }
  // Don't cache a rejected init (blocked IndexedDB, failed migration). Clearing
  // it lets a later call retry instead of wedging the app on a poisoned promise.
  dbPromise ??= open(IDB_NAME).catch((error) => {
    dbPromise = undefined;
    throw error;
  });
  return dbPromise;
}

export async function createMemoryDb(): Promise<DB> {
  const client = await PGlite.create();
  return init(client);
}

async function open(dataDir: string): Promise<DB> {
  const client = await PGlite.create(dataDir);
  return init(client);
}

async function init(client: PGlite): Promise<DB> {
  await runMigrations(client);
  return drizzle(client, { schema });
}
