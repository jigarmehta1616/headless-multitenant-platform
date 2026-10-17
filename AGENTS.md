# AGENTS.md — AI Coding Agent Architecture & Conventions Guide

## Mission & System Architecture
Decoupled headless multi-tenant multi-brand retail and wholesale platform:
- **Backend**: ONE Medusa v2 instance serving multiple brand storefronts through native Sales Channels.
- **Frontend**: Next.js App Router master templates (A: Premium B2C, B: Specialized B2C, C: Gated B2B Wholesale).
- **Branding**: Zero backend code to launch a brand. Storefronts clone a template, edit `brands/<slug>/theme.config.json` and assets, and link one Medusa Publishable API Key.

---

## Zone Classification & Safety Invariants

### 🟢 SAFE ZONES (Autonomous edits permitted)
- `brands/**`: `theme.config.json`, brand assets, copy, banners.
- `apps/storefront-*/src/sections/**`: Visual section components (Hero, ProductRail, PromoBanner, FAQ, FeatureGrid).
- `apps/storefront-*/src/content/**`: Marketing copy, legal disclosures, MDX files.
- `docs/**`: Markdown architecture, runbooks, guides.

### 🔴 PROTECTED ZONES (DO NOT EDIT WITHOUT REVIEW)
Every file in a protected zone MUST begin with the comment:
`// PROTECTED ZONE: DO NOT EDIT WITHOUT REVIEW. [Reason]`

- `packages/commerce/**`: Medusa JS SDK client, Zod schemas, cart/checkout/session data layer.
- `apps/medusa/src/workflows/**`: Webhook dispatch, distributed sagas.
- `apps/medusa/src/subscribers/**`: Event subscriptions.
- `apps/storefront-*/src/middleware.ts`: B2B wholesale access gate.
- `apps/storefront-*/src/app/checkout/**`: Multi-step payment & order processing.

---

## Directory Navigation

```text
apps/
  medusa/                   # Medusa v2 backend (Postgres, Redis, Render deploy)
    src/api/                # Health check & webhook delivery log API
    src/modules/webhook-log/# Medusa DML module persisting webhook dispatch logs
    src/workflows/          # Outbound webhook workflow (HMAC-SHA256, exponential backoff)
    src/subscribers/        # Event subscriber dispatcher
    src/scripts/seed.ts     # Idempotent multi-region, multi-channel catalog seed
  storefront-b2c/           # Template A: Premium B2C
  storefront-specialized/   # Template B: Specialized / High-risk B2C
  storefront-b2b/           # Template C: Gated B2B Wholesale
packages/
  commerce/                 # [PROTECTED] Typed Medusa JS SDK wrapper + Zod validation
  theme/                    # Zod theme schema, token generator, JSON schema
  ui/                       # Accessible typed variant UI components
  config/                   # Shared TypeScript, ESLint, Sonar configs
brands/
  <brand-slug>/             # theme.config.json, assets/, brand.env.example
scripts/
  brand-cli.mjs             # CLI: brand:create and brand:validate
  ci-guard-protected-zones.mjs # Enforces boundary separation & review headers
```

---

## Verification Commands
Before submitting any changes, execute and verify:
1. `pnpm ci:guard` — Verifies review headers and zone separation.
2. `pnpm brand:validate` — Validates all brand configs against Zod schema.
3. `pnpm typecheck` — Strict TypeScript checking across all workspaces.
4. `pnpm test` — Vitest unit test suite.
5. `pnpm test:isolation` — Multi-tenant sales channel isolation integration tests.
6. `pnpm build` — Production build across all packages and applications.
