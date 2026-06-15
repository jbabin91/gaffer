# Decision 0010: Docker as the canonical deployment

Date: 2026-06-13
Status: Proposed

> Part of the self-hosted pivot (`0009`); specified in `specs/0001`.

## Context

Self-hostable software needs one portable deployment artifact that works across
hosts (plain Docker, Portainer, k8s, Fly, a self-hosting PaaS) without tying
anyone to a specific platform.

## Decision

Ship a **Docker image + `docker-compose.yml`** as the canonical deployment:

- Multi-stage `Dockerfile` building the TanStack Start (nitro) Node server; run
  `node .output/server/index.mjs` as non-root, bound to `0.0.0.0:$PORT`, with a
  healthcheck. Pin pnpm to match `mise.toml`.
- `docker-compose.yml` with `app` + `postgres` services and a named volume.
- **Migrations run on boot** (entrypoint runs `drizzle-kit migrate`) so
  self-hosters never run a manual step.
- Publish versioned images to **GHCR** (`ghcr.io/oakoss/gaffer:<version>`) via
  CI. Never ship a default `BETTER_AUTH_SECRET` — require it, or generate per
  instance.
- A self-hosting PaaS + Cloudflare Tunnel is the author's chosen host: one
  consumer of the Docker artifact, not a requirement.

## Alternatives considered

- A PaaS-specific deployment — ties self-hosters to one platform.
- Build-pack / Nixpacks only — less portable than a published image + compose.

## Consequences

- Positive: one artifact runs everywhere; the host just consumes it; upgrades are
  an image pull.
- Negative: a new `.env.example` (the browser-only app had none); CI must build
  and publish the image; migrations must be forward-only and upgrade-safe, since
  you cannot fix a self-hoster's database.
- Follow-ups: backup/restore (`pg_dump`) and HTTPS guidance belong in the
  self-host docs.
