# Decision 0004: oxlint + oxfmt as the lint/format toolchain

Date: 2026-06-13
Status: Accepted

## Context

We want fast linting and formatting. oxlint covers most rules quickly but does
not yet implement everything we rely on, so a fallback linter is still needed.

## Decision

Use oxlint (with its JS-plugin compatibility for TanStack, perfectionist,
unicorn, jsx-a11y, import-x, vitest, and better-tailwindcss) plus oxfmt for
formatting. ESLint runs after oxlint to cover rules oxlint lacks, and
markdownlint covers Markdown. `pnpm lint` runs oxlint, then eslint, then
markdownlint.

## Alternatives considered

- Biome — capable, but we standardized on the oxc toolchain (oxlint/oxfmt)
- ESLint + Prettier only — slower; oxlint catches most issues far faster

## Consequences

- Positive: Fast feedback from oxlint/oxfmt; ESLint fills the gaps; one `pnpm lint`.
- Negative: Two linters to keep aligned until oxlint reaches parity.
- Follow-ups: Revisit dropping ESLint as oxlint's rule coverage grows.
