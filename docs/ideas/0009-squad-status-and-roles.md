# Idea 0009: Squad status and role planning

Status: exploring
Date: 2026-06-13

## What

Richer per-player state than the `onSquad` boolean: a status (active, loaned-out,
loan candidate) plus the planning annotations seen in the squad tracker — action
(keep / develop / depth / sell / loan), phase, and an upgrade-timing note
("UP 65w"). Extends roster actions (`0002`) and contract/form fields (`0004`).

## Why

The squad sheet carried a plan per player (who to keep, develop, sell, and when
to upgrade), not just current state.

## Open questions

- A status enum, or a separate loan record (a loan has a club and dates)?
- Are action/phase free-text or a fixed vocabulary?
