# Database

PGlite (Postgres on WebAssembly) with Drizzle ORM, persisted to IndexedDB.

## Client

`src/db/client.ts` owns access:

- `getDb()` — lazily opens the persisted database. Client-only: it throws under
  SSR. A failed init (blocked IndexedDB, failed migration) is not cached, so a
  later call can retry.
- `createMemoryDb()` — a fresh in-memory database with migrations applied, used
  by tests.
- `DB` / `Transaction` / `Database` types — repository helpers accept `Database`
  (the db or a transaction handle) so they compose inside `db.transaction(…)`.

## Schema and migrations

- Schema lives in `src/db/schema.ts` (tables, relations, inferred types).
- Migrations are SQL files under `src/db/migrations/`, bundled via
  `import.meta.glob` and applied at runtime by `src/db/migrate.ts`.
- Generate new migrations with Drizzle Kit after a schema change.

## Conventions

- IDs are `gen_random_uuid()` text primary keys; catalog rows use a numeric id
  from the source dataset.
- Cascade deletes from `careers` down to `seasons`, `players`, and snapshots.
- A partial unique index enforces one current season per career.

## The snapshot model

`player_snapshots` is unique on `(player_id, in_game_week)`. Recording a week
upserts that point rather than appending a duplicate. The player row carries
denormalized current ratings synced from the highest in-game week. See
`docs/decisions/0006`.
