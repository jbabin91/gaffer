# Routing

TanStack Router with the file-based route plugin. Routes live in `src/routes/`
and the route tree is generated to `src/routeTree.gen.ts`.

## Layout groups

- `_app/` — pathless layout for the main application shell
- `_public/` — pathless layout for public/entry screens
- `$playerId` — dynamic path parameter (typed via the route)
- `__root.tsx` — root route, including the app-wide error component

## Conventions

- Generate the route tree with `pnpm generate-routes` (or it regenerates on
  `pnpm dev`). The generated file is committed.
- Because the database is client-only, route loaders must not call `getDb()`.
  Data is fetched in components via TanStack Query once mounted.
- Query errors propagate to the root error component (`throwOnError: true`),
  so route screens don't each need their own error handling for reads.
