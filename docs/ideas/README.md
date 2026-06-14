# Ideas

Rough concepts and explorations before committing to scope.

Ideas are cheap — write one whenever a thought surfaces during implementation,
review, or play-testing. Most will be discarded or merged into an existing
feature.

## Conventions

- File naming: `NNNN-short-title.md`
- Status: `exploring` | `validated` | `parked` | `rejected`
- Keep it short: one or two paragraphs. If it needs more detail, it's a spec.

## Lifecycle

1. Write the idea.
2. Stress-test it.
3. If validated, promote to a spec (`docs/specs/`), or write a decision record
   if it settles a choice.
4. If parked, leave it — it may become relevant later.
5. If rejected, mark the status and add a one-line reason.

## Template

Use `docs/ideas/0000-template.md`.

## Index

- `0001-season-management.md` — create, list, and switch seasons; tag snapshots
- `0002-roster-actions.md` — edit, bench, and remove players from the squad
- `0003-data-portability.md` — export/import a career as JSON; in-app catalog import
- `0004-contract-and-form-entry.md` — capture contract, wage, and form data
- `0005-scouting-shortlist.md` — transfer targets (tier, gap, sign-status)
- `0006-catalog-import.md` — CSV/JSON importer + identity baseline + provenance
- `0007-finances-and-budgets.md` — transfer + wage budgets, spent/remaining
- `0008-transfer-plans.md` — sequenced offload → sign window plans
- `0009-squad-status-and-roles.md` — player status + per-player planning fields

Further candidates from the career spreadsheets (not yet written up): a
formation / depth-chart view, youth-scouting assignments, and an aging /
sell-at-peak review.
