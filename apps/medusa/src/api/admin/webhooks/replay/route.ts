import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { WEBHOOK_LOG_MODULE } from "../../../../modules/webhook-log/index"
import { dispatchOutboundWebhookWorkflow } from "../../../../workflows/outbound-webhook"

/**
 * Admin API: Manually trigger replay for a webhook delivery log entry
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { log_id } = req.body as { log_id: string }

  if (!log_id) {
    res.status(400).json({ message: "log_id is required for replay" })
    return
  }

  const webhookLogService = req.scope.resolve(WEBHOOK_LOG_MODULE) as any
  const log = await webhookLogService.retrieveWebhookDeliveryLog(log_id)

  if (!log) {
    res.status(404).json({ message: `Webhook delivery log ${log_id} not found` })
    return
  }

  // Execute the outbound webhook workflow replay
  const { result } = await dispatchOutboundWebhookWorkflow(req.scope).run({
    input: {
      eventId: log.event_id,
      eventType: log.event_type,
      salesChannelId: log.sales_channel_id,
      brandSlug: log.brand_slug,
      payload: log.payload,
      isReplay: true,
      logId: log.id,
    },
  })

  res.status(200).json({
    message: "Webhook replay triggered successfully",
    result,
  })
}
