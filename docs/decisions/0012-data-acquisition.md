# Decision 0012: Catalog data acquisition — ship the tool, not the data

Date: 2026-06-13
Status: Proposed

> Part of the self-hosted pivot (`0009`); refines `0007`. Background in
> `research/0001-fc-data-sourcing.md`.

## Context

The catalog needs player data, but all FC player data traces back to EA's
proprietary ratings. SoFIFA mirrors EA and tracks squad updates; Kaggle datasets
are scraped from SoFIFA and mislabeled CC0; the wider ecosystem scrapes EA, and
the one clean operator (FUT.GG) holds a paid EA license. There is no official
ratings API and no genuinely free dataset to bundle. As distributable software
we have more exposure than a single takedownable site, so we cannot ship or
fetch EA-derived data.

## Decision

The published product ships the **tool, not the data**:

- **Split the data.** Player **identity/bio** (name, club, nationality,
  position, age) is public fact and may be seeded from a verified clean source
  (CC0 open-football / Wikidata). EA's **ratings** (OVR, POT, attributes, value,
  wage) are EA's IP and are never bundled or fetched by the app.
- **Importer-first.** Ship a documented CSV/JSON importer; bundle no ratings.
  Manual entry always works. Each self-hoster imports whatever data they choose
  into their own private instance, at their own discretion.
- **Provenance-aware, source-neutral.** Record each import's source label and
  snapshot date (formalizing the manual `Src` column), but never fetch the data.
- **Optional out-of-core adapters.** Scripts that turn a source into the import
  CSV live in a separate repo, run by the user — not in the shipped product.
  Prefer FutDB's free API over scraping SoFIFA.

## Alternatives considered

- Bundle a "CC0" Kaggle dataset — it's EA data with a false license; redistributing it is the risk we avoid.
- Build SoFIFA/EA scraping into the app — third-party ToS plus EA IP; fragile and exposed.
- Obtain an EA data license — unrealistic for a free OSS tool (FUT.GG is commercial).

## Consequences

- Positive: clean to publish; no third-party data redistributed; users still get accurate data privately.
- Negative: more DIY than a bundled ratings DB; new instances start with ratings empty (identity baseline + import fill them).
- Follow-ups: external data is only prefill — no source is both clean and live, so a save's truth is the user's own snapshots (`0006`). See `ideas/0006-catalog-import.md`.
