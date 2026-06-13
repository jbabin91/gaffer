# Idea 0001: Season management

Status: exploring
Date: 2026-06-13

## What

UI to create, list, view, and switch between seasons within a career, and to tag
development snapshots with the season they belong to.

## Why

The schema already supports multiple seasons per career (the `seasons` table, a
"one current per career" index, `getCurrentSeason`, and `season_id` on
snapshots), exercised by tests — but there is no UI, so the capability is
invisible. Tracking performance across seasons is a core career-mode workflow.

## Open questions

- Where does the season switcher live — alongside the career switcher?
- Does starting a new season carry the squad forward automatically?
- Should the development chart segment or label by season?
