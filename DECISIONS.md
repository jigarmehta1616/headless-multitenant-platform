# Architectural Decision Records (ADR) & Customization Log

This log records all structural decisions and customizations to ensure platform longevity and seamless Medusa v2 minor upgrades.

---

## ADR-001: Native Sales Channels for Multi-Tenancy
- **Status**: Accepted
- **Context**: The business requires multiple distinct B2C and B2B brands running off a shared backend without data leakage or prohibitive infrastructure cost.
- **Decision**: Use Medusa v2 native `SalesChannel` entities linked to `PublishableApiKey` tokens. Storefronts ship exclusively their assigned publishable key.
- **Consequences**: Zero database forks; native compatibility with Medusa core updates; strictly isolated product listings and inventory per tenant.

---

## ADR-002: Zero Custom Commerce Plumbing
- **Status**: Accepted
- **Context**: Legacy setups suffer from breakages during upgrades due to custom cart, checkout, or discount overrides.
- **Decision**: All commerce logic (cart, checkout, promotions, pricing, taxes, inventory, orders, sessions) uses native Medusa v2 modules and workflows. Custom backend code is strictly limited to:
  1. Subscribers for webhook dispatching
  2. Scheduled jobs and seed scripts
  3. Thin non-commerce routes (`/health`, `/admin/webhooks`)
- **Upgradability Guarantee**: Because no core commerce modules are overridden, the backend can upgrade minor versions (`2.x` to `2.y`) cleanly without code regression.

---

## ADR-003: Protected Zones vs. Safe Zones for AI-Assisted Editing
- **Status**: Accepted
- **Context**: Autonomous AI agents (Cursor, v0) risk modifying critical checkout or security logic during marketing or layout edits.
- **Decision**: Enforce rigid file boundaries:
  - **Safe Zones**: `brands/**`, `src/sections/**`, `src/content/**`, `packages/ui/**`.
  - **Protected Zones**: `packages/commerce/**`, `src/workflows/**`, `src/middleware.ts`, `src/app/checkout/**`.
- **Enforcement**: Mandatory review headers and automated CI check (`pnpm ci:guard`).

---

## ADR-004: Render Deployment with Decoupled Server and Worker Instances
- **Status**: Accepted
- **Context**: Long-running outbound webhook retries and inventory sync must not degrade HTTP response latency.
- **Decision**: Split backend into two services using `MEDUSA_WORKER_MODE`:
  - `medusa-server` (`server` mode): Serves HTTP API and Admin dashboard.
  - `medusa-worker` (`worker` mode): Executes background workflows and subscribers.
  - Coordinated via managed PostgreSQL 16 and Redis 7 (event-bus, workflow-engine, cache, locking).

---

## ADR-005: Outbound Webhook Delivery via HMAC-SHA256 and PostgreSQL Delivery Log
- **Status**: Accepted
- **Context**: Downstream automation tools (n8n, ERP, CRM) require guaranteed at-least-once event delivery with replay protection.
- **Decision**: Implement a Medusa DML module `webhook-log` and a workflow `dispatchOutboundWebhookWorkflow`:
  - HMAC-SHA256 signatures with timestamp (`t=...,v1=...`)
  - 5-minute replay tolerance
  - Exponential backoff with jitter and dead-letter state
  - Admin inspection and manual replay endpoints.

---

## ADR-006: Zod Runtime Validation Across All Commerce Interfaces
- **Status**: Accepted
- **Context**: Compile-time TypeScript types alone cannot prevent runtime errors when external payloads deviate.
- **Decision**: All responses from the Medusa JS SDK in `packages/commerce` are parsed through Zod schemas before returning to UI components.
