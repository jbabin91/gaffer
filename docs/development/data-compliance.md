# Data compliance

This app is **not affiliated with or endorsed by EA Sports.** It is a self-hosted
companion for tracking your own EA Sports FC 26 career-mode saves.

## The catalog rule

The player catalog stores **text and numbers only** — names, nationality,
positions, and numeric attributes. It must never store or display:

- Club crests, league logos, or competition badges
- Player photos or likenesses
- Kits, or other EA branding or licensed artwork

See `docs/decisions/0007` and `0012`. The product ships an importer, not bundled
ratings; the catalog is optional — the app works fully with manually entered
players.

## In the UI

- Surface a "not affiliated with EA Sports" notice where the catalog or game
  data appears.
- Player and club names are user-entered or imported; the app does not fetch
  from EA's or third-party services.

## When adding data

Before introducing a new field or import source, confirm it is text/numeric and
free of licensed artwork or branding. If it isn't, it doesn't belong here.
