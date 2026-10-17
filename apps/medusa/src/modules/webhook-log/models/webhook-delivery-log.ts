import { model } from "@medusajs/framework/utils"

export const WebhookDeliveryLog = model.define("webhook_delivery_log", {
  id: model.id().primaryKey(),
  event_id: model.text(),
  event_type: model.text(),
  sales_channel_id: model.text().nullable(),
  brand_slug: model.text().nullable(),
  endpoint_url: model.text(),
  status: model.enum(["pending", "delivered", "failed", "dead_letter"]).default("pending"),
  attempts: model.number().default(0),
  max_attempts: model.number().default(5),
  response_status: model.number().nullable(),
  response_body: model.text().nullable(),
  error_message: model.text().nullable(),
  payload: model.json(),
  next_retry_at: model.dateTime().nullable(),
  delivered_at: model.dateTime().nullable(),
})
