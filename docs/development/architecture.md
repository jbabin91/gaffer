# Architecture

A local-first, browser-only companion for EA Sports FC 26 manager career mode.

## Shape

- **Local-first, no backend.** All data lives in the browser via PGlite
  (Postgres on WebAssembly) persisted to IndexedDB. There is no server or API.
- **Client-only database.** `getDb()` in `src/db/client.ts` throws under SSR and
  is the single entry point to the database. UI is gated on mount so queries run
  client-side; no route loader touches the database.

## Feature modules

Code is organized by feature under `src/modules/<feature>/`:

- `api/` — pure repository functions, `fn(db, …)` (see `docs/decisions/0005`)
- `hooks/` — TanStack Query hooks and query-options factories
- `components/` — React components
- `lib/` — small helpers

Current modules: `career`, `player`, `catalog`.

## Data flow

```text
component → hook (TanStack Query) → repository fn(db, …) → Drizzle → PGlite
```

- Query keys use co-located query-options factories (the TkDodo pattern) so a
  single key invalidation refreshes related queries.
- Reads are loud: the QueryClient sets `throwOnError: true`, so a failed read
  surfaces through the route error boundary rather than a blank screen. Catalog
  search opts out so a search failure degrades inline.
- `staleTime: Infinity` — the only writer is the user's own mutations, which
  invalidate the keys they touch.

## The sync seam

Repositories take the database as an argument and never reach for `getDb()`
themselves. That keeps the database the one place a future sync engine (Electric
or TanStack DB) would plug in, without touching feature code.
