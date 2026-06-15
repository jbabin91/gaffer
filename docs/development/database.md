# Database

Postgres with Drizzle ORM, reached server-side over node-postgres.

## Client

`src/db/client.ts` owns access:

- `getDb()` — returns a drizzle handle over a shared `pg.Pool` (lazy connect).
  **Server-only**: it throws in the browser. The connection string comes from
  `env.DATABASE_URL` (`src/configs/env.ts`, validated by t3-env). An idle-client
  `error` listener keeps a pooled-connection failure from crashing the process.
- `DB` / `Transaction` / `Database` types — service helpers accept `Database`
  (the db or a transaction handle) so they compose inside `db.transaction(…)`.

Tests use a real Postgres container, not `getDb()` — see `docs/development/testing.md`.

## Schema and migrations

- Schema lives in `src/db/schema.ts` (tables, relations, inferred types).
- Drizzle uses `casing: 'snake_case'`, so camelCase columns map to snake_case
  without per-column names.
- Migrations are SQL files under `src/db/migrations/`. `pnpm db:generate`
  writes one after a schema change; `pnpm db:migrate` (drizzle-kit) applies them.
- `src/db/migrate.ts` (`runMigrations`) is the programmatic migrator used by the
  integration-test harness.

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
