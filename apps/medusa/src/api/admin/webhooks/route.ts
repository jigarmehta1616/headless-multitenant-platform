import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { WEBHOOK_LOG_MODULE } from "../../../modules/webhook-log/index"

/**
 * Admin API: List and filter webhook delivery logs
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const webhookLogService = req.scope.resolve(WEBHOOK_LOG_MODULE) as any

  const limit = Number(req.query.limit) || 50
  const offset = Number(req.query.offset) || 0
  const status = req.query.status as string | undefined

  const filters: Record<string, any> = {}
  if (status) {
    filters.status = status
  }

  const [logs, count] = await webhookLogService.listAndCountWebhookDeliveryLogs(filters, {
    take: limit,
    skip: offset,
    order: { created_at: "DESC" },
  })

  res.status(200).json({
    logs,
    count,
    limit,
    offset,
  })
}
