# ADR 0004: Authentication and session boundary

- Status: Proposed
- Date: 2026-09-20

## Context

TAVIRA requires email or phone verification, secure device sessions, logout-all-devices, and server-side authorization. Implementation belongs to Milestone 2 and must not be improvised during repository setup.

## Decision

Use short-lived access tokens and rotating opaque refresh tokens. Store only a one-way digest of each refresh token with its session and device metadata. Rotation invalidates the previous token atomically; reuse revokes the affected token family and creates a security event. Passwords use Argon2id with reviewed parameters. Mobile credentials use platform secure storage.

Authentication proves the principal; domain authorization remains in server-side policies. Creator approval, paid verification, seller approval, advertiser eligibility, and payout eligibility are independent capabilities.

## Consequences

- Session mutations require transactions and audit events.
- Tokens, passwords, verification codes, and sensitive documents must never enter logs.
- Exact token lifetime, Argon2id parameters, and verification provider remain Milestone 2 review decisions.
