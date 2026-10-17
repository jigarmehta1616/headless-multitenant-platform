# API Conventions & Contracts

## 1. Store API (`/store/*`)
The Store API is consumed by storefronts via `@platform/commerce`.

### Mandatory Header:
- `x-publishable-api-key`: Publishable API Key tied to the brand's sales channel.
  All product listing, cart creation, and category retrieval queries are scoped automatically by this header.

### Core Endpoints:
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/store/products` | Lists products scoped to the publishable API key's sales channel. |
| `GET` | `/store/products/:id` | Retrieves product detail with calculated prices and options. |
| `POST` | `/store/carts` | Creates a new cart bound to region and sales channel. |
| `GET` | `/store/carts/:id` | Retrieves cart details, line items, and totals. |
| `POST` | `/store/carts/:id/line-items` | Adds variant to cart (validates channel scoping). |
| `POST` | `/store/carts/:id` | Updates shipping address, email, or billing address. |
| `POST` | `/store/payment-collections` | Initializes payment sessions for checkout. |
| `POST` | `/store/carts/:id/complete` | Completes checkout and creates order. |
| `GET` | `/store/regions` | Lists active regions, currencies, and tax rates. |

---

## 2. Health & Monitoring API
| Method | Endpoint | Auth | Response |
|---|---|---|---|
| `GET` | `/health` | Public | `{ status: "healthy", uptime: number, workerMode: string }` |

---

## 3. Admin Webhook API
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/webhooks` | Admin Bearer | Query delivery logs with filtering (`status`, `limit`, `offset`). |
| `POST` | `/admin/webhooks/replay` | Admin Bearer | Manually triggers retry of a failed or dead-letter event. |

---

## 4. Error Handling & Response Contracts
All API responses adhere to standardized JSON formats:
```json
{
  "message": "Human readable error description",
  "type": "invalid_data | not_found | unauthorized",
  "code": "channel_isolation_violation"
}
```
HTTP Status Codes:
- `200 OK` / `201 Created`: Successful operations.
- `400 Bad Request`: Validation failure or channel mismatch.
- `401 Unauthorized`: Missing or invalid API key / expired session.
- `404 Not Found`: Entity does not exist within the scoped sales channel.
- `429 Too Many Requests`: Rate limit threshold exceeded.
- `500 Internal Server Error`: Unhandled backend exception.
