# Decision 0014: State management

Date: 2026-06-15
Status: Accepted

> Builds on `0001` (TanStack Start gives us Query + Router) and `0003` (Intent UI
> on React Aria). Auth session state is owned by `0013`.

## Context

Features need a consistent answer to "where does this piece of state live?" so
each one doesn't reinvent it — and so the default isn't to reach for a global
store. The state in this app splits into a few distinct kinds (server data, URL
view-state, form-editing sessions, ad-hoc client state), each with a natural
owner. TanStack Start already ships Query and Router; the decision is the
boundaries between them and what fills the gaps.

## Decision

One kind of state, one owner:

1. **Server state → TanStack Query.** Anything that lives in the database and is
   fetched over a server function: caching, background refetch, mutations,
   invalidation, optimistic updates. The auth session (Better Auth's client) is
   server state too (`0013`).
2. **URL / view state → TanStack Router search params.** Filter, sort,
   pagination, selected tab — anything that should survive a reload and be
   shareable as a link. `validateSearch` + Zod, `fallback()` for defaults,
   `stripSearchParams` to keep defaults out of the URL.
3. **Form state → TanStack Form**, bound to Intent UI / React Aria field
   components (`0003`) with `validationBehavior="aria"` so validation is driven
   by the form library rather than native browser UI. Reuse the Zod input
   schemas (Standard Schema) for both client and server validation.
4. **Additional client state → `@xstate/store-react`.** Shared client state that
   is not server, URL, or form state — Zustand-shaped stores or Jotai-shaped
   atoms from one dependency, with `persist`/undo when warranted. Client-side
   only (see Consequences).
5. **Everything else → React primitives.** `useState`/`useReducer` for local
   component state; context for stable dependency injection (values that rarely
   change), not as an app-wide store.

Cross-cutting UI concerns use a purpose-built library, not `@xstate/store`:

- **Theme → next-themes** — already shipped; the worked example of this rule. Its
  pre-paint script owns the `.dark` class, so theme is never an `@xstate/store`
  concern.
- **Toasts → Intent UI's toast component** (a sonner wrapper, consistent with
  `0003`) — added when the first toast is needed.

Forms are not a silo separate from server state. A form owns the input and
validation; it submits through the existing Query mutation → server function →
`invalidateQueries` flow. The form owns the editing session; Query owns the
cache.

## Alternatives considered

- One global store (Zustand / Redux / Jotai) for everything — rejected: collapses
  server cache, URL state, and forms into hand-managed global state, throwing away
  Query's caching/invalidation and Router's shareable URLs.
- Server state in a client store or context — rejected: reimplements the caching,
  dedup, and background refetch Query already provides.
- View state in a client store instead of the URL — rejected: filter/sort/page in
  a store is not shareable, linkable, or reload-surviving; the URL is its home.
- shadcn-style forms (Radix / base-ui `Field`) — rejected: adds a second
  component primitive alongside Intent UI / RAC, reversing `0003`; RAC already
  ships the field-layout system, so we bind TanStack Form to that instead.

## Consequences

- Positive: one obvious home per kind of state; minimal global state; view-state
  URLs are shareable; server cache and forms stay decoupled; a single Zod schema
  validates the form and the server function.
- Install timing: Query and Router are in use; **`@tanstack/react-form` and
  `@xstate/store-react` are chosen but not yet installed** — add each at its first
  real consumer rather than carrying an unused dependency.
- `@xstate/store` is client-side state. A module-level store is a singleton shared
  across SSR requests, so a store must not be read during server render (or must
  be created per request). The `persist` extension is localStorage-based and
  inherently client-only. next-themes already handles theme this way, which is why
  theme sits outside this layer.
- Forms ↔ server validation: client Zod is half the story — a server function's
  `.validator` (or a uniqueness check) can also reject. Map those failures back to
  fields (RAC `<Form>` `validationErrors` / TanStack Form `setFieldMeta`) so a
  server-side error renders on the field, not as a bare toast.
- Form schema reuse depends on **`gf-fwi.8`**: `drizzle-zod` widens nullable
  columns to `T | null | undefined`. Normalize to undefined-only before forms
  consume those input schemas, or forms inherit the messy shapes.
- Devtools cover the two load-bearing layers (Query + Router devtools, already
  installed); `@xstate/store` has no equivalent panel, so keep stores small and
  inspectable.
- Follow-ups: build reusable TanStack Form ↔ Intent UI field wrappers;
  resolve `gf-fwi.8` before wiring forms; wire RAC navigation to the router
  (`gf-rpu`) so link-based components route client-side.
