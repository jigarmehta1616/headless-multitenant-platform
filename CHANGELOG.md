# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-phase1] - 2026-10-17

### Added
- Monorepo initialized with pnpm workspaces and Turborepo.
- `apps/medusa` configured with Medusa v2, PostgreSQL 16, Redis 7 (event-bus, workflow-engine, cache, locking).
- Render blueprint (`render.yaml`) defining server, worker (`MEDUSA_WORKER_MODE=worker`), database, and redis.
- Idempotent seed script (`apps/medusa/src/scripts/seed.ts`) with multi-region (NA, EU, UK), multi-currency (USD, EUR, GBP), and multi-channel catalogs.
- Multi-tenant sales channel isolation integration test suite (`apps/medusa/tests/channel-isolation.test.ts`).
- Outbound webhook workflow (`src/workflows/outbound-webhook.ts`) with HMAC-SHA256 signature, 5-minute replay window, and retry backoff.
- PostgreSQL webhook delivery log module (`src/modules/webhook-log`) with manual replay endpoint.
- Local mock webhook receiver script (`scripts/mock-webhook-receiver.mjs`).
- `packages/theme` with Zod schema, token generator, and JSON Schema publisher.
- `packages/commerce` (Protected Zone) with typed Medusa JS SDK wrapper and runtime Zod validation.
- `packages/ui` with accessible typed components (Button, Input, Badge, Card, Container, Skeleton).
- Brand management CLI (`scripts/brand-cli.mjs`) for scaffolding and validating brands.
- CI quality gate workflow (`.github/workflows/ci.yml`) and protected zones guard (`scripts/ci-guard-protected-zones.mjs`).
- Complete system documentation per Master Instructions (Sections 1-38).
