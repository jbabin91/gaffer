# Player development

## Ratings

- **Overall (OVR)** — a player's current ability, roughly 1–99.
- **Potential (POT)** — the ceiling the player can grow toward, roughly 1–99.

A young player with high potential and low current overall is the classic
"wonderkid" growth target.

## Growth

- Players develop across a season based on playing time, performances, training,
  and age. Overall trends toward potential and can plateau or decline with age.
- We capture this as weekly snapshots so the trend is visible over time, not just
  the latest number.

## Form and condition

- **Form / sharpness** — short-term performance level, separate from overall.
- **Morale** — affected by results, playing time, and squad role.

The snapshot model has a `form` field for a short-term rating alongside overall
and potential.

## Age and contracts

- Age drives the growth curve and resale value.
- Contracts have an expiry and a wage; expiring contracts are a planning concern.

The player record carries age, contract expiry, and wage fields for this.
