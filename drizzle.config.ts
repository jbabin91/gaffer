import { defineConfig } from 'drizzle-kit';

// PGlite speaks Postgres. drizzle-kit only generates SQL here; migrations are
// applied at runtime in the browser (see src/db/migrate.ts).
export default defineConfig({
  dialect: 'postgresql',
  driver: 'pglite',
  out: './src/db/migrations',
  schema: './src/db/schema.ts',
  strict: true,
  verbose: true,
});
