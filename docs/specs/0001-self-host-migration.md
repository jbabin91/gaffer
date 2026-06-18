# Spec: Self-host migration (local-first → hosted multi-user)

Status: draft
Date: 2026-06-13

## Context

Implements `0009` (self-hosted multi-user), `0010` (Docker), and `0011` (MIT +
Gaffer). Moves the app from browser-only PGlite to a hosted Postgres with
accounts, user-owned data, invite-based access, and a Docker deployment, reusing
the schema, repositories, UI, and query layer.

## Scope

**In scope:**

- User accounts (Better Auth) with invite-code-gated, closed sign-up
- User-owned data: `userId` on `careers`, ownership scoping on every query
- Server-side data access via TanStack Start server functions
- Hosted Postgres; migrations run on boot
- Docker image + compose; GHCR publishing; self-host docs
- Catalog importer (CSV/JSON), provenance-aware; no bundled ratings (`0012`)

**Out of scope (deferred):**

- Offline / sync (PGlite-as-client, TanStack DB / Electric)
- Co-op / shared careers — decided out (`0009`): career mode is single-player
- Centrally-hosted multi-tenant SaaS

## What ports vs. what's new

- **Ports:** `src/db/schema.ts` (PGlite is Postgres), Drizzle queries and
  migrations, repository functions (`fn(db, …)`), feature modules, UI, TanStack
  Query/Router.
- **New:** auth + invites, `userId` + ownership scoping, server functions, the
  Docker/compose packaging, `.env.example`, CI image publishing, self-host docs.

## Phases

1. **Server data layer.** Point Drizzle at a server Postgres; move data access
   behind server functions; run migrations via `drizzle-kit` (replacing the
   browser runtime migrator). Still single-user, no auth.
2. **Auth + invites.** Better Auth (email/password) + admin plugin; closed
   sign-up gated by `better-auth-invitation-only` (`0013`, verified compatible
   with Better Auth 1.6). The first admin is bootstrapped via a configured
   `INITIAL_ADMIN_EMAIL` (gf-fwi.2.7); other signups need an invite.
3. **User-owned data.** Add `userId` to `careers`; scope every career query and
   mutation to the authenticated user; enforce ownership in server functions.
4. **Packaging.** Multi-stage Dockerfile, `docker-compose.yml` (app + Postgres),
   migrate-on-boot, `.env.example`, GHCR publish via CI.
5. **Self-host polish.** Set up the catalog importer + optional identity baseline
   (`0012`), write backup/restore + HTTPS docs, an admin invite UI, and rename
   `fc-2026` → `gaffer`.

## Data model

- `careers` gains `userId` (FK → user, `onDelete: cascade`).
- New: Better Auth tables (`user`, `session`, `account`, `verification`) plus the
  invite-code table(s) from the chosen approach.
- `seasons`, `players`, `player_snapshots`, `player_catalog` unchanged; ownership
  flows from the career's `userId`.
- Active career: localStorage (v1) or a per-user preference (later, for
  multi-device).

## Open questions

- **Invite plugin variant:** adopt `better-auth-invitation-only` as-is (email-bound
  invites) vs the email-optional fork (open shareable links). 1.6 compatibility is
  verified (`0013`).
- **Test database:** keep PGlite (`createMemoryDb`) as the test db, or run a
  Postgres container in CI.
