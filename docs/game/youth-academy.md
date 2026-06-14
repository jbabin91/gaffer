# Youth academy

How youth academy scouting and potential reveal work in FC 26 career mode.

These are working notes on game mechanics, not EA data. Verify against the live
game; EA changes this between updates.

## Scout reports show ranges, not exact values

A youth scout report gives a player's **current overall** and **potential** as
ranges (e.g. current `57–75`, potential `84–94`), not a single number. The figure
that matters for screening is the **minimum** of each range — the bottom number.

FC 26 no longer surfaces the old "has potential to be special" status text, so the
report alone won't tell you a prospect's true ceiling.

## Screening a prospect

Two checks against the scout report, both required:

1. **Minimum potential floor** — the minimum potential rating must be **≥ 75**.
   Below that, skip the player.
2. **Margin** — the gap between the two minimums:

   ```text
   margin = (minimum potential rating) − (minimum current overall rating)
   ```

   The required margin grows with youth because lower current overalls need a
   bigger gap to reach the same ceiling.

### Margin thresholds by age

| Age | Minimum margin |
| --- | -------------- |
| 14  | +34            |
| 15  | +29            |
| 16  | +26            |
| 17  | +24            |

A prospect clearing both the floor and the age margin reliably lands at **90+**
true potential (observed `91–97` and `92–98`, up to `93–99` at the high end).

The margin is a **floor, not an exact predictor** — two prospects with the same
margin can end up at slightly different potentials, so treat it as "clears the
bar," not a precise forecast.

## Revealing true potential

The scout report hides the exact potential. To read it, exploit the transfer hub
and a reload:

1. **Save** the game (a normal save reloads faster than a checkpoint).
2. **Promote** the youth player to the first team, then **release** him — he drops
   into the free agents.
3. **Search him in the transfer hub** — his true potential is now shown.
4. **Quit without saving** and **reload** the save — he respawns in the youth
   squad with his potential now known.

Players under 16 can only be promoted once they turn 16, so screen them on the
margin, let them develop in the academy, and reveal when eligible.

## Age eligibility

- Youth players can only be promoted to the first team at **16 or older**.
- 13-year-olds still exist in FC 26 but are rare enough to ignore in practice.

## Source

The age/margin chart and the save-promote-reload reveal method come from this
community guide: <https://www.youtube.com/watch?v=xaeMKE45zO4>
