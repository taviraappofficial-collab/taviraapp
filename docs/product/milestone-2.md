# Milestone 2 — Identity and profiles

## Slice 1: identity lifecycle foundation

This slice adds versioned contracts and an API domain boundary for:

- registration by email or phone identifier;
- one-time contact verification with expiry and attempt limits;
- login only after contact verification;
- device-scoped sessions and rotating refresh tokens;
- logout-all session revocation;
- public profile creation and lookup;
- independent contact, creator, paid-badge and seller states.

PostgreSQL persistence is implemented with Prisma behind an `IdentityRepository` boundary. Registration and activation use database transactions; refresh rotation uses a conditional transactional revocation so a token cannot be reused concurrently. Unit tests use the in-memory adapter while the running NestJS API uses the Prisma adapter.

The verification-delivery adapter remains local-only and does not expose one-time codes in logs or responses.

## Local database review

1. Copy `.env.example` to `.env` without committing it.
2. Run `docker compose -f infra/docker/compose.yml up -d postgres`.
3. Run `pnpm db:validate` and `pnpm db:generate`.
4. Run `pnpm db:migrate` to apply `infra/migrations/0001_identity_foundation/migration.sql`.

## Required follow-up before Milestone 2 exit

- Select approved email/SMS verification providers and add rate limiting without exposing verification codes in logs or responses.
- Add authenticated access-token validation, session/device listing, single-session logout and account recovery.
- Add profile editing, privacy controls, block/report flows and audit events.
- Add mobile registration, verification, login, privacy and account-management screens.
- Add end-to-end API and mobile lifecycle tests.
