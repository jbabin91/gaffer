# Decision 0001: Use TanStack Start

Date: 2026-06-13
Status: Accepted

## Context

We want a typed React app with file-based routing, loaders, and the option to
add server rendering later, while staying in one cohesive ecosystem alongside
TanStack Query and TanStack Router.

## Decision

Build on TanStack Start (Vite 8, React 19) with the TanStack Router file-based
route plugin.

## Alternatives considered

- Next.js — heavier, App Router conventions don't fit a local-first SPA well
- Plain Vite + React Router — would re-create routing/loader ergonomics by hand
- Remix — overlaps with what TanStack Router already gives us

## Consequences

- Positive: One TanStack-centric stack; typed routes, loaders, and search params; SSR available if we ever want it.
- Negative: Smaller ecosystem and fewer examples than Next.js; the framework is young.
- Follow-ups: The app is browser-only today (see `0002`), so SSR stays off and route loaders must not touch the database.
