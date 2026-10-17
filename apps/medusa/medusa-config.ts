import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const isRedisAvailable = Boolean(process.env.REDIS_URL)

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/medusa_db",
    redisUrl: process.env.REDIS_URL,
    workerMode: (process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server") || "shared",
    http: {
      storeCors:
        process.env.STORE_CORS ||
        "http://localhost:3000,http://localhost:3001,http://localhost:3002",
      adminCors: process.env.ADMIN_CORS || "http://localhost:9000,http://localhost:5173",
      authCors:
        process.env.AUTH_CORS ||
        "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:9000",
      jwtSecret:
        process.env.JWT_SECRET ||
        "platform_jwt_secret_must_be_overridden_in_production_min_32_chars",
      cookieSecret:
        process.env.COOKIE_SECRET ||
        "platform_cookie_secret_must_be_overridden_in_production_min_32_chars",
    },
  },
  modules: isRedisAvailable
    ? [
        {
          resolve: "@medusajs/medusa/cache-redis",
          options: {
            redisUrl: process.env.REDIS_URL,
          },
        },
        {
          resolve: "@medusajs/medusa/event-bus-redis",
          options: {
            redisUrl: process.env.REDIS_URL,
          },
        },
        {
          resolve: "@medusajs/medusa/workflow-engine-redis",
          options: {
            redis: {
              url: process.env.REDIS_URL,
            },
          },
        },
        {
          resolve: "@medusajs/medusa/locking-redis",
          options: {
            redisUrl: process.env.REDIS_URL,
          },
        },
        {
          resolve: "./src/modules/webhook-log",
        },
      ]
    : [
        {
          resolve: "./src/modules/webhook-log",
        },
      ],
})
