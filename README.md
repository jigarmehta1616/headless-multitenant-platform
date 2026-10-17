# Decoupled Multi-Tenant Headless E-Commerce Platform

A production-grade, headless multi-brand and wholesale e-commerce platform powered by **Medusa v2** and **Next.js App Router**, featuring zero custom backend commerce plumbing, automated multi-tenant sales channel isolation, and configuration-driven brand launching.

---

## 🏗️ Monorepo Architecture

```text
├── apps/
│   ├── medusa/                  # Medusa v2 backend (Postgres, Redis, Render deploy)
│   ├── storefront-b2c/          # Template A: Premium B2C
│   ├── storefront-specialized/  # Template B: Specialized / High-risk B2C
│   └── storefront-b2b/          # Template C: Gated B2B Wholesale
├── packages/
│   ├── commerce/                # [PROTECTED] Typed Medusa JS SDK wrapper + Zod validation
│   ├── theme/                   # Zod theme schema, token generator, JSON Schema
│   ├── ui/                      # Shared accessible design-system components
│   └── config/                  # Shared TypeScript, ESLint, Prettier, Sonar configs
├── brands/
│   ├── aurora-premium/          # Template A Brand Configuration & Assets
│   ├── apex-tactical/           # Template B Brand Configuration & Assets
│   └── vanguard-wholesale/      # Template C Brand Configuration & Assets
├── scripts/
│   ├── brand-cli.mjs            # Brand scaffolding and validation CLI
│   └── ci-guard-protected-zones.mjs # Protected zones invariant enforcement
├── render.yaml                  # Render Blueprints for Server, Worker, Postgres, Redis
├── docker-compose.yml           # Local multi-service container orchestration
└── .github/workflows/ci.yml     # Automated CI quality gates
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js `20.x` or `24.x`
- `pnpm` `12.x`
- Docker & Docker Compose

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Local Infrastructure (Postgres & Redis)
```bash
docker compose up -d postgres redis
```

### 3. Initialize & Seed Database
```bash
# Run database migrations
pnpm --filter medusa medusa db:migrate

# Seed multi-region, multi-currency, and 3-channel catalog
pnpm --filter medusa seed
```

### 4. Run Development Servers
```bash
# Starts Medusa backend (9000) and storefronts concurrently
pnpm dev
```

---

## 🧪 Verification & Quality Checks

```bash
# Verify protected zones & review headers
pnpm ci:guard

# Validate all brand theme configurations against Zod schema
pnpm brand:validate

# Run all unit tests
pnpm test

# Run multi-tenant sales channel isolation integration tests
pnpm test:isolation

# Typecheck all packages and applications
pnpm typecheck
```

---

## 🚀 Launching a New Brand
Launching a new brand storefront requires **zero custom backend code**:
```bash
pnpm brand:create my-new-brand --template b2c
```
Follow the generated instructions in `brands/my-new-brand/DEPLOYMENT.md` to link a Medusa Sales Channel publishable key and deploy to Vercel.
