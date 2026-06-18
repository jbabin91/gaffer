# Styling

Intent UI components on React Aria, styled with Tailwind v4 (see
`docs/decisions/0003`).

## Components

- Reusable primitives live in `src/components/ui` and are imported via
  `#/components/ui/*`. Bare `react-aria-components` imports are restricted by
  lint — go through our wrappers so styling and behavior stay consistent.
- We own these components: they are linted and formatted like the rest of the
  codebase.

## Tailwind

- Tailwind v4 is configured through `@tailwindcss/vite`; the entry stylesheet is
  `src/styles/globals.css`.
- Runtime class composition uses `tailwind-variants` (`tv`) for component
  variants and `tailwind-merge` for conflict resolution. `cx` lives in
  `src/lib/utils/primitive.ts`.
- `tw-animate-css` and `tailwindcss-react-aria-components` provide animation and
  React-Aria state variants.

## Icons

Icons come from `@heroicons/react`, exposed through an `Icons` registry in
`#/components/icons`. Use `Icons.<name>` (e.g. `Icons.sun`) rather than importing
heroicons directly, so the icon set — or the underlying library — can be swapped
in one place. Direct `@heroicons/react` imports are restricted by lint outside
the registry and `src/components/ui/`.
