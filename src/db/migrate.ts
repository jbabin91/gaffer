import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { fileURLToPath } from 'node:url';

import type { DB } from './client';

// Resolve relative to this module so migrations are found regardless of cwd.
const migrationsFolder = fileURLToPath(new URL('migrations', import.meta.url));

export async function runMigrations(db: DB): Promise<void> {
  await migrate(db, { migrationsFolder });
}
