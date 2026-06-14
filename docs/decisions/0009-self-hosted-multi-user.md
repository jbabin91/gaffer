# Decision 0009: Self-hosted, multi-user (invite-based)

Date: 2026-06-13
Status: Proposed

> Decided direction, not yet built. Supersedes `0002` and amends `0005` when the
> migration in `specs/0001-self-host-migration.md` lands. Until then the app
> stays local-first and browser-only.

## Context

The local-first, browser-only build (`0002`) keeps data trapped in one browser:
no multi-device, no durable backup, and a cleared cache loses everything. We want
this to be a self-hostable tool a small, trusted group can share.

## Decision

Make the app **self-hosted, multi-user software**:

- Anyone can stand up their own instance.
- Per instance, the first user is the admin and invites close friends via an
  **invite code**; open public sign-up is closed.
- **Online-first.** Offline is deferred — PGlite can return later as a per-user
  client over the same Postgres (`0005`).
- Data is **user-owned and private**: every career — and its seasons, players,
  snapshots, and shortlists — belongs to one user; nothing is shared between
  users (career mode is single-player). The only shared, instance-level resource
  is the read-only player catalog.

## Alternatives considered

- Browser-only local-first + export/import — solves durability cheaply but not
  multi-device or shared instances.
- Centrally-hosted multi-tenant SaaS — makes us the hosting provider and data
  custodian for the public; more cost, ops, and legal surface than we want.
- Local-first + sync (TanStack DB / Electric) from the start — premature
  complexity for a product with no users yet.

## Consequences

- Positive: durable, reachable from any device, shareable with friends; each
  deployer owns their hosting and data, so our burden stays small.
- Negative: net-new auth, user-scoped data, a server data boundary with ownership
  checks (the IDOR risk dismissed under browser-only now matters), hosting, and
  per-instance data-custody responsibilities.
- Follow-ups: auth and invite mechanism detailed in `0013`; see `specs/0001`.

## Open questions

- **Active-career persistence:** localStorage per device (today) vs a server-side
  per-user preference so it follows you across devices. Lean: localStorage for
  v1.

Resolved: sharing model — careers are strictly private per user; no co-op or
resource sharing. Auth/invites are detailed in `0013`; catalog data acquisition
in `0012`.
