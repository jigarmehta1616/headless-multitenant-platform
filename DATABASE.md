# Database Architecture & Migration Management

## 1. Engine & Connectivity
- **Engine**: Managed PostgreSQL 16 (Render / Docker Compose)
- **Connection Pooling**: Managed via Medusa v2 Knex/MikroORM database pool with bounded min/max connection limits:
  - `min`: 2 connections per instance
  - `max`: 20 connections per instance
- **SSL**: Enforced in production (`ssl: { rejectUnauthorized: true }`).

---

## 2. Core Entities & Relationships

```mermaid
erDiagram
    SALES_CHANNEL ||--o{ PUBLISHABLE_API_KEY : "linked via api_key_sales_channel"
    SALES_CHANNEL ||--o{ PRODUCT_SALES_CHANNEL : "scopes"
    PRODUCT ||--o{ PRODUCT_SALES_CHANNEL : "assigned to"
    PRODUCT ||--|{ PRODUCT_VARIANT : "contains"
    PRODUCT_VARIANT ||--o{ PRICE_LIST_PRICE : "has gated prices"
    CUSTOMER_GROUP ||--o{ PRICE_LIST : "applies rules to"
    CUSTOMER ||--o{ CUSTOMER_GROUP_CUSTOMER : "belongs to"
    REGION ||--o{ COUNTRY : "covers"
    STOCK_LOCATION ||--o{ STOCK_LOCATION_SALES_CHANNEL : "fulfills for"
    WEBHOOK_DELIVERY_LOG {
        uuid id PK
        string event_id
        string event_type
        string sales_channel_id
        string status
        int attempts
        json payload
        datetime next_retry_at
        datetime delivered_at
    }
```

---

## 3. Webhook Delivery Log Schema (`webhook_delivery_log`)
Persisted via the custom Medusa DML module in `apps/medusa/src/modules/webhook-log`:
- `id`: Primary key (UUID)
- `event_id`: Unique identifier of the business event (UUID)
- `event_type`: Domain event name (e.g. `order.placed`, `payment.captured`)
- `sales_channel_id`: Tenant channel ID (nullable)
- `brand_slug`: Tenant brand identifier
- `endpoint_url`: Target receiver URL
- `status`: State enum (`pending`, `delivered`, `failed`, `dead_letter`)
- `attempts`: Number of retry attempts made
- `max_attempts`: Retry threshold (default: 5)
- `response_status`: Last HTTP response code received
- `response_body`: Truncated HTTP response body for debugging
- `error_message`: Error message if network exception occurred
- `payload`: Full JSON envelope dispatched
- `next_retry_at`: Scheduled timestamp for next retry attempt
- `delivered_at`: Timestamp of successful 2xx delivery

---

## 4. Migration Strategy & Zero-Downtime Deploys
1. **Pre-Deploy Migration Execution**:
   Render executes `pnpm --filter medusa medusa db:migrate` as the `preDeployCommand` before starting new application containers.
2. **Expand-and-Contract Rule**:
   - Column additions, table additions, and new indexes are additive (non-breaking).
   - Column deletions or renaming must use a multi-stage migration where old columns are deprecated first before deletion.
3. **Rollback & Roll-forward**:
   - In case of a migration failure during deployment, Render aborts the deploy, leaving existing containers running safely.
   - Database restore drills are documented in `DEPLOYMENT.md`.
