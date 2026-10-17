// PROTECTED ZONE: DO NOT EDIT WITHOUT REVIEW.
// Reason: Outbound webhook dispatch workflow with HMAC-SHA256 signature, retry backoff, and delivery logging.

import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import crypto from "node:crypto"
import { WEBHOOK_LOG_MODULE } from "../modules/webhook-log/index"

export interface OutboundWebhookInput {
  eventId: string
  eventType: string
  salesChannelId?: string | null
  brandSlug?: string | null
  payload: Record<string, any>
  isReplay?: boolean
  logId?: string
}

export interface WebhookEnvelope {
  id: string
  type: string
  api_version: string
  created_at: string
  sales_channel_id: string | null
  brand: string | null
  data: Record<string, any>
}

/**
 * Creates HMAC-SHA256 signature header formatted as:
 * t=timestamp,v1=signature
 */
export function signWebhookPayload(payloadString: string, secret: string, timestamp: number): string {
  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(`${timestamp}.${payloadString}`)
  const signature = hmac.digest("hex")
  return `t=${timestamp},v1=${signature}`
}

/**
 * Step 1: Create or update initial delivery log record in PostgreSQL
 */
export const prepareWebhookLogStep = createStep(
  "prepare-webhook-log-step",
  async (input: OutboundWebhookInput, { container }) => {
    const webhookLogService = container.resolve(WEBHOOK_LOG_MODULE) as any
    const endpointUrl = process.env.OUTBOUND_WEBHOOK_URL || "http://localhost:5678/webhook/medusa"

    let log
    if (input.logId) {
      log = await webhookLogService.retrieveWebhookDeliveryLog(input.logId)
    } else {
      log = await webhookLogService.createWebhookDeliveryLogs({
        event_id: input.eventId,
        event_type: input.eventType,
        sales_channel_id: input.salesChannelId ?? null,
        brand_slug: input.brandSlug ?? null,
        endpoint_url: endpointUrl,
        status: "pending",
        attempts: 0,
        max_attempts: 5,
        payload: input.payload,
      })
    }

    return new StepResponse({ logId: log.id, endpointUrl }, log.id)
  }
)

/**
 * Step 2: Dispatch signed HTTP POST request with exponential backoff & error logging
 */
export const deliverWebhookStep = createStep(
  "deliver-webhook-step",
  async (
    {
      logId,
      endpointUrl,
      input,
    }: {
      logId: string
      endpointUrl: string
      input: OutboundWebhookInput
    },
    { container }
  ) => {
    const webhookLogService = container.resolve(WEBHOOK_LOG_MODULE) as any
    const secret = process.env.OUTBOUND_WEBHOOK_SECRET || "default_webhook_signing_secret_min_32"

    const envelope: WebhookEnvelope = {
      id: input.eventId,
      type: input.eventType,
      api_version: "2026-10",
      created_at: new Date().toISOString(),
      sales_channel_id: input.salesChannelId ?? null,
      brand: input.brandSlug ?? null,
      data: input.payload,
    }

    const payloadString = JSON.stringify(envelope)
    const timestamp = Math.floor(Date.now() / 1000)
    const signatureHeader = signWebhookPayload(payloadString, secret, timestamp)

    const maxAttempts = 5
    let currentAttempt = 0
    let delivered = false
    let lastStatus: number | null = null
    let lastBody: string | null = null
    let lastError: string | null = null

    while (currentAttempt < maxAttempts && !delivered) {
      currentAttempt++
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(endpointUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Medusa-Signature": signatureHeader,
            "X-Medusa-Event-Id": input.eventId,
            "X-Medusa-Event-Type": input.eventType,
            "User-Agent": "Medusa-Outbound-Webhook/2.0",
          },
          body: payloadString,
          signal: controller.signal,
        })
        clearTimeout(timeout)

        lastStatus = response.status
        const text = await response.text()
        lastBody = text.substring(0, 1000)

        if (response.ok) {
          delivered = true
          break
        } else {
          lastError = `HTTP error ${response.status}: ${lastBody}`
        }
      } catch (err: any) {
        lastError = err.message || "Network request failed"
      }

      // If failed and not last attempt, wait exponential backoff
      if (!delivered && currentAttempt < maxAttempts) {
        const delayMs = Math.min(Math.pow(2, currentAttempt) * 200, 3000) // bounded delay for worker
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }

    const nextRetry = delivered
      ? null
      : currentAttempt >= maxAttempts
        ? null
        : webhookLogService.calculateNextRetry(currentAttempt)

    const finalStatus = delivered
      ? "delivered"
      : currentAttempt >= maxAttempts
        ? "dead_letter"
        : "failed"

    await webhookLogService.updateWebhookDeliveryLogs(
      { id: logId },
      {
        status: finalStatus,
        attempts: currentAttempt,
        response_status: lastStatus,
        response_body: lastBody,
        error_message: lastError,
        delivered_at: delivered ? new Date() : null,
        next_retry_at: nextRetry,
      }
    )

    return new StepResponse({
      delivered,
      status: finalStatus,
      attempts: currentAttempt,
      responseStatus: lastStatus,
    })
  }
)

/**
 * Complete Outbound Webhook Workflow
 */
export const dispatchOutboundWebhookWorkflow = createWorkflow(
  "dispatch-outbound-webhook",
  (input: OutboundWebhookInput) => {
    const { logId, endpointUrl } = prepareWebhookLogStep(input)
    const deliveryResult = deliverWebhookStep({
      logId,
      endpointUrl,
      input,
    })
    return new WorkflowResponse(deliveryResult)
  }
)
