# Milestone 0 review

## Included

- pnpm/Turborepo workspace and strict TypeScript configuration
- Expo mobile, NestJS API, and Next.js Admin/Studio shells
- semantic UI tokens and six initial components
- mobile component gallery and deterministic Profile review route
- deterministic core-screen review route for Splash, Onboarding, Sign Up, Home, Chats, Conversation, Discover, and Store
- static SOS review covering Safety Centre, trusted contacts, deliberate confirmation, active status, recipient view, and authenticated safe confirmation
- creator, gift transaction, and withdrawal contracts
- creator-only policy with unit tests
- permission-aware Profile view-model with ordinary, approved, and suspended tests
- local PostgreSQL, Redis, and S3-compatible MinIO
- CI and architecture records

## Deliberately excluded

Production backend domains, payment collection, cash withdrawal processing, live streaming, and regulated wallet behavior.

## Product-owner review path

1. Run `pnpm install` and `pnpm --filter @tavira/mobile dev`.
2. Open the Expo web target to review the component gallery.
3. Open `/core-review` and inspect each screen tab, including separate Call/SOS controls, conversation tools, and Store categories.
4. Open `/profile-review` and compare ordinary, approved-creator, and suspended-creator states. Review the static Verification and Ads Manager panels below the menu.
5. Open `/sos-review` and review every prototype state. These screens do not dispatch alerts or access location.
6. Confirm the approved transparent logo presentation in Splash and Onboarding.
7. Review contracts and authorization test cases before approving further backend domain work.

## Assumptions and risks

- The approved logo is stored unchanged at `packages/ui/assets/tavira-logo.png`; its source and repository SHA-256 hashes were verified as identical.
- Screenshot capture remains pending until the Expo dependency installation completes successfully.
- MinIO credentials are local-only examples and must never be used outside local development.
- All production-impacting feature flags remain disabled until their required approvals exist.
