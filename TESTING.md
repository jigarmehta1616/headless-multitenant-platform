# Testing Strategy & Quality Verification

## 1. Test Pyramid & Automation

```text
       ▲
      / \       E2E Tests (Playwright)
     /   \      - Checkout, B2B Auth Gate, Age Verification
    /─────\
   /       \    Integration Tests (Vitest)
  /         \   - Channel Isolation, Seed Script, Webhook Retries
 /───────────\
/             \ Unit Tests (Vitest)
─────────────── - Theme Schema, Token Generator, Commerce Zod Schemas
```

---

## 2. Test Execution Commands

```bash
# Run all Vitest unit tests across monorepo
pnpm test

# Run multi-tenant sales channel isolation integration tests
pnpm test:isolation

# Run brand configuration schema validation
pnpm brand:validate

# Run protected boundary check
pnpm ci:guard
```

---

## 3. Channel Isolation Integration Tests (`apps/medusa/tests/channel-isolation.test.ts`)
Validates that:
1. Storefront A publishable key cannot list products assigned to Storefront B or C.
2. Direct retrieval of a product outside the assigned sales channel returns `404 Not Found`.
3. Adding a variant belonging to an unassigned channel to a cart fails with a sales channel mismatch.
4. Requests without a valid publishable key are rejected with `401 Unauthorized`.
