# Medusa Backend AI Guide (`apps/medusa/AGENTS.md`)

## Core Backend Directives
1. **Zero Custom Commerce Plumbing**: Never create custom controllers, repositories, or services for core commerce operations (cart, checkout, pricing, taxes, inventory, auth, sessions). Use native Medusa v2 modules, workflows, and Store/Admin APIs.
2. **Allowed Custom Code**:
   - Outbound webhook subscribers (`src/subscribers/`)
   - Medusa workflows for webhooks and scheduled jobs (`src/workflows/`)
   - Webhook delivery log module (`src/modules/webhook-log/`)
   - Thin non-commerce API routes: `/health`, `/admin/webhooks`, `/admin/webhooks/replay`
   - Seed and catalog migration scripts (`src/scripts/seed.ts`)
3. **Clustering & Worker Mode**:
   - `MEDUSA_WORKER_MODE=server`: Runs HTTP API and Admin dashboard.
   - `MEDUSA_WORKER_MODE=worker`: Runs workflows, scheduled jobs, and subscribers without serving HTTP traffic.
   - Redis modules are mandatory in production for event-bus, caching, workflow engine, and distributed locking.
4. **Multi-Tenancy Scoping**:
   - 1 Brand = 1 Sales Channel = 1 Publishable API Key.
   - Never query or link products without associating with the proper sales channel.
5. **Database Migrations**:
   - Render deployment auto-runs migrations in `preDeployCommand: pnpm --filter medusa medusa db:migrate`.
   - Never commit destructive migrations without expand-and-contract rollout plans.
