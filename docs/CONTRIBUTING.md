# Contributing

Local setup, workflow, and project conventions.

## Quick start

```bash
mise install   # pins Node + pnpm (see mise.toml)
pnpm install   # also wires git hooks via lefthook's postinstall
pnpm dev       # http://localhost:3000
```

The database is PGlite running in the browser and persisted to IndexedDB. There
is no server or container to start.

## Scripts

```bash
pnpm typecheck
pnpm lint               # oxlint, then eslint, then markdownlint
pnpm format             # oxfmt
pnpm test               # all tests
pnpm test:unit          # pure tests, no database
pnpm test:integration   # tests that spin up an in-memory PGlite
pnpm build
```

## Project structure

- `src/modules/<feature>/{api,hooks,components,lib}` — feature modules
- `src/db/` — Drizzle schema, the client seam, and migrations
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
