# Positions and roles

## Position codes

Players have a primary position and optional secondary positions, using standard
codes:

- Goalkeeper: `GK`
- Defenders: `RB`, `RWB`, `CB`, `LB`, `LWB`
- Midfielders: `CDM`, `CM`, `CAM`, `RM`, `LM`
- Forwards: `RW`, `LW`, `CF`, `ST`

## In the app

- `players.primary_position` holds the main code; `secondary_positions` holds
  additional codes the player can cover.
- The add-player form offers the codes above; the catalog supplies a primary
  position when prefilling.

Position affects where a player fits in the squad and how their overall
translates to a given role.
