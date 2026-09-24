# ADR 0005: Realtime transport

- Status: Proposed
- Date: 2026-09-20

## Context

Messaging, presence, calls, live experiences, notifications, and emergency-session updates need realtime delivery with different durability requirements.

## Decision

Use versioned REST endpoints for ordinary resources and authenticated NestJS WebSocket gateways for transient realtime events. PostgreSQL remains authoritative for durable state. Redis may coordinate presence, connection routing, rate limits, and fan-out; BullMQ handles retryable background work.

Clients reconnect with bounded exponential backoff and resume durable state through cursor-based REST queries. Client-generated idempotency identifiers protect message and mutation retries. WebSocket delivery does not itself prove durable acceptance.

Calling uses this transport only for authorized signalling; media-provider, STUN/TURN, abuse, and privacy decisions require a later calling architecture review. SOS alert delivery must not depend on a single open socket and requires independently tracked push/SMS/provider states.

## Consequences

- Every gateway event requires authentication, authorization, validation, rate limiting, and correlation identifiers.
- Presence and typing may be lossy; messages, reports, financial events, and SOS state are durable.
- Horizontal fan-out can be introduced without splitting the modular monolith.
