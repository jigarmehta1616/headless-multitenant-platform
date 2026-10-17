# Branding & Multi-Tenant Theming System

## 1. Overview
The platform enables rapid brand deployment: launching a new storefront requires **zero custom backend code**. Each brand is defined as a standalone folder in `/brands/<slug>`.

---

## 2. Brand Folder Anatomy
```text
brands/brand-slug/
├── theme.config.json     # Zod-validated design tokens, colors, typography, features
├── assets/               # Brand logos, favicons, banners
├── content/              # Brand-specific marketing copy, legal terms, MDX
├── brand.env.example     # Template for storefront environment variables
└── DEPLOYMENT.md         # Step-by-step Vercel deployment runbook
```

---

## 3. Theming Schema (`theme.config.json`)
```json
{
  "brand": {
    "name": "Aurora Luxury",
    "slug": "aurora-luxury",
    "salesChannelEnv": "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"
  },
  "colors": {
    "primary": "#111827",
    "secondary": "#f3f4f6",
    "surface": "#ffffff",
    "text": "#1f2937",
    "accent": "#d97706"
  },
  "typography": {
    "heading": "Playfair Display",
    "body": "Inter",
    "scale": "1.25"
  },
  "spacing": { "base": 4, "sectionY": 96, "containerMax": 1280 },
  "radius": { "sm": 4, "md": 8, "lg": 16 },
  "grid": { "productColumns": { "base": 2, "md": 3, "xl": 4 }, "gap": 24 },
  "features": { "ageGate": false, "wishlist": true, "quickOrder": false },
  "content": { "nav": [], "footer": [], "banners": [] }
}
```

---

## 4. Brand CLI Commands

```bash
# Scaffold a new brand from a template (b2c | specialized | b2b)
pnpm brand:create brand-slug --template b2c

# Validate all brands in /brands against Zod schema (runs in CI)
pnpm brand:validate
```
