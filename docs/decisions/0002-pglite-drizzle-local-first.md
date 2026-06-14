# Decision 0002: PGlite + Drizzle as the local-first data layer

Date: 2026-06-13
Status: Accepted

> A pivot to self-hosted multi-user is proposed in `0009`; this decision holds
> until that migration (`specs/0001`) lands.

## Context

A career companion holds a single user's data and benefits from working offline
with no account or server to run. We still want real SQL (relations,
transactions, constraints) rather than hand-rolled IndexedDB access.

## Decision

Run PGlite (Postgres compiled to WebAssembly) in the browser, persisted to
IndexedDB, with Drizzle ORM (`drizzle-orm/pglite`) for the schema and queries.
Migrations are bundled as raw SQL and applied at runtime.

## Alternatives considered

- A hosted Postgres + server API — adds hosting, auth, and latency for a single-user tool
- IndexedDB via Dexie — no SQL, relations, or transactions
- SQLite WASM — viable, but Drizzle's Postgres path and our future sync options favor Postgres

## Consequences

- Positive: Real SQL and transactions client-side; no backend to operate; works offline.
- Negative: The PGlite WASM payload is large; `getDb()` is client-only and throws under SSR.
- Follow-ups: Gate UI on mount so queries run client-side; keep the door open for sync (see `0005`).
