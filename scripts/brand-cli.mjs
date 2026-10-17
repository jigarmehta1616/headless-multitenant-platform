#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { z } from "zod"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, "..")
const brandsDir = path.resolve(rootDir, "brands")

// Schema matching @platform/theme
const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
const BrandConfigSchema = z.object({
  brand: z.object({
    name: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    salesChannelEnv: z.string().default("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"),
  }),
  colors: z.object({
    primary: z.string().regex(hexColorRegex),
    secondary: z.string().regex(hexColorRegex),
    surface: z.string().regex(hexColorRegex),
    text: z.string().regex(hexColorRegex),
    accent: z.string().regex(hexColorRegex),
  }),
  typography: z.object({
    heading: z.string(),
    body: z.string(),
    scale: z.string(),
  }),
  spacing: z.object({
    base: z.number().positive(),
    sectionY: z.number().positive(),
    containerMax: z.number().positive(),
  }),
  radius: z.object({
    sm: z.number().nonnegative(),
    md: z.number().nonnegative(),
    lg: z.number().nonnegative(),
  }),
  grid: z.object({
    productColumns: z.object({
      base: z.number().min(1),
      md: z.number().min(2),
      xl: z.number().min(2),
    }),
    gap: z.number().positive(),
  }),
  features: z.object({
    ageGate: z.boolean(),
    wishlist: z.boolean(),
    quickOrder: z.boolean(),
  }),
  content: z.object({
    nav: z.array(z.any()),
    footer: z.array(z.any()),
    banners: z.array(z.any()),
  }),
})

const command = process.argv[2]

if (command === "validate") {
  validateAllBrands()
} else if (command === "create") {
  const brandSlug = process.argv[3]
  let template = "b2c"
  const templateIdx = process.argv.indexOf("--template")
  if (templateIdx !== -1 && process.argv[templateIdx + 1]) {
    template = process.argv[templateIdx + 1]
  }
  if (!brandSlug) {
    console.error("❌ Error: Brand slug required. Usage: pnpm brand:create <brand-slug> --template b2c|specialized|b2b")
    process.exit(1)
  }
  createBrand(brandSlug, template)
} else {
  console.log("Usage: node brand-cli.mjs validate | create <slug> --template <b2c|specialized|b2b>")
  process.exit(0)
}

function validateAllBrands() {
  console.log("🔍 Validating brand configurations in /brands...")
  if (!fs.existsSync(brandsDir)) {
    console.log("No brands directory found.")
    return
  }

  const entries = fs.readdirSync(brandsDir, { withFileTypes: true })
  let errorsFound = 0

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const configPath = path.join(brandsDir, entry.name, "theme.config.json")
      if (!fs.existsSync(configPath)) {
        console.error(`❌ [${entry.name}] Missing theme.config.json`)
        errorsFound++
        continue
      }

      try {
        const raw = fs.readFileSync(configPath, "utf-8")
        const parsed = JSON.parse(raw)
        BrandConfigSchema.parse(parsed)
        console.log(`✅ [${entry.name}] Valid theme configuration`)
      } catch (err) {
        console.error(`❌ [${entry.name}] Schema validation error:`, err.message)
        errorsFound++
      }
    }
  }

  if (errorsFound > 0) {
    console.error(`\n❌ Failed: ${errorsFound} brand configuration(s) contain errors.`)
    process.exit(1)
  } else {
    console.log("\n✨ All brand configurations passed validation!")
  }
}

function createBrand(slug, template) {
  const brandPath = path.join(brandsDir, slug)
  if (fs.existsSync(brandPath)) {
    console.error(`❌ Brand directory already exists at ${brandPath}`)
    process.exit(1)
  }

  fs.mkdirSync(path.join(brandPath, "assets"), { recursive: true })
  fs.mkdirSync(path.join(brandPath, "content"), { recursive: true })

  const isB2B = template === "b2b"
  const isSpecialized = template === "specialized"

  const themeConfig = {
    $schema: "../../packages/theme/src/theme.schema.json",
    brand: {
      name: slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      slug,
      salesChannelEnv: "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
    },
    colors: {
      primary: isSpecialized ? "#1c1917" : isB2B ? "#0f172a" : "#18181b",
      secondary: "#f4f4f5",
      surface: "#ffffff",
      text: "#09090b",
      accent: isSpecialized ? "#ea580c" : isB2B ? "#0284c7" : "#d97706",
    },
    typography: {
      heading: isB2B ? "Roboto" : isSpecialized ? "Chakra Petch" : "Playfair Display",
      body: "Inter",
      scale: "1.25",
    },
    spacing: {
      base: 4,
      sectionY: 96,
      containerMax: 1280,
    },
    radius: {
      sm: 4,
      md: 8,
      lg: 16,
    },
    grid: {
      productColumns: {
        base: 2,
        md: 3,
        xl: 4,
      },
      gap: 24,
    },
    features: {
      ageGate: isSpecialized,
      wishlist: !isB2B,
      quickOrder: isB2B,
      wholesaleGated: isB2B,
    },
    content: {
      nav: [
        { label: "Home", href: "/" },
        { label: "Catalog", href: "/products" },
      ],
      footer: [
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
      ],
      banners: [
        {
          id: "welcome-banner",
          text: `Welcome to ${slug.toUpperCase()} official store`,
          type: "promo",
          dismissible: true,
        },
      ],
    },
  }

  fs.writeFileSync(
    path.join(brandPath, "theme.config.json"),
    JSON.stringify(themeConfig, null, 2),
    "utf-8"
  )

  const envExample = `# Storefront Environment Variables for Brand: ${slug}
NEXT_PUBLIC_BRAND_SLUG=${slug}
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://medusa-api.yourdomain.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_sales_channel_publishable_key
NEXT_PUBLIC_BASE_URL=https://${slug}.yourdomain.com
`
  fs.writeFileSync(path.join(brandPath, "brand.env.example"), envExample, "utf-8")

  const vercelInstructions = `# Vercel Deployment Instructions for Brand: ${slug}

1. In Vercel, create a new project linked to repository \`apps/storefront-${template}\`.
2. Configure Root Directory as \`apps/storefront-${template}\`.
3. Set Environment Variables from \`brands/${slug}/brand.env.example\`:
   - \`NEXT_PUBLIC_BRAND_SLUG=${slug}\`
   - \`NEXT_PUBLIC_MEDUSA_BACKEND_URL\`
   - \`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY\`
4. Copy assets from \`brands/${slug}/assets\` to \`public/brands/${slug}\` in your build pipeline if custom logos/favicons are present.
5. Deploy!
`
  fs.writeFileSync(path.join(brandPath, "DEPLOYMENT.md"), vercelInstructions, "utf-8")

  console.log(`\n🎉 Brand "${slug}" scaffolded successfully at /brands/${slug}`)
  console.log(`   Template: apps/storefront-${template}`)
  console.log(`   Config: brands/${slug}/theme.config.json`)
  console.log(`   Env Example: brands/${slug}/brand.env.example`)
  console.log(`   Vercel Runbook: brands/${slug}/DEPLOYMENT.md\n`)
}
