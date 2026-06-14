# Research: FC player-data sourcing

Date: 2026-06-13
Related: decisions/0012-data-acquisition

## Summary

All EA Sports FC player data traces to EA's proprietary ratings. Third-party
sites mirror or scrape it; there is no official ratings API and no genuinely
free dataset to redistribute.

## Findings

- **EA owns the ratings.** ~30 EA producers + ~400 external reviewers set every
  OVR/POT/attribute/value/wage across 30 leagues and 700+ clubs.
- **SoFIFA mirrors EA** and captures each EA squad update as a dated snapshot
  (its "stays current" property). It owns its compilation/UI, not the numbers.
- **Kaggle "FC" datasets are scraped from SoFIFA** and labeled CC0 by uploaders
  who can't relicense EA's data, so the CC0 tag is meaningless. EAFC26-DataHub
  was a stale launch-day scrape, which is why its numbers were off.
- **The ecosystem scrapes.** FUTBIN/FUTWIZ/FutHead extract EA ratings and scrape
  the live transfer market for prices; community scrapers layer on top.
- **One clean operator: FUT.GG** — "created under license from Electronic Arts."
  The clean path is a paid EA license, unavailable to a free OSS tool.
- **Official channels:** EA's public APIs cover Pro Clubs / Clubs match data
  only, not ratings. EA's ratings website lists 17k+ players but is launch-data
  (no live updates) and browse-only under EA's terms.
- **FutDB** offers a free JSON API (EA-derived, FUT-focused) — a cleaner pull
  target than scraping SoFIFA for a user-run adapter.

## Implications

- No source is both clean and live → external data is only prefill; a save's
  truth is the user's own snapshots (`decisions/0006`).
- Identity/bio (names/clubs/nationalities) are public facts (CC0 available);
  ratings are EA's IP. Bundle the former, never the latter.

## Sources

- [SoFIFA](https://sofifa.com/)
- [EA FC Ratings](https://www.ea.com/en/games/ea-sports-fc/ratings)
- [FUT.GG](https://www.fut.gg/)
- [FutDB](https://futdb.app/)
- [EAFC26-DataHub](https://github.com/ismailoksuz/EAFC26-DataHub)
