import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * Health and liveness check endpoint for Render / Docker orchestration.
 * Does not require authentication.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const isHealthy = true // Could check DB connection pool status if needed

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    workerMode: process.env.MEDUSA_WORKER_MODE || "shared",
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || "development",
  })
}
