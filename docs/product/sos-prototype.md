# TAVIRA SOS static prototype

## Purpose

The `/sos-review` route provides deterministic product-review states only. No alert is dispatched and no contact or location permission is requested.

## Review states

1. Safety Centre entry and production-disabled notice.
2. Explicitly selected trusted contacts, verification state, primary contact, and Silent SOS consent notice.
3. High-visibility confirmation with a represented three-second press-and-hold action and cancellation.
4. Active SOS with elapsed time, location freshness, network-independent recipient delivery states, contact call action, and safe action.
5. Recipient view with expiring-link language, acknowledgement, and call/message actions.
6. Safe confirmation requiring PIN/password/biometric reauthentication before ending tracking.

## Unresolved approval gates

- location retention period and deletion/aggregation rules
- supported Nigerian markets and age policy
- SMS/push provider selection, delivery evidence, and fallback rules
- administrator roles allowed to access emergency-location data
- law-enforcement and emergency-service response policy
- app-store background-location disclosures

Production engineering must not begin until these decisions are approved and recorded.
