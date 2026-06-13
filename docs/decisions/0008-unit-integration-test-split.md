# Decision 0008: Split tests into unit and integration Vitest projects

Date: 2026-06-13
Status: Accepted

## Context

Repository and hook tests run against a real in-memory PGlite (`createMemoryDb`),
which spins up WASM and applies migrations per test. Pure tests (key factories,
chart math) have no such cost. We want to run the fast ones cheaply (e.g. in a
future pre-commit step) and keep the slower ones for full runs and CI.

## Decision

Use Vitest `projects`: `unit` (`**/*.test.{ts,tsx}`, excluding integration) and
`integration` (`**/*.integration.test.{ts,tsx}`). Files that touch a database
are named `*.integration.test.*`. Scripts: `pnpm test` (all), `pnpm test:unit`,
`pnpm test:integration`.

## Alternatives considered

- One flat suite — no way to run only the fast tests
- CLI glob filters instead of projects — brittle path matching; projects are explicit

## Consequences

- Positive: `test:unit` is near-instant; the split is self-documenting via filenames.
- Negative: Contributors must name database-touching tests `*.integration.test.*`.
- Follow-ups: Wire `test:unit` into pre-commit once the test step is added (see `docs/development/workflows.md`).
