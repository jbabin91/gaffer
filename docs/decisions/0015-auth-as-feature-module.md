# Decision 0015: Auth as a feature module

Date: 2026-06-18
Status: Accepted

> Builds on `0013` (Better Auth + invite-only registration) — this records where
> auth _code_ lives, not the auth mechanism. Generalizes the "Feature modules"
> section of `docs/development/architecture.md`. The `api/` static-import +
> `server-only`/`client-only` marker discipline it relies on is owned by
> `gf-fwi.17`, not re-decided here.

## Context

Auth code is scattered across three places: `src/lib/auth/` (Better Auth server
config, the client SDK, the session server function, the invite store, the form
schemas, the curated error copy), `src/routes/_auth/` (the login / sign-up /
forgot-password / reset-password route files), and `src/components/` (the
sign-out button). The four `_auth` route files are also ~85% duplicated: each
hand-rolls the same `useAppForm` + `authClient` call + error mapping (429 →
rate-limit, network throw → log + generic, result error → form/field) + the
Card / field / submit / error skeleton. The security-relevant "never surface raw
server text" rule therefore has four places to drift.

`architecture.md` already says feature code lives in `src/modules/<feature>/`.
Auth is a feature, yet it alone is split between `lib/` and `routes/`. The sibling
finance-tracker app treats auth as a full feature module and keeps only the two
Better Auth singletons in a thin `lib/auth/` — which on inspection is inertia, not
a deliberate seam (nothing else in `lib/` imports them).

## Decision

Auth becomes a feature module with a single home; `src/lib/auth/` is retired.

- `src/modules/auth/` owns the whole feature:
  - `lib/server.ts` (Better Auth config, `server-only` marked), `lib/client.ts`
    (the `authClient`, `client-only` marked), `lib/sanitize-redirect.ts`
    (extracted from today's `schemas.ts`), `lib/invite-store.ts`
  - `api/get-session.ts` (was `lib/auth/functions.ts`): a static import of the
    marked server; an isomorphic RPC boundary, so it is _not_ marked
  - `schemas/` (form Zod) — one file per form, named so the filename is the
    schema: `login.ts`, `sign-up.ts`, `forgot-password.ts`, `reset-password.ts`,
    plus a shared `fields.ts` for the reused field validators (email, password,
    invite, name) — and `messages.ts` (curated auth copy) at the module root
  - `hooks/use-auth-submit.ts`, `hooks/use-sign-out.ts`
  - `components/` — the auth-form primitives (`auth-card`, `auth-links`) and one
    component per page (`login-form`, `sign-up-form`, `forgot-password-form`,
    `reset-password-form`)
- `src/routes/_auth/*.tsx` are shells: `validateSearch` / `beforeLoad` plus a
  local `Page` that reads route-typed context (`useSearch`, `useNavigate`, the
  reset `?token`) and hands the module form plain props, keeping the form
  router-agnostic and unit-testable.
- `src/lib/` holds only cross-cutting infra (logger, request-context, …). The lone
  generic `UNEXPECTED_ERROR_MESSAGE` (root error boundary) moves to
  `src/lib/messages.ts`.
- The four forms dedupe behind shared primitives, not a single config-driven
  component. `useAuthSubmit` owns the error taxonomy (429 → rate-limit, network
  throw → `logError` + generic, result error → per-page form/field map, an
  `enumerationSafe` flag for forgot-password). `AuthCard` owns the card / field /
  submit / error skeleton. Each page stays a distinct component so its divergence
  (forgot's success card, reset's no-token card) stays local.

The sign-out _logic_ (`use-sign-out`) is an auth-module concern; the sign-out
_button UI_ is authenticated-app chrome and belongs in the header layout
(`gf-t5m`), not in `modules/auth/components/`.

## Alternatives considered

- Keep a thin `lib/auth/` for the two singletons (the finance-tracker layout) —
  rejected: nothing else in `lib/` imports them, so the tier earns no seam.
- A three-way split (`lib/auth` infra + `modules/auth` UI + `routes/_auth`) —
  rejected for the same reason; the `lib/auth` tier carried no weight.
- One generic config-driven `<AuthForm>` for all four pages — rejected: the pages
  diverge enough (success-replaces-form, no-token render, variable field sets)
  that the config accretes conditionals, defeating the small-interface goal.
- Move the auth email templates in the same change — deferred to its own bead;
  `lib/email` also holds generic transport, so that move is its own focused step.

## Consequences

- Positive: one home for auth; `lib/` is honest cross-cutting infra; matches the
  feature-module convention; the curated-error invariant lives in one tested
  `useAuthSubmit`; a new auth page is a thin adapter.
- Constraint: bundle isolation is enforced by the `@tanstack/react-start/server-only`
  and `client-only` markers on `lib/server.ts` / `lib/client.ts`, not by folder —
  the markers travel with the files. `api/get-session.ts` stays an unmarked
  isomorphic boundary.
- Constraint: only feature code moves — the auth `pgTable` definitions do **not**.
  "Schema" means two things: the per-form Zod validation schemas split into
  `modules/auth/schemas/`, but the Drizzle table schemas stay centrally
  aggregated in `src/db/schema.ts`, because `drizzle(client, { schema })` needs a
  single `schema` object for relational queries and the adapter. The auth tables
  (`user`, `session`, `account`, `verification`, `invitation`, `invite_pending`)
  stay put; `modules/auth/lib/server.ts` imports them from `#/db/schema`
  (a `modules → db` import). This is why the central `src/db` layout is kept
  rather than per-module `db/` folders.
- Negative: ~11 import sites repoint to `#/modules/auth/*`; a broad-but-mechanical
  move, best landed as its own commit (Stage A) before the form dedup (Stage B).
- Follow-ups: auth email templates → `modules/auth/emails/` (separate bead);
  sign-out button into the header (`gf-t5m`); the `api/` static-import + marker
  discipline is owned by `gf-fwi.17`, whose Part-A paths for
  `lib/auth/{server,client}.ts` update to `modules/auth/lib/*` after this move.
