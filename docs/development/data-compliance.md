# Data compliance

This app is **not affiliated with or endorsed by EA Sports.** It is a personal,
local-first companion for tracking your own career-mode saves.

## The catalog rule

The player catalog stores **text and numbers only** — names, nationality,
positions, and numeric attributes. It must never store or display:

- Club crests, league logos, or competition badges
- Player photos or likenesses
- Kits, or other EA branding or licensed artwork

See `docs/decisions/0007`. Catalog data is seeded from a public-domain (CC0)
dataset and is optional — the app works fully with manually entered players.

## In the UI

- Surface a clear "not affiliated with EA Sports" framing where the catalog or
  game data appears.
- Player and club names are user-entered or sourced from the CC0 dataset; we do
  not pull from EA's services.

## When adding data

Before introducing a new field or import source, confirm it is text/numeric and
free of licensed artwork or branding. If it isn't, it doesn't belong here.
