// PROTECTED ZONE: DO NOT EDIT WITHOUT REVIEW.
// Reason: Outbound webhook event subscriber dispatcher for core domain events.

import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { dispatchOutboundWebhookWorkflow } from "../workflows/outbound-webhook"
import crypto from "node:crypto"

/**
 * Universal Outbound Webhook Subscriber
 * Listens to core domain events and dispatches signed, idempotent webhooks to automation receivers (e.g. n8n, ERP)
 */
export default async function webhookDispatcherSubscriber({
  event,
  container,
}: SubscriberArgs<any>) {
  const eventName = event.name
  const data = event.data || {}
  const eventId = data.id || crypto.randomUUID()
  const salesChannelId = data.sales_channel_id || null

  try {
    await dispatchOutboundWebhookWorkflow(container).run({
      input: {
        eventId: typeof eventId === "string" ? eventId : crypto.randomUUID(),
        eventType: eventName,
        salesChannelId,
        brandSlug: null,
        payload: data,
      },
    })
  } catch (error) {
    console.error(`[WebhookDispatcher] Failed to dispatch workflow for event ${eventName}:`, error)
  }
}

export const config: SubscriberConfig = {
  event: [
    "order.placed",
    "order.canceled",
    "order.updated",
    "fulfillment.created",
    "shipment.created",
    "payment.captured",
    "payment.refunded",
    "customer.created",
    "customer.updated",
    "product.created",
    "product.updated",
    "inventory-item.created",
    "inventory-item.updated",
  ],
}
