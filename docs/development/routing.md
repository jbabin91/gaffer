# Routing

TanStack Router with the file-based route plugin. Routes live in `src/routes/`
and the route tree is generated to `src/routeTree.gen.ts`.

## Layout groups

- `_app/` — route group for the main application screens
- `_public/` — route group for public/entry screens
- `api/auth/$` — Better Auth handler, a server-side splat route under `api/`
- `$playerId` — dynamic path parameter (typed via the route)
- `__root.tsx` — root route, including the app-wide error component

## Conventions

- Generate the route tree with `pnpm generate-routes` (or it regenerates on
  `pnpm dev`). The generated file is committed.
- `getDb()` is server-only, so route loaders (which also run on the client during
  navigation) must not call it. Data is fetched in components via TanStack Query
  once mounted.
- Query errors propagate to the root error component (`throwOnError: true`),
  so route screens don't each need their own error handling for reads.
