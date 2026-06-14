# Decision 0013: Auth and invite-gated registration

Date: 2026-06-13
Status: Proposed

> Implements the access model in `0009`. Background in
> `research/0002-better-auth-invite-plugins.md`. Pending a Better Auth 1.6
> compatibility check.

## Context

Self-hosted instances need accounts with closed, invite-only registration: the
first user is admin and invites close friends; nobody else can register. The
finance-tracker already runs Better Auth on TanStack Start, so the base is
proven.

## Decision

- **Better Auth** (email/password) on TanStack Start, mounted via a catch-all
  auth route (the finance-tracker pattern), with the admin plugin for admin
  users.
- **Invite gate via `better-auth-invitation-only`** — a `before`-sign-up hook
  that rejects sign-ups without a valid invite code (hashed codes, expiry,
  max-uses, rate limits, email + OAuth).
- **Roles: member and admin only.** No resource-level scopes — every user owns
  their own private data (`0009`), so there is nothing to share-scope.
- **Invite delivery: email and manual-share** — the admin gets the code/link to
  send however they like; email is optional (no SMTP required). A small fork
  making the invite's email optional would also allow open shareable links.

## Alternatives considered

- `better-invite` — rejected: its model is an `after`-sign-up role upgrade on
  open registration; it cannot gate signup (disabling open signup breaks its
  hook). Wrong shape.
- Better Auth organization plugin — email-targeted org invitations; heavier,
  org-shaped, assumes email delivery.
- Hand-rolled gate (~200 LOC) — viable, but reimplements hashing, rate limits,
  and OAuth gating the plugin already tests.

## Consequences

- Positive: closed registration via a tested, security-conscious MIT plugin that
  works on TanStack Start.
- Negative: pending verification on Better Auth 1.6 (peer `^1.5.0`); its default
  in-memory pending-invite store needs a DB-backed store in our container.
- Follow-ups: run the 1.6 smoke-test; choose adopt-as-is vs the email-optional
  fork based on whether open links are wanted.
