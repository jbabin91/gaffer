# Definition of done

A change is done when the green gate passes and the work is reviewed.

## The gate

```bash
pnpm typecheck      # 0 errors
pnpm lint           # oxlint + eslint + markdownlint, 0 warnings
pnpm format:check   # oxfmt, no changes needed
pnpm test           # all tests pass
pnpm build          # builds
```

## Also

- New behavior has tests. Database-touching tests are named
  `*.integration.test.*` (see `docs/development/testing.md`).
- Comments follow the comment policy (`docs/development/code-standards.md`).
- New decisions are recorded in `docs/decisions/`; new game mechanics the work
  relies on are noted in `docs/game/`.
- Uncommitted changes pass the review cycle (`/review-cycle:review`) before
  commit.

## Not in scope for "done"

- Pushing or opening a PR — the author decides when to do that.
