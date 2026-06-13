# Career mode

Manager career mode: you run a club across repeating seasons, balancing results,
squad building, and finances against board expectations.

## Seasons

- A career is a sequence of seasons, one of which is "current" at a time.
- Each season has a club, a league, and a final league position once it ends.
- Progress runs across in-game weeks of fixtures within the season.

The app models this as `careers` → `seasons` (one current per career) and tracks
player development by in-game week.

## Board objectives

- The board sets season objectives (league finish, cup runs, youth development,
  financial targets); meeting or missing them affects job security.
- Objectives reset each season.

## Squad building

- Squads are shaped through transfer windows, loans, youth promotion, and
  scouting.
- Players have squad roles and shirt numbers.

## What the app tracks today

Careers, seasons, the squad, and per-week development snapshots. Transfers,
finances, and board objectives are domain concepts the schema anticipates but
the UI does not yet cover.
