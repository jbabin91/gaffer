# Decision 0003: Intent UI on React Aria + Tailwind v4

Date: 2026-06-13
Status: Accepted

## Context

We need accessible, composable UI primitives (modals, selects, tables, number
fields) without adopting a heavy component framework, and we want to own the
component code rather than depend on an external design system's standards.

## Decision

Use Intent UI components (built on React Aria Components) styled with Tailwind
v4. The components are vendored under `src/components/ui` and treated as our own
code — linted and formatted like the rest of the project.

## Alternatives considered

- shadcn/ui (Radix) — also good; React Aria's accessibility model fit our needs
- A full component library (MUI, Mantine) — heavier and harder to restyle
- Hand-rolled components — re-implements accessibility React Aria already solves

## Consequences

- Positive: Accessible primitives, full styling control, no runtime design-system dependency.
- Negative: We own the vendored components, including their bugs; bare `react-aria-components` imports are restricted in favor of `#/components/ui/*`.
- Follow-ups: Runtime styling uses `tailwind-variants` + `tailwind-merge`; see `docs/development/styling.md`.
