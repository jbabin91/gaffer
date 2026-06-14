# Research: Better Auth invite plugins

Date: 2026-06-13
Related: decisions/0013-auth-and-invites

## Summary

Surveyed community Better Auth invite plugins for closed registration.
`better-auth-invitation-only` is the only one built for the before-sign-up gate
model we need; `better-invite` solves a different problem.

## Findings

- **`better-auth-invitation-only`** (MIT, v1.0.0, peer `^1.5.0`) — purpose-built:
  a `before`-sign-up hook rejects code-less sign-ups (`INVITE_REQUIRED`). Hashed
  codes, expiry, max-uses, rate limits, email + OAuth, pluggable store, admin +
  public endpoints, heavy tests and docs. Email is optional (no SMTP). Caveats:
  built against BA 1.5 (verify 1.6); default pending-invite store is in-memory
  (provide a DB-backed store).
- **`better-invite`** (MIT, 0.5.x, peer `^1.6.2`) — actively maintained, on 1.6,
  supports codes/URLs/max-uses/roles — but its model is an `after`-sign-up role
  upgrade on open registration. It cannot gate registration (no require-invite
  option; disabling open signup breaks its hook). Wrong shape for invite-only.
- `@better-auth-extended/app-invite` (stale, pre-1.6) and `@better-auth-kit/app-invite`
  (abandoned) — not viable.
- The org plugin does email-targeted org invitations — heavier and assumes email.
- Closed registration is a known Better Auth gap; the common DIY is a
  `before`-hook via `createAuthMiddleware` (~200 LOC).

## Decision input

Adopt (or lightly fork) `better-auth-invitation-only`; reimplementing its tested
security is not worth it. Verify on Better Auth 1.6 before committing.

## Sources

- [better-auth-invitation-only](https://github.com/vcode-sh/better-auth-invitation-only)
- [better-invite](https://github.com/better-invite/better-invite)
