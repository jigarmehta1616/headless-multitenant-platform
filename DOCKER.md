# Docker Containerization & Local Orchestration

## 1. Local Compose Services (`docker-compose.yml`)

The platform includes a complete local production-like Docker environment:

```bash
# Start Postgres & Redis only (for local development with pnpm dev)
docker compose up -d postgres redis

# Start entire stack including containerized Medusa server & worker
docker compose up -d --build
```

### Services Table:
| Service | Image / Build | Port | Health Check |
|---|---|---|---|
| `postgres` | `postgres:16-alpine` | `5432` | `pg_isready -U medusa_user` |
| `redis` | `redis:7-alpine` | `6379` | `redis-cli ping` |
| `medusa-server` | `apps/medusa/Dockerfile` (`server` mode) | `9000` | `curl -f http://localhost:9000/health` |
| `medusa-worker` | `apps/medusa/Dockerfile` (`worker` mode) | None | Dependent on Redis/Postgres |

---

## 2. Multi-Stage Dockerfile Security
The `apps/medusa/Dockerfile` follows production best practices:
1. **Multi-stage isolation**: Build tools and development dependencies are purged from the final runner layer.
2. **Non-root execution**: Runs under user `medusauser:nodejs` (UID 1001).
3. **Built-in health check**: Polls `/health` every 30 seconds.
