# Decision 0007: The player catalog stores text and numbers only

Date: 2026-06-13
Status: Accepted

## Context

A searchable player catalog speeds up adding players, but it must not reproduce
EA Sports' branding or player likenesses. This app is not affiliated with or
endorsed by EA.

## Decision

The `player_catalog` table stores text and numeric attributes only (names,
nationality, positions, numeric ratings) — never crests, photos, kits, or other
EA branding. Catalog data is seeded from a public-domain (CC0) dataset and used
purely as text/number reference for prefilling the add-player form.

## Alternatives considered

- Embedding crests/photos — legal and licensing risk; not worth it
- No catalog — slower manual entry, but acceptable; the catalog is optional

## Consequences

- Positive: Clear legal posture; the catalog is just data and is optional.
- Negative: The catalog is empty until a dataset is imported; no in-app importer yet.
- Follow-ups: Surface the non-affiliation framing in the UI; see `docs/development/data-compliance.md` and `docs/ideas/0003-data-portability.md`.
