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

Access tokens are opaque random credentials stored only as SHA-256 hashes. Authenticated clients can list their active device sessions, revoke one owned session, or revoke all sessions. Account status, session revocation, and access-token expiry are checked for every authenticated operation.

Authenticated session endpoints:

- `GET /v1/identity/sessions`
- `DELETE /v1/identity/sessions/:sessionId`
- `POST /v1/identity/logout-all`

Each requires `Authorization: Bearer <access-token>`.

Password recovery is enumeration-safe: request responses are identical for known and unknown contacts. Reset challenges expire after 10 minutes, allow at most five code attempts, and are limited to three deliveries per account per hour. A successful reset atomically updates the password, consumes the challenge, and revokes all active sessions.

Recovery endpoints:

- `POST /v1/identity/password-reset/request`
- `POST /v1/identity/password-reset/confirm`

The verification-delivery adapter remains local-only and does not expose one-time codes in logs or responses.

## Local database review

1. Copy `.env.example` to `.env` without committing it.
2. Run `docker compose -f infra/docker/compose.yml up -d postgres`.
3. Run `pnpm db:validate` and `pnpm db:generate`.
4. Run `pnpm db:migrate` to apply `infra/migrations/0001_identity_foundation/migration.sql`.

## Required follow-up before Milestone 2 exit

- Select approved email/SMS verification providers and add rate limiting without exposing verification codes in logs or responses.
- Select production email/SMS delivery providers and add provider-level abuse monitoring.
- Add profile editing, privacy controls, block/report flows and audit events.
- Add mobile registration, verification, login, privacy and account-management screens.
- Add end-to-end API and mobile lifecycle tests.
