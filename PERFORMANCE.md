# Performance Budgets & Caching Strategy

## 1. Core Web Vitals Budgets (Mobile & Desktop)
- **Largest Contentful Paint (LCP)**: `< 2.5s` on mid-range mobile 4G.
- **Cumulative Layout Shift (CLS)**: `< 0.1`.
- **Interaction to Next Paint (INP)**: `< 200ms`.
- **First Contentful Paint (FCP)**: `< 1.2s`.

---

## 2. Route Caching Matrix (Next.js App Router)

| Route Type | Strategy | Revalidation | Rationale |
|---|---|---|---|
| **Home (`/`)** | ISR (Static) | 600s (Tag-based revalidation) | Marketing hero, brand collections rarely change instantaneously. |
| **Catalog (`/products`, `/collections/*`)** | ISR (Static) | Tag-based (`revalidateTag("products")`) | Fast global CDN caching; invalidated via Medusa `product.updated` webhook. |
| **Product Detail (`/products/[handle]`)** | ISR (Static) | Tag-based | Variant options and descriptions cached on edge. |
| **Cart (`/cart`)** | SSR (Dynamic) | No Cache (`cache: 'no-store'`) | User-specific cart state stored in cookie session. |
| **Checkout (`/checkout/*`)** | SSR (Dynamic) | No Cache | Real-time shipping options, taxes, and payment intents. |
| **Account (`/account/*`)** | SSR (Dynamic) | No Cache | User orders, profile, and addresses. |

---

## 3. Asset & Bundle Optimization
1. **Images**: Always use `next/image` with modern WebP/AVIF formats and responsive `sizes` attribute.
2. **Fonts**: Self-hosted via `next/font/google` with `display: swap`.
3. **Component Bundling**: Client components (`"use client"`) are pushed to the leaf nodes of the component tree to minimize client JavaScript execution.
