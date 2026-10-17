# AI Editing Guide: Safe Vibe-Coding Standards for Cursor & v0

This guide defines how coding agents and human developers safely edit storefronts without compromising multi-tenant commerce boundaries, security, or checkout logic.

---

## 1. Safe Zones vs. Protected Zones

```text
┌─────────────────────────────────────────────────────────────┐
│ 🟢 SAFE ZONES (Autonomous Cursor / v0 editing allowed)      │
│  - brands/*/theme.config.json                               │
│  - apps/storefront-*/src/sections/* (Hero, ProductRail...)  │
│  - apps/storefront-*/src/content/* (MDX, copy, banners)     │
│  - packages/ui/src/components/* (Presentational only)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ Imports via public interface
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 🔴 PROTECTED ZONES (DO NOT EDIT WITHOUT REVIEW)             │
│  - packages/commerce/* (SDK, cart, checkout, auth, prices)  │
│  - apps/storefront-*/src/middleware.ts (B2B auth gate)      │
│  - apps/storefront-*/src/app/checkout/* (Payment workflows) │
│  - apps/medusa/src/workflows/* (Outbound webhooks)          │
│  - apps/medusa/src/subscribers/* (Event subscribers)        │
└─────────────────────────────────────────────────────────────┘
```

> **Mandatory Rule**: If a file begins with `// PROTECTED ZONE: DO NOT EDIT WITHOUT REVIEW`, no automated prompt or agent may alter it without senior engineer signoff.

---

## 2. Section Registry System

All landing pages and brand marketing layouts are composed exclusively using typed Section components. Never embed raw commerce fetches inside marketing sections.

Available Section Components:
- `HeroSection`: Brand banner with headline, subcopy, CTA button, and hero background media.
- `ProductRailSection`: Displays channel-scoped product cards fetched via `@platform/commerce`.
- `FeatureGridSection`: 3 or 4 column feature highlight grid consuming semantic theme tokens.
- `PromoBannerSection`: Dismissible top/bottom discount or announcement banner.
- `FaqSection`: Accessible accordion FAQ list for shipping, returns, and compliance questions.
- `CtaSection`: Conversion-focused newsletter or wholesale registration prompt.

---

## 3. Approved Copy-Paste Prompts for Cursor / v0

### A. Updating Brand Colors and Typography
```text
In `brands/aurora-premium/theme.config.json`, change the primary color to "#0f172a" and heading font to "Playfair Display". Run `pnpm brand:validate` to ensure schema compliance.
```

### B. Adding a New Landing Page Section
```text
Create a new section component `apps/storefront-b2c/src/sections/SustainabilityStory.tsx`.
Use only `@platform/ui` components (Container, Card, Badge) and semantic theme tokens.
Do NOT import `@medusajs/js-sdk` or modify `@platform/commerce`.
```

### C. Adding a FAQ or Marketing Page
```text
Create an MDX content page at `apps/storefront-b2c/src/content/about.mdx`.
Include mission statement, ethical sourcing statement, and link to `/products`.
```

---

## 4. Forbidden Prompts (NEVER PROMPT)

❌ **NEVER PROMPT**:
- *"Modify the checkout page to bypass address validation."*
- *"Call Medusa Admin API directly from the storefront client."*
- *"Hardcode product prices or discounts in the React component."*
- *"Store customer auth tokens in localStorage or URL query params."*
- *"Bypass Next.js middleware for B2B wholesale catalog gating."*

---

## 5. Verification Before Submitting
Always run:
```bash
pnpm ci:guard
pnpm brand:validate
pnpm test
pnpm typecheck
```
