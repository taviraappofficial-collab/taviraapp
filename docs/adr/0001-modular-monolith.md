# ADR 0001: TypeScript modular monolith

- Status: Accepted
- Date: 2026-09-14

## Decision

Use a pnpm/Turborepo TypeScript monorepo. The NestJS API is the initial modular monolith; domain boundaries live in modules and shared contracts. Next.js serves Admin and Studio. Expo serves mobile.

## Consequences

Types and tooling are shared without network boundaries. Domains can later be extracted only when scale, reliability, or ownership supplies evidence for doing so.
