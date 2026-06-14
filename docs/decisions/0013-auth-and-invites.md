# Decision 0013: Auth and invite-gated registration

Date: 2026-06-13
Status: Accepted

> Implements the access model in `0009`. Background in
> `research/0002-better-auth-invite-plugins.md`. The Better Auth 1.6
> compatibility check passed (see Verification).

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
- **Invite delivery: email and manual-share** — the admin gets a code bound to a
  specific email (see Verification) to send however they like; email delivery is
  optional (no SMTP required). A small fork making the invite's email optional
  would also allow open shareable links.

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
  works on Better Auth 1.6 (verified below).
- Negative: its default in-memory pending-invite store needs a DB-backed store in
  our container (it is per-process and lost on restart); the plugin's `isAdmin`
  check relies on a `role` field, so we either run Better Auth's admin plugin or
  pass a custom `isAdmin`.
- Follow-ups: provide a DB-backed `inviteStore`; choose adopt-as-is vs the
  email-optional fork based on whether open shareable links are wanted; design
  the invite-creation UX around email-bound codes (below).

## Verification

Smoke-tested `better-auth-invitation-only@1.0.0` (MIT, peer `^1.5.0`) against
`better-auth@1.6.18` in an isolated in-memory SQLite harness. 7/7 automated
checks passed:

- Plugin loads and `betterAuth()` constructs with it registered.
- Migrations create the `invitation` table.
- The `before`-sign-up gate fires: a code-less `/sign-up/email` is rejected with
  `INVITE_REQUIRED`; a bogus code is rejected with `INVALID_INVITE`.
- An admin-minted, email-matched code lets sign-up through.

Build implications:

- **Invites are email-bound.** The gate enforces `invitation.email === signup
email` (else `EMAIL_MISMATCH`), so the admin creates an invite _for a specific
  address_; a generic shareable link needs the email-optional fork.
- **Bootstrapping the first admin** needs the gate off for that one sign-up —
  `enabled` accepts a function for runtime toggling.
- The invite code is read from `body.inviteCode` on email sign-up; codes are
  stored only as SHA-256 hashes.
