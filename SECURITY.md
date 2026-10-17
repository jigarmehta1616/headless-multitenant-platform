# Security Architecture & Policies

## 1. Secrets Management & Fail-Fast Validation
- **No Secrets in Source**: Passwords, private keys, JWT secrets, and payment tokens must never be committed to Git.
- **Fail-Fast Startup**: Environment variables are strictly validated at process startup. Missing mandatory keys (e.g. `DATABASE_URL`, `JWT_SECRET`, `COOKIE_SECRET`) terminate startup immediately.
- **Public vs. Private Variables**:
  - `NEXT_PUBLIC_*` variables are bundled into client browsers (restricted to publishable API key, backend URL, and brand slug).
  - Server secrets (`JWT_SECRET`, `OUTBOUND_WEBHOOK_SECRET`, `DATABASE_URL`, `REDIS_URL`) remain isolated on the backend.

---

## 2. CORS Isolation per Storefront Origin
CORS rules on Medusa v2 restrict requests to known storefront domains:
- `STORE_CORS`: Comma-separated list of approved storefront origins (e.g., `https://aurora.example.com,https://vanguard.example.com`).
- `ADMIN_CORS`: Restricted to authorized admin dashboard URLs.
- `AUTH_CORS`: Explicitly configured for customer auth endpoints.
Wildcards (`*`) are strictly prohibited in staging and production.

---

## 3. Database Least Privilege
- Medusa runtime connects via a dedicated application database user (`medusa_user`).
- The user holds `SELECT`, `INSERT`, `UPDATE`, `DELETE` on the schema, but is prevented from executing superuser administrative tasks.
- In Render and production Docker, database migrations run via controlled deploy steps before worker activation.

---

## 4. Multi-Tenant Sales Channel Isolation
- Every storefront interacts only through an assigned Publishable API Key.
- Medusa enforces channel-scoping at the database query level:
  - Key `pk_aurora` cannot retrieve or query products belonging to `apex-tactical` or `vanguard-wholesale`.
  - Attempts to inject foreign variant IDs into checkout carts fail validation.

---

## 5. Webhook Security & HMAC Verification
- Outbound webhooks to n8n/ERP are signed with HMAC-SHA256:
  `X-Medusa-Signature: t={timestamp},v1={hex_digest}`
- Receivers must verify:
  1. Header signature matches `HMAC_SHA256(secret, "${timestamp}.${rawBody}")`
  2. Timestamp is within 300 seconds (5-minute replay window)
  3. Reject duplicate `X-Medusa-Event-Id` headers.

---

## 6. Automated Security Scans
- **Secret Scanning**: Gitleaks runs on every push and pull request via `.github/workflows/ci.yml`.
- **Dependency Auditing**: `pnpm audit --audit-level=high` blocks merge on critical vulnerabilities.
- **Protected Zones Guard**: `pnpm ci:guard` ensures no unauthorized changes to commerce contracts.
