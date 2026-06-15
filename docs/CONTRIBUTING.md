# Contributing

Local setup, workflow, and project conventions.

## Quick start

```bash
mise install   # pins Node + pnpm (see mise.toml)
pnpm install   # also wires git hooks via lefthook's postinstall
cp .env.example .env   # set DATABASE_URL to your Postgres
pnpm db:migrate        # apply migrations
pnpm dev               # http://localhost:3000
```

Data lives in a Postgres database reached server-side; set `DATABASE_URL` in
`.env`. Integration tests start their own Postgres container, so they need
Docker running.

## Scripts

```bash
pnpm typecheck
pnpm lint               # oxlint, then eslint, then markdownlint
pnpm format             # oxfmt
pnpm test               # all tests
pnpm test:unit          # pure tests, no database
pnpm test:integration   # tests against a real Postgres container (needs Docker)
pnpm db:generate        # generate a migration after a schema change
pnpm db:migrate         # apply migrations
pnpm build
```

## Project structure

- `src/modules/<feature>/{schemas,services,api,hooks,components}` — feature
  modules (see `docs/development/architecture.md`)
- `src/db/` — Drizzle schema, the server client, and migrations
- `src/configs/` — validated env and app configuration
- `src/routes/` — TanStack Router file-based routes
- `test/` — shared test harness, imported via `#test/*`

See `docs/development/architecture.md` for the reasoning.

## Git workflow

- Conventional commits, enforced by commitlint (e.g. `feat(player): …`,
  `chore(deps): …`). Run `pnpm dlx czg` for a guided prompt.
- The pre-commit hook runs typecheck, lint, and format.
- When working through Claude Code, changes are run through the review cycle
  (`/review-cycle:review`) before commit. This is a Claude Code workflow, not a
  git hook.

## Conventions

- `docs/development/code-standards.md` — style and the comment policy
- `docs/development/definition-of-done.md` — the green gate
- `docs/development/workflows.md` — hooks, review cycle, dependency updates
