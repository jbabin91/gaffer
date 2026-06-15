import { ilike, sql } from 'drizzle-orm';

import type { DB } from '#/db/client';

import { type CatalogPlayer, playerCatalog } from '#/db/schema';

/**
 * Returns an empty array for queries under 2 trimmed characters. LIKE
 * wildcards in the term are escaped so `%`/`_` match literally.
 */
export async function searchCatalog(
  db: DB,
  query: string,
  limit = 20,
): Promise<CatalogPlayer[]> {
  const term = query.trim();
  if (term.length < 2) return [];

  // Escape LIKE wildcards so a literal % or _ in a name matches literally.
  const escaped = term.replaceAll(/[\\%_]/g, String.raw`\$&`);

  return db
    .select()
    .from(playerCatalog)
    .where(ilike(playerCatalog.fullName, `%${escaped}%`))
    .orderBy(sql`${playerCatalog.overall} DESC NULLS LAST`)
    .limit(limit);
}

export async function catalogCount(db: DB): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(playerCatalog);
  return row?.count ?? 0;
}

/**
 * Idempotent on id (onConflictDoNothing). Text + numbers only — never store
 * crests, photos, or EA branding.
 * @returns count of rows actually inserted (conflicts are skipped).
 */
export async function importCatalog(
  db: DB,
  rows: (typeof playerCatalog.$inferInsert)[],
): Promise<number> {
  if (rows.length === 0) return 0;

  const CHUNK = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const result = await db
      .insert(playerCatalog)
      .values(chunk)
      .onConflictDoNothing()
      .returning({ id: playerCatalog.id });
    inserted += result.length;
  }
  return inserted;
}
