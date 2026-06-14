# Specs

Scoped feature designs that implementation works against.

A spec captures the _what_ and _how_ of a feature before code is written.

## Conventions

- File naming: `NNNN-short-title.md`
- Status: `draft` | `approved` | `implementing` | `done`
- One spec per feature.
- Specs reference decisions for choices and research/game docs for context.
- Update the spec as implementation reveals new information.

## What belongs in a spec

- Scope: what's in, what's out
- User flows: step-by-step from the user's perspective
- Data model: tables, fields, relations (if new or changed)
- UI sections: layout, components, states (loading, empty, error)
- Edge cases and open questions

## What does NOT belong

- Implementation details that only matter to a single file
- Decisions (those belong in `docs/decisions/`)
- Game mechanics reference (that belongs in `docs/game/`)

## Template

Use `docs/specs/0000-template.md`.

## Index

- `0001-self-host-migration.md` — local-first → hosted multi-user (draft)
