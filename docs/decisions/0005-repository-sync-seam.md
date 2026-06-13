# Decision 0005: Repository functions as the future sync seam

Date: 2026-06-13
Status: Accepted

## Context

The app is local-first today, but we want to keep multi-device sync (e.g.
Electric or TanStack DB) reachable without rewriting feature code.

## Decision

Each module's `api/` layer is a set of pure repository functions that take the
database (or a transaction) as their first argument — `fn(db, …)` — and never
call `getDb()` themselves. Hooks supply the database; tests supply an in-memory
one. All persistence flows through `getDb()` in `src/db/client.ts`.

## Alternatives considered

- Hooks calling the database directly — couples data access to React and to tests
- A repository class/abstraction layer — premature; plain functions suffice

## Consequences

- Positive: Repositories are trivially testable against a real in-memory database; the database is the single seam a sync engine would plug into.
- Negative: Callers must thread the database through; a small amount of boilerplate.
- Follow-ups: When sync lands, swap what `getDb()` returns rather than touching feature code.
