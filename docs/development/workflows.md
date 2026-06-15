# Workflows

## Toolchain

Node and pnpm are pinned in `mise.toml`. `mise install` provisions them;
`pnpm install` installs dependencies and wires the git hooks (lefthook's
postinstall, permitted via the `allowBuilds` entry in `pnpm-workspace.yaml`).

## Git hooks (lefthook)

- **pre-commit** — typecheck, lint (with `--fix`), and format, restaging fixed
  files.
- **commit-msg** — commitlint enforces conventional commits.

## Commits

Conventional commits, scoped to the feature or area (e.g. `feat(player): …`,
`chore(deps): …`, `docs: …`). `pnpm dlx czg` gives a guided prompt. Scopes
include career, player, catalog, season, transfer, finance, db, ui, routes,
config, deps, tooling, tests, scripts, ci, and docs.

## Review cycle

When working through Claude Code, uncommitted changes are run through
`/review-cycle:review`, which fans out reviewers, applies fixes, and marks a
sentinel; a commit-gate hook then allows the commit once the reviewed state
matches the working tree. This is a Claude Code workflow, not a git hook — it is
not enforced by the repo itself.

## Dependency updates

Renovate (`.github/renovate.json`) opens grouped `chore(deps)` PRs: the React,
TanStack, Tailwind, and oxlint families are grouped; the data and UI core
(`drizzle-orm`, `pg`, `react-aria-components`) are not auto-merged. Renovate's
mise manager keeps the `mise.toml` pins current.
