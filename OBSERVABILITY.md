# Observability & Monitoring

## 1. Structured Logging
Both Medusa backend and Next.js storefronts emit JSON structured logs:
```json
{
  "timestamp": "2026-10-17T13:30:00.000Z",
  "level": "info",
  "requestId": "req_01J000000000000000000001",
  "salesChannelId": "sc_aurora_luxury",
  "service": "medusa-server",
  "message": "Cart completed successfully",
  "orderId": "order_01J000000000000000000001"
}
```

---

## 2. Health & Readiness Probes
- **Path**: `GET /health`
- **Interval**: 30 seconds
- **Check**: Returns `200 OK` with uptime and worker mode. Used by Render and Docker Compose to detect healthy instances.

---

## 3. Recommended Production Alerts
1. **Webhook Delivery Failures**: Alert if dead-letter logs exceed 5 in a 10-minute window.
2. **Elevated 5xx Error Rate**: Alert if HTTP 5xx responses exceed 1% over 5 minutes.
3. **Database Connection Saturation**: Alert if active pool connections exceed 80% capacity.
4. **Redis Memory Usage**: Alert if Redis memory reaches 85% of allocated RAM.
