# Code standards

## Tooling

- `pnpm lint` runs oxlint, then eslint, then markdownlint. `pnpm format` runs
  oxfmt. Both must pass with zero warnings (`maxWarnings: 0`).
- Type-aware lint is on; the build must typecheck (`pnpm typecheck`).

## Imports

- Use the `#/*` alias for `src`, `#test/*` for the test harness, and `#e2e/*`
  for end-to-end helpers. No relative parent imports (`../../`).
- Imports are sorted by oxfmt; named imports and object keys are alphabetized by
  perfectionist.

## Types

- Prefer `type` over `interface`. Derive database types from the schema
  (`$inferSelect` / `$inferInsert`) rather than hand-writing them.
- Avoid `any`, un-narrowed `unknown`, `as` casts, and non-null `!`. Express
  invariants in the type where you can.

## Comments

Comments earn their place by explaining **why**, not what:

- Accurate (matches the code; remove if stale)
- Concise (one or two lines unless documenting a complex invariant)
- No restating the code, hedge words, `Note:`/`Important:` prefixes, or
  AI-flavored phrasings ("Here we…", "Let's…")

When in doubt, keep the comment but make it tighter.

## Naming

- Files are kebab-case (route param and layout files excepted).
- Tests that touch a database end in `*.integration.test.*` (see
  `docs/development/testing.md`).
