# Architecture

A companion for EA Sports FC 26 manager career mode, backed by a hosted Postgres
behind TanStack Start server functions. Multi-user auth is landing in phases
(see `docs/specs/0001`): Better Auth core (email/password + admin) has landed;
user-scoped data and invite gating are still in progress.

## Shape

- **Server data layer.** Data lives in a Postgres database reached over
  node-postgres. `getDb()` in `src/db/client.ts` is **server-only** (it throws in
  the browser) and is the single entry point to the database.
- **Data access via server functions.** The browser never touches the database;
  it calls TanStack Start server functions (`createServerFn`) over an RPC bridge.
  `DATABASE_URL` is validated at the server boundary by `src/configs/env.ts`
  (t3-env).

## Feature modules

Code is organized by feature under `src/modules/<feature>/`. Feature code —
including auth — lives in a module; `src/lib/` is reserved for cross-cutting
infra (logger, request-context) that no single feature owns.

- `schemas/` — Zod input schemas (drizzle-zod, column-synced) plus the inferred
  input types, **one descriptively-named file per schema** (`schemas/login.ts`)
  so the filename is the schema. Isomorphic: the api validators and any client
  form share them.
- `services/` — query logic, `fn(db, …)` (server-only).
- `api/` — `createServerFn` endpoints, **one server fn per file**, holding only
  `createServerFn` definitions and type re-exports (a plain export here drags
  server deps into the client bundle). Auth's `api/get-session.ts` is the worked
  example; `career`/`player`/`catalog` still bundle multiple fns and
  dynamic-import their services, pending the static-import migration (`gf-fwi.17`).
- `lib/` — module-local helpers and singletons (auth keeps its Better Auth
  `server.ts`/`client.ts` here; `server.ts` carries the `server-only` marker).
- `hooks/` — TanStack Query hooks and per-module query-options factories (the
  TkDodo pattern; no generic key-factory abstraction).
- `components/` — React components.

Two things both called "schema" stay distinct: the per-module Zod **validation**
schemas above, and the Drizzle **table** schemas, which stay centrally
aggregated in `src/db/schema.ts` for the single `drizzle({ schema })` import.

**New module vs extend an existing one:** create a new module for a new domain
entity with its own schema and lifecycle (a future `seasons` or `transfers`);
extend a module for a new operation or view on an existing entity (a server fn,
hook, or component into its `api/`/`hooks/`/`components/`). A tightly-coupled
sub-domain (e.g. player snapshots) stays a file inside the parent module;
anything used by two or more modules belongs in `src/lib` (infra) or
`src/components/ui` (shared UI), never a module.

These are deliberate, uniform choices — Zod validation schemas (not a separate
models/validators split), tables centralized in `src/db` (not per-module `db/`
folders), and the `#/` alias throughout. They diverge from the sibling
finance-tracker app on purpose; keep new modules consistent with fc-2026 rather
than harmonizing toward that reference.

Current modules: `auth`, `career`, `player`, `catalog`.

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
