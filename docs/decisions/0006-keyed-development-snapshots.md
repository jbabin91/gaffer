# Decision 0006: Keyed development snapshots with denormalized current ratings

Date: 2026-06-13
Status: Accepted

## Context

Player development is tracked over in-game weeks to drive a trend chart, while
squad lists need a fast "current" rating without scanning history.

## Decision

`player_snapshots` is keyed unique on `(player_id, in_game_week)`. Recording a
week upserts that point (`onConflictDoUpdate`) rather than appending a duplicate,
so re-recording a week corrects it and keeps the trend line clean. The player
row carries denormalized `overall`/`potential`/`market_value_eur`, synced from
the snapshot with the highest in-game week. Ratings are owned by snapshots:
adding a player seeds a week-0 snapshot in the same transaction.

## Alternatives considered

- Pure append-only log — duplicates per week complicate the chart and the "current" lookup
- Ratings stored only on the player — loses history and the development trend

## Consequences

- Positive: Clean trend data, fast list rendering, and a single source of truth for "current".
- Negative: Two places hold ratings; an upsert must coalesce cleared optional fields to null so a re-record can clear them.
- Follow-ups: `season_id` exists on snapshots but is not yet set by the UI (see `docs/ideas/0001-season-management.md`).
