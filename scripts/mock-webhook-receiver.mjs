#!/usr/bin/env node

/**
 * Local Mock Webhook Receiver for n8n / ERP testing
 * Verifies HMAC-SHA256 signature and logs incoming domain events
 */
import http from "node:http"
import crypto from "node:crypto"

const PORT = process.env.RECEIVER_PORT || 5678
const SECRET = process.env.OUTBOUND_WEBHOOK_SECRET || "default_webhook_signing_secret_min_32"

function verifySignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader) return false

  const parts = signatureHeader.split(",")
  let timestamp = null
  let signature = null

  for (const part of parts) {
    const [k, v] = part.split("=")
    if (k === "t") timestamp = parseInt(v, 10)
    if (k === "v1") signature = v
  }

  if (!timestamp || !signature) return false

  // Replay check: 5 minute window (300 seconds)
  const currentTimestamp = Math.floor(Date.now() / 1000)
  if (Math.abs(currentTimestamp - timestamp) > 300) {
    console.warn(`⚠️ [Receiver] Replay window expired. Event timestamp: ${timestamp}, Current: ${currentTimestamp}`)
    return false
  }

  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(`${timestamp}.${rawBody}`)
  const expectedSignature = hmac.digest("hex")

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/webhook/medusa") {
    let body = ""
    req.on("data", (chunk) => {
      body += chunk
    })

    req.on("end", () => {
      const signatureHeader = req.headers["x-medusa-signature"]
      const eventType = req.headers["x-medusa-event-type"]
      const eventId = req.headers["x-medusa-event-id"]

      const isValid = verifySignature(body, signatureHeader, SECRET)

      if (!isValid) {
        console.error(`❌ [Receiver] 401 Unauthorized — Invalid HMAC Signature for event ${eventId} (${eventType})`)
        res.writeHead(401, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: "Invalid HMAC-SHA256 signature" }))
        return
      }

      try {
        const parsed = JSON.parse(body)
        console.log(`\n========================================`)
        console.log(`📥 [Webhook Received] ${eventType}`)
        console.log(`   ID:            ${eventId}`)
        console.log(`   Sales Channel: ${parsed.sales_channel_id || "global"}`)
        console.log(`   Payload:       ${JSON.stringify(parsed.data, null, 2)}`)
        console.log(`========================================\n`)

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ received: true, event_id: eventId }))
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: "Malformed JSON" }))
      }
    })
  } else {
    res.writeHead(404, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ message: "Not Found" }))
  }
})

server.listen(PORT, () => {
  console.log(`🚀 Mock Webhook Receiver listening at http://localhost:${PORT}/webhook/medusa`)
  console.log(`   Verifying HMAC signatures with secret: "${SECRET.substring(0, 8)}..."`)
})
