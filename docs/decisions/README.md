# Decisions

Decision records for the FC 26 career companion.

A decision record captures:

- Context: what we knew at the time
- Decision: what we chose
- Consequences: tradeoffs and follow-ups

## Conventions

- File naming: `NNNN-short-title.md`
- Status: `Proposed` | `Accepted` | `Rejected` | `Superseded`
- When a decision changes: add a new record and mark the old one `Superseded`.

## Template

Use `docs/decisions/0000-template.md`.

## Index

- `0001-tanstack-start.md` — TanStack Start as the app framework
- `0002-pglite-drizzle-local-first.md` — PGlite + Drizzle as the local-first data layer (Superseded by 0009)
- `0003-intent-ui-react-aria.md` — Intent UI on React Aria + Tailwind v4
- `0004-oxlint-oxfmt.md` — oxlint + oxfmt as the lint/format toolchain
- `0005-repository-sync-seam.md` — repository functions as the future sync seam
- `0006-keyed-development-snapshots.md` — append-keyed snapshots + denormalized ratings
- `0007-catalog-text-and-numbers-only.md` — catalog stores text and numbers only
- `0008-unit-integration-test-split.md` — Vitest unit/integration project split
- `0009-self-hosted-multi-user.md` — self-hosted, multi-user, invite-based (Proposed)
- `0010-docker-deployment.md` — Docker image + compose as the canonical deploy (Proposed)
- `0011-license-and-naming.md` — MIT license, named Gaffer (Proposed)
- `0012-data-acquisition.md` — ship the importer, not the data (Proposed)
- `0013-auth-and-invites.md` — Better Auth + invite-only registration (Accepted)
- `0014-state-management.md` — layered state model (Query / Router / Form / @xstate/store / React primitives) (Accepted)
- `0015-auth-as-feature-module.md` — auth collapses into `src/modules/auth`; `lib/auth` retired (Accepted)
