# Architecture

A companion for EA Sports FC 26 manager career mode, backed by a hosted Postgres
behind TanStack Start server functions. Single-user for now; accounts and invites
land in a later phase (see `docs/specs/0001`).

## Shape

- **Server data layer.** Data lives in a Postgres database reached over
  node-postgres. `getDb()` in `src/db/client.ts` is **server-only** (it throws in
  the browser) and is the single entry point to the database.
- **Data access via server functions.** The browser never touches the database;
  it calls TanStack Start server functions (`createServerFn`) over an RPC bridge.
  `DATABASE_URL` is validated at the server boundary by `src/configs/env.ts`
  (t3-env).

## Feature modules

Code is organized by feature under `src/modules/<feature>/`:

- `schemas/` — zod input schemas (drizzle-zod, column-synced) plus the inferred
  input types. Isomorphic: the api validators and any client form share them.
- `services/` — query logic, `fn(db, …)` (server-only).
- `api/` — `createServerFn` endpoints. They dynamic-import their services so the
  server-only query layer stays out of the client bundle (only the RPC stub and
  the validator ship to the browser).
- `hooks/` — TanStack Query hooks and query-options factories; call the api/
  server functions.
- `components/` — React components.

Current modules: `career`, `player`, `catalog`.

## Data flow

```text
component → hook (TanStack Query) → api server fn (RPC) → service → Drizzle → Postgres
```

- Query keys use co-located query-options factories (the TkDodo pattern) so a
  single key invalidation refreshes related queries.
- Reads are loud: the QueryClient sets `throwOnError: true`, so a failed read
  surfaces through the route error boundary rather than a blank screen. Catalog
  search opts out so a search failure degrades inline.
- `staleTime: Infinity` — the only writer is the user's own mutations, which
  invalidate the keys they touch.

## The service seam

Services take the database as an argument and never reach for `getDb()`
themselves — `getDb()` is injected by the api layer. That keeps services pure and
unit-testable against any database handle (production pool or test container).
