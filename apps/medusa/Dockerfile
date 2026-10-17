# Multi-stage production Dockerfile for Medusa v2 Backend
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@12.6.0 --activate
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++ curl

# 1. Prune & Install Dependencies
FROM base AS dependencies
WORKDIR /app
COPY pnpm-lock.yaml* pnpm-workspace.yaml package.json turbo.json ./
COPY packages/ ./packages/
COPY apps/medusa/package.json ./apps/medusa/
RUN pnpm install --frozen-lockfile

# 2. Build Backend
FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages ./packages
COPY pnpm-lock.yaml* pnpm-workspace.yaml package.json turbo.json ./
COPY apps/medusa/ ./apps/medusa/
RUN pnpm --filter medusa build

# 3. Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 medusauser

COPY --from=builder --chown=medusauser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=medusauser:nodejs /app/apps/medusa ./apps/medusa
COPY --from=builder --chown=medusauser:nodejs /app/packages ./packages
COPY --from=builder --chown=medusauser:nodejs /app/package.json ./package.json

USER medusauser
WORKDIR /app/apps/medusa

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:9000/health || exit 1

CMD ["node", "dist/index.js"]
