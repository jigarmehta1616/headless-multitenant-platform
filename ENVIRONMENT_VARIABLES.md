# Environment Variables & Configuration

This document specifies all runtime environment variables for the Medusa backend and Next.js storefronts.

---

## 1. Medusa Backend (`apps/medusa/.env`)

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `NODE_ENV` | Yes | Node runtime mode (`development`, `staging`, `production`) | `production` |
| `PORT` | No | Port for HTTP server | `9000` |
| `DATABASE_URL` | Yes | PostgreSQL 16 connection string | `postgres://user:pass@host:5432/medusa_db` |
| `REDIS_URL` | Yes (Prod) | Redis connection string for cache, event-bus, locking | `redis://default:pass@host:6379` |
| `MEDUSA_WORKER_MODE` | Yes | Instance mode (`server`, `worker`, `shared`) | `server` |
| `JWT_SECRET` | Yes | Secret for signing JWT authentication tokens (min 32 chars) | `(generate in Render)` |
| `COOKIE_SECRET` | Yes | Secret for signing session cookies (min 32 chars) | `(generate in Render)` |
| `STORE_CORS` | Yes | Allowed Storefront origins (comma separated) | `https://aurora.com,https://vanguard.com` |
| `ADMIN_CORS` | Yes | Allowed Admin dashboard origins | `https://admin.yourdomain.com` |
| `AUTH_CORS` | Yes | Allowed customer authentication origins | `https://aurora.com,https://vanguard.com` |
| `OUTBOUND_WEBHOOK_URL`| Yes | Destination URL for n8n or webhook receiver | `https://n8n.internal.net/webhook/medusa` |
| `OUTBOUND_WEBHOOK_SECRET` | Yes | HMAC-SHA256 signing secret for outbound payloads | `whsec_live_...` |

---

## 2. Storefront Applications (`apps/storefront-*`)

| Variable | Target | Description | Example |
|---|---|---|---|
| `NEXT_PUBLIC_BRAND_SLUG` | Client/Server | Matches folder in `/brands/<slug>` | `aurora-premium` |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | Client/Server | Base URL of Medusa v2 API | `https://medusa-api.yourdomain.com` |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Client/Server | Publishable API Key tied to the brand's sales channel | `pk_aurora_live_...` |
| `NEXT_PUBLIC_BASE_URL` | Client/Server | Production URL of the storefront | `https://aurora-luxury.com` |

---

## 3. Fail-Fast Validation Rule
Every application checks its required variables at boot time and throws an explanatory error if any required variable is missing or malformed, preventing silent runtime failures in production.
