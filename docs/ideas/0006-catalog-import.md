# Idea 0006: Catalog import

Status: exploring
Date: 2026-06-13

## What

The import tool for the shared catalog (decision `0012`): a documented CSV/JSON
importer, dated dataset metadata (source label + snapshot date), and an optional
identity baseline seed (CC0 names/clubs/nationalities, no ratings). Optional
out-of-core adapters (FutDB preferred) produce the CSV; the app only consumes it.
Importing a spreadsheet like the user's Excel doubles as their migration off it
(see `0003`).

## Why

No clean external dataset can be bundled (`research/0001`), so users bring data.
The importer plus provenance metadata is how the catalog gets populated and stays
honest about freshness.

## Open questions

- Is the identity baseline in scope for v1, or importer-only to start?
- Conflict strategy on re-import (upsert by catalog id)?
