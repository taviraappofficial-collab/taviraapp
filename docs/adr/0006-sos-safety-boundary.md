# ADR 0006: SOS safety and privacy boundary

- Status: Proposed
- Date: 2026-09-21

## Context

TAVIRA SOS may process emergency contact details, precise or approximate location, alert-delivery evidence, acknowledgements, and background updates. Incorrect delivery claims or stale-location presentation could create serious harm.

## Decision

Keep SOS disabled by default. The Milestone 1 implementation is a static visual prototype only: it does not request location, import contacts, create sessions, send push/SMS messages, or generate tracking links.

Future implementation must treat recipients independently and record queued, provider-accepted, delivered, opened, acknowledged, and failed states without inference. Location always includes freshness and accuracy metadata. Ending an active session requires reauthentication and stops tracking immediately. Secure links use high-entropy, expiring tokens and must never expose internal identifiers.

## Activation gates

- Nigerian data-protection and retention review
- Android and iOS background-location and notification-policy review
- approved SMS/push provider and fallback behavior
- threat model, role-restricted administrative access, and access audit logs
- abuse review, false-alert handling, operational monitoring, and incident response
- tested permission-denied, offline, stale-location, delivery-failure, expiry, and unauthorized-access behavior

## Consequences

Product copy must state that TAVIRA is not an emergency service. Advertising, recommendations, creator tools, and ordinary staff access must never consume SOS or emergency-location data.
