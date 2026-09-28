# TAVIRA

Nigeria-first social communication, creator, community, and commerce platform. **Chat. Discover. Shop.**

This repository contains the Milestone 0 foundation and selected Milestone 1 UI foundations. Production payments, withdrawals, live streaming, and regulated wallet functionality are intentionally absent and feature-disabled.

## Prerequisites

- Node.js 20+
- pnpm 10+
- Docker with Compose (for local services)

## Start

```sh
pnpm install
docker compose -f infra/docker/compose.yml up -d
pnpm db:migrate
pnpm dev
```

Run one app with `pnpm --filter @tavira/mobile dev`, `@tavira/api`, `@tavira/admin`, or `@tavira/studio`.

Mobile visual-review routes:

- `/` — component gallery
- `/core-review` — initial core-screen set
- `/profile-review` — permission-aware Profile, Verification, and Ads states
- `/sos-review` — static SOS safety flow; no alerts or location access

## Quality checks

```sh
pnpm format:check
pnpm lint
pnpm db:validate
pnpm typecheck
pnpm test
pnpm build
```

See [docs/product/milestone-0.md](docs/product/milestone-0.md) for scope and review steps.
