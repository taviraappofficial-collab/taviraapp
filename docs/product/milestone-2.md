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

Authenticated profile and safety controls provide editable public fields, private/discoverability settings, bidirectional block enforcement, safety-report intake, and append-only audit events written in the same database transaction as each mutation.

Profile and safety endpoints:

- `PATCH /v1/identity/profile`
- `PUT /v1/identity/privacy`
- `POST /v1/identity/blocks/:accountId`
- `DELETE /v1/identity/blocks/:accountId`
- `POST /v1/identity/reports`

## Mobile identity journey

Expo Router screens now cover registration, contact verification, login, privacy preferences, and account/device management:

- `/identity/register`
- `/identity/verify`
- `/identity/login`
- `/identity/privacy`
- `/identity/account`

The screens use shared TAVIRA tokens, accessible controls, mobile-safe validation models, and responsive web layouts. They connect through the versioned identity API, persist session tokens with Expo SecureStore on native devices, keep web-review sessions in memory only, and expose `EXPO_PUBLIC_API_URL` for environment-specific API routing. The API allows only configured `CORS_ORIGINS` for browser clients.

Verification delivery now sits behind a typed provider boundary carrying the channel, purpose, expiry, and one-time code. The local adapter logs only masked routing metadata and never exposes codes in logs or responses. Durable challenge records enforce no more than three deliveries per purpose per hour and ten total deliveries per account per day, including across API restarts.

Lifecycle coverage now exercises the identity API through an ephemeral HTTP server from registration and contact verification through multi-device login, refresh rotation, privacy updates, session revocation, and logout-all. Mobile lifecycle coverage verifies that login tokens are persisted, rotated tokens replace prior credentials, and logout clears the device vault.

## Local database review

1. Copy `.env.example` to `.env` without committing it.
2. Run `docker compose -f infra/docker/compose.yml up -d postgres`.
3. Run `pnpm db:validate` and `pnpm db:generate`.
4. Run `pnpm db:migrate` to apply `infra/migrations/0001_identity_foundation/migration.sql`.

## Moderation and audit operations

The internal admin console presents the safety-report queue and supports transitions to reviewing, resolved, or dismissed. Microsoft Entra ID protects the API with single-tenant, audience-bound access tokens. The API validates RS256 signatures from the tenant-specific JWKS endpoint, exact issuer, audience, expiry, tenant, immutable object identity, authorized admin client (`azp`), and app roles. It fails closed unless the Entra tenant, API application, and admin client IDs are configured.

`Tavira.Moderator` grants report listing and status transitions. `Tavira.AuditExporter` separately grants audit export, applying least privilege. Audit records use the immutable tenant and object IDs as the moderator identity rather than mutable email addresses. The admin console uses the authorization-code flow with PKCE and state validation, exchanges codes only on the server, and stores the short-lived API access token in a secure HTTP-only SameSite cookie.

- `GET /v1/admin/moderation/reports`
- `PATCH /v1/admin/moderation/reports/:reportId`
- `GET /v1/admin/audit-events/export?from=<date>&to=<date>`

Audit events are append-only and retained for seven years (2,555 days). Export is JSON, date-bounded, limited to 1,000 records per request, and protected by the internal admin boundary. Automated archival and legal-hold workflows remain infrastructure work before production launch.

## Required follow-up before Milestone 2 exit

- Select approved email/SMS verification providers and implement production adapters without exposing verification codes in logs or responses.
- Add provider-level abuse monitoring, delivery-status handling, and webhook verification.
- Configure the Entra tenant, API scope, app roles, admin redirect URI, and production secret rotation policy before deployment.
- Add automated audit archival, legal-hold enforcement, and cursor-based bulk export before production launch.
