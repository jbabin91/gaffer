# Idea 0002: Roster actions (edit, bench, remove)

Status: exploring
Date: 2026-06-13

## What

Row-level squad actions: edit a player, toggle their on-squad/bench status, and
remove them, surfaced from the squad table.

## Why

The squad is create-only today. `removePlayer` and `useRemovePlayer` exist but
have no caller, the `on_squad` flag has no UI toggle, and there is no
`updatePlayer`. Real management means rotating and editing the squad.

## Open questions

- Edit in a modal that reuses the add-player form, or inline?
- Soft-remove (keep history) versus hard-delete (cascade snapshots)?
- Does "bench" just mean `on_squad = false`, shown in a reserves section?
