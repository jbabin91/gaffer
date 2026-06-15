# FC 26 Career Hub

Self-hosted companion for tracking, organizing, and planning an EA Sports FC 26
manager career — squad, player development, and (planned) seasons, transfers, and
finances.

Built with TanStack Start, TanStack Query, and Intent UI (React Aria + Tailwind).
Data lives in a hosted Postgres, reached server-side through TanStack Start
server functions with Drizzle.

## Getting started

```bash
pnpm install           # also wires git hooks
cp .env.example .env   # set DATABASE_URL (or run `pnpm db:dev:up` for a local Postgres)
pnpm db:migrate        # apply migrations
pnpm dev               # http://localhost:3000
```

Full setup, scripts, and conventions: [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md).

## Scripts

```bash
pnpm dev             # vite dev server on :3000
pnpm build           # production build
pnpm test            # vitest
pnpm typecheck       # tsc --noEmit
pnpm lint            # oxlint -> eslint -> markdownlint
pnpm lint:fix        # the same, with --fix
pnpm format          # oxfmt
pnpm format:check    # oxfmt --check
pnpm generate-routes # tsr generate
```

## Structure

- `src/modules/<feature>/{api,hooks,components,lib}` — feature modules
  (`career`, `player`, `catalog`)
- `src/db` — shared Drizzle schema, the Postgres client (`getDb`), and migrations
- `src/components/ui` — Intent UI components; `src/components/icons.tsx` — icon barrel
- `src/routes` — file-based routes with `_app` / `_public` route groups
- `test/`, `e2e/` — shared fixtures (`#test/*`) and end-to-end specs (`#e2e/*`)

Every module's `api/` holds pure `(db, …)` repository functions, invoked through
TanStack Start server functions. Query hooks wrap those via TanStack Query options
factories; a failed read surfaces through the route error boundary rather than a
blank screen.

## Tooling

oxlint + eslint for linting, oxfmt for formatting, lefthook for git hooks, and
commitlint for conventional commit messages.

Docs: [TanStack Start](https://tanstack.com/start) ·
[TanStack Router](https://tanstack.com/router) ·
[TanStack Query](https://tanstack.com/query)
