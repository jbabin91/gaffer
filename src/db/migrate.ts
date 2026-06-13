import type { PGlite } from '@electric-sql/pglite';

// Bundle the generated SQL migrations as raw strings so they ship to the
// browser; drizzle-kit's filesystem migrator isn't available client-side.
const migrationFiles = import.meta.glob<string>('./migrations/*.sql', {
  eager: true,
  import: 'default',
  query: '?raw',
});

export async function runMigrations(pg: PGlite): Promise<void> {
  await pg.exec(
    `CREATE TABLE IF NOT EXISTS __migrations (
      tag text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );`,
  );

  const result = await pg.query<{ tag: string }>(
    'SELECT tag FROM __migrations',
  );
  const applied = new Set(result.rows.map((r) => r.tag));

  const pending = Object.entries(migrationFiles)
    .map(([path, sql]) => ({ sql, tag: tagFromPath(path) }))
    .filter(({ tag }) => !applied.has(tag))
    .toSorted((a, b) => a.tag.localeCompare(b.tag));

  for (const { sql, tag } of pending) {
    try {
      await pg.transaction(async (tx) => {
        await tx.exec(sql);
        await tx.query('INSERT INTO __migrations (tag) VALUES ($1)', [tag]);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Migration "${tag}" failed: ${message}`, {
        cause: error,
      });
    }
  }
}

function tagFromPath(path: string): string {
  return path
    .split('/')
    .pop()!
    .replace(/\.sql$/, '');
}
