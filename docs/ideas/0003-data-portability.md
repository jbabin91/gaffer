# Idea 0003: Data portability

Status: exploring
Date: 2026-06-13

## What

Export a career (with its seasons, players, and snapshots) to JSON, import it
back, and provide an in-app importer for the player catalog dataset.

## Why

Local-first data lives only in this browser's IndexedDB — one wipe loses
everything, and there is no way to move a save between machines. The catalog is
also empty until a dataset is imported, with no UI to do so.

## Open questions

- JSON only, or CSV too? What is the import conflict strategy?
- Validate imported rows against the schema before upserting.
- Where does import/export live — a settings or data screen?
