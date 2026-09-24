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

The current repository and verification-delivery adapters are intentionally in-memory/local. They establish domain behaviour for tests but are not production persistence or message delivery.

## Required follow-up before Milestone 2 exit

- Add Prisma/PostgreSQL models and migrations for accounts, credentials, profiles, challenges and sessions.
- Select approved email/SMS verification providers and add rate limiting without exposing verification codes in logs or responses.
- Add authenticated access-token validation, session/device listing, single-session logout and account recovery.
- Add profile editing, privacy controls, block/report flows and audit events.
- Add mobile registration, verification, login, privacy and account-management screens.
- Add end-to-end API and mobile lifecycle tests.
