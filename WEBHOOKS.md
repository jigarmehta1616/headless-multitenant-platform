# Outbound Webhook Specification & Hand-off Contract

This document provides the integration contract for the in-house automation engineer (connecting n8n, ERP, CRM, and accounting systems).

---

## 1. Supported Domain Events
The Medusa v2 subscriber (`apps/medusa/src/subscribers/webhook-dispatcher.ts`) dispatches events across the domain lifecycle:

- **Orders**: `order.placed`, `order.canceled`, `order.updated`
- **Fulfillment**: `fulfillment.created`, `shipment.created`
- **Payments**: `payment.captured`, `payment.refunded`
- **Customers**: `customer.created`, `customer.updated`
- **Catalog & Inventory**: `product.created`, `product.updated`, `inventory-item.created`, `inventory-item.updated`

---

## 2. Standardized Envelope Structure
Every event arrives in an envelope formatted as follows:

```json
{
  "id": "e5b8d28c-4fa2-432a-bc91-2384a51e6001",
  "type": "order.placed",
  "api_version": "2026-10",
  "created_at": "2026-10-17T13:30:00.000Z",
  "sales_channel_id": "sc_01J000000000000000000001",
  "brand": "aurora-luxury",
  "data": {
    "id": "order_01J000000000000000000001",
    "display_id": 1001,
    "status": "pending",
    "currency_code": "usd",
    "total": 48000,
    "email": "customer@example.com",
    "items": [
      {
        "id": "item_01",
        "title": "Aurora Silk Evening Gown",
        "sku": "AUR-SLK-BLU-S",
        "quantity": 1,
        "unit_price": 48000
      }
    ]
  }
}
```

---

## 3. HMAC-SHA256 Signature Verification

### Headers
Every request includes:
- `X-Medusa-Signature`: `t={timestamp},v1={hex_digest}`
- `X-Medusa-Event-Id`: Unique UUID of the event
- `X-Medusa-Event-Type`: Type identifier (e.g. `order.placed`)

### Verification Algorithm:
1. Extract `timestamp` and `signature` from `X-Medusa-Signature`.
2. Reject if `Math.abs(Date.now() / 1000 - timestamp) > 300` (5-minute replay window).
3. Compute expected hash: `HMAC_SHA256(secret, "${timestamp}.${rawBody}")`.
4. Perform timing-safe equality check between expected hash and `v1`.

### Verification Code: TypeScript
```typescript
import crypto from "node:crypto"

export function verifyMedusaWebhook(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  const parts = signatureHeader.split(",")
  const timestamp = parseInt(parts.find((p) => p.startsWith("t="))?.split("=")[1] || "0", 10)
  const signature = parts.find((p) => p.startsWith("v1="))?.split("=")[1]

  if (!timestamp || !signature) return false

  // 5 minute tolerance
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - timestamp) > 300) return false

  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(`${timestamp}.${rawBody}`)
  const expected = hmac.digest("hex")

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}
```

### Verification Code: Python
```python
import hmac
import hashlib
import time

def verify_medusa_webhook(raw_body: bytes, signature_header: str, secret: str) -> bool:
    pairs = dict(item.split("=") for item in signature_header.split(","))
    timestamp = int(pairs.get("t", 0))
    signature = pairs.get("v1", "")

    # 5 minute tolerance
    if abs(time.time() - timestamp) > 300:
        return False

    computed = hmac.new(
        secret.encode("utf-8"),
        f"{timestamp}.".encode("utf-8") + raw_body,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, computed)
```

---

## 4. Local Test Receiver
Run the local receiver to test subscriptions:
```bash
node scripts/mock-webhook-receiver.mjs
```
The server will run at `http://localhost:5678/webhook/medusa` and log all verified domain events.
