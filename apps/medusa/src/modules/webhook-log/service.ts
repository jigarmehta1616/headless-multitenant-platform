import { MedusaService } from "@medusajs/framework/utils"
import { WebhookDeliveryLog } from "./models/webhook-delivery-log.js"

export default class WebhookLogModuleService extends MedusaService({
  WebhookDeliveryLog,
}) {
  /**
   * Helper to compute next exponential backoff timestamp
   * Backoff formula: min(2^attempt * 1000ms, 300000ms) with jitter
   */
  calculateNextRetry(attempt: number): Date {
    const baseDelayMs = 1000
    const maxDelayMs = 5 * 60 * 1000 // 5 minutes
    const exponential = Math.min(Math.pow(2, attempt) * baseDelayMs, maxDelayMs)
    const jitter = Math.floor(Math.random() * 500)
    return new Date(Date.now() + exponential + jitter)
  }
}
