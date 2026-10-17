# Deployment & Disaster Recovery Runbook

## 1. Backend Deployment on Render (`render.yaml`)

The platform is deployed using Render Blueprints:
1. Link the repository to Render.
2. Render detects `render.yaml` and provisions:
   - **`medusa-postgres`**: Managed PostgreSQL 16 database.
   - **`medusa-redis`**: Managed Redis 7 cache and queue cluster.
   - **`medusa-server`**: Web Service running `MEDUSA_WORKER_MODE=server`.
   - **`medusa-worker`**: Background Worker running `MEDUSA_WORKER_MODE=worker`.
3. Migrations execute automatically before new server containers spin up via `preDeployCommand: pnpm --filter medusa medusa db:migrate`.

---

## 2. Storefront Deployment on Vercel
Each brand storefront runs as an independent Vercel project:
1. In Vercel, create a project with root directory set to `apps/storefront-b2c` (or `storefront-specialized`, `storefront-b2b`).
2. Set Environment Variables:
   - `NEXT_PUBLIC_BRAND_SLUG`
   - `NEXT_PUBLIC_MEDUSA_BACKEND_URL`
   - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
3. Trigger deployment. The build runs Next.js App Router static optimization and ISR.

---

## 3. Backup & Disaster Recovery (DR)

### Recovery Targets:
- **Recovery Point Objective (RPO)**: <= 1 hour (Continuous WAL archiving on Render PostgreSQL).
- **Recovery Time Objective (RTO)**: <= 30 minutes.

### Database Backup & Restore Drill:
1. **Automated Daily Backups**: Render retains automated daily snapshots with point-in-time recovery (PITR).
2. **Manual Snapshot Before Deployments**:
   ```bash
   # Create on-demand backup before major schema migrations
   render databases backup medusa-postgres
   ```
3. **Restoration Procedure**:
   - In Render Dashboard, select `medusa-postgres` -> Backups -> Restore.
   - Choose target timestamp or snapshot.
   - Update `DATABASE_URL` in environment group if restoring to a new database instance.
   - Restart `medusa-server` and `medusa-worker`.
