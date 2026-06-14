# Decision 0011: License (MIT) and project name (Gaffer)

Date: 2026-06-13
Status: Proposed

> Applies when the project becomes a public oakoss repo as part of `0009`.

## Context

Going open-source and self-hostable means choosing a license and a name that is
discoverable but does not imply endorsement by EA.

## Decision

- **License: MIT** — maximize adoption of a self-hostable tool.
- **Name: Gaffer** (British slang for the manager) under the oakoss umbrella:
  `oakoss/gaffer`, npm scope `@oakoss/gaffer`. Rename from `fc-2026`.
- **EA's trademarks stay out of the name.** "EA Sports FC 26" appears only in the
  tagline, GitHub topics (`fc26`, `eafc`, `career-mode`), and the non-affiliation
  disclaimer — consistent with `0007` and `docs/development/data-compliance.md`.

## Alternatives considered

- AGPL — network-copyleft, common for self-hosted apps; rejected in favor of MIT
  for adoption.
- Name `Wonderkid` — player-development themed; `Gaffer` better fits a manager
  career app.
- Putting "FC 26" in the name — trademark/endorsement risk for a public repo.

## Consequences

- Positive: permissive license, a manager-themed name, trademark-safe.
- Negative: "gaffer" overlaps on search with GafferHQ (a VFX tool) and gaffer
  tape; low impact, since discovery is via the FC topics + tagline and the oakoss
  namespace disambiguates.
- Follow-ups: the bare `gaffer` npm name is taken by a dead package — publish
  scoped (`@oakoss/gaffer`) if ever needed. Optional domain (`getgaffer.*`).
