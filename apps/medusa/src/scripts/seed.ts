import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createCustomerGroupsWorkflow,
  createPriceListsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * Idempotent Seed Script for Multi-Tenant Architecture:
 * - 3 Sales Channels (Aurora B2C, Apex Specialized B2C, Vanguard B2B)
 * - 3 Publishable API Keys with exclusive channel associations
 * - 3 Multi-currency Regions (USD, EUR, GBP)
 * - Stock locations & inventory linking
 * - Wholesale Customer Groups and Gated Price Lists with quantity tiers
 * - Multi-brand catalog with variants and channel scoping
 */
export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const regionModule = container.resolve(Modules.REGION)
  const customerModule = container.resolve(Modules.CUSTOMER)
  const productModule = container.resolve(Modules.PRODUCT)
  const apiKeyModule = container.resolve(Modules.API_KEY)
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)

  logger.info("🌱 Starting idempotent multi-tenant platform seed...")

  // 1. Regions (North America, Europe, United Kingdom)
  const existingRegions = await regionModule.listRegions({})
  const regionMap = new Map<string, string>()

  const desiredRegions = [
    {
      name: "North America",
      currency_code: "usd",
      countries: ["us", "ca"],
      payment_providers: ["pp_system_default"],
    },
    {
      name: "European Union",
      currency_code: "eur",
      countries: ["de", "fr", "it", "es", "nl"],
      payment_providers: ["pp_system_default"],
    },
    {
      name: "United Kingdom",
      currency_code: "gbp",
      countries: ["gb"],
      payment_providers: ["pp_system_default"],
    },
  ]

  for (const reg of desiredRegions) {
    const existing = existingRegions.find((r) => r.name === reg.name)
    if (existing) {
      regionMap.set(reg.name, existing.id)
      logger.info(`  [Region] Already exists: ${reg.name} (${existing.id})`)
    } else {
      const { result } = await createRegionsWorkflow(container).run({
        input: {
          regions: [reg],
        },
      })
      const created = result[0]
      if (created) {
        regionMap.set(reg.name, created.id)
        logger.info(`  [Region] Created: ${reg.name} (${created.id})`)
      }
    }
  }

  // 2. Sales Channels (1 per brand tenant)
  const existingChannels = await salesChannelModule.listSalesChannels({})
  const channelMap = new Map<string, string>()

  const desiredChannels = [
    {
      name: "Aurora Luxury B2C",
      description: "Premium editorial fashion & lifestyle storefront",
      slug: "aurora-luxury",
    },
    {
      name: "Apex Tactical B2C",
      description: "Specialized high-performance gear with eligibility verification",
      slug: "apex-tactical",
    },
    {
      name: "Vanguard Wholesale B2B",
      description: "Gated wholesale B2B portal with tiered volume pricing",
      slug: "vanguard-wholesale",
    },
  ]

  for (const sc of desiredChannels) {
    const existing = existingChannels.find((c) => c.name === sc.name)
    if (existing) {
      channelMap.set(sc.slug, existing.id)
      logger.info(`  [Sales Channel] Already exists: ${sc.name} (${existing.id})`)
    } else {
      const { result } = await createSalesChannelsWorkflow(container).run({
        input: {
          salesChannelsData: [
            {
              name: sc.name,
              description: sc.description,
            },
          ],
        },
      })
      const created = result[0]
      if (created) {
        channelMap.set(sc.slug, created.id)
        logger.info(`  [Sales Channel] Created: ${sc.name} (${created.id})`)
      }
    }
  }

  // 3. Stock Locations
  const existingLocations = await stockLocationModule.listStockLocations({})
  const locationMap = new Map<string, string>()

  const desiredLocations = [
    { name: "North America Central Warehouse" },
    { name: "European Logistics Hub" },
  ]

  for (const loc of desiredLocations) {
    const existing = existingLocations.find((l) => l.name === loc.name)
    if (existing) {
      locationMap.set(loc.name, existing.id)
      logger.info(`  [Stock Location] Already exists: ${loc.name} (${existing.id})`)
    } else {
      const { result } = await createStockLocationsWorkflow(container).run({
        input: {
          locations: [loc],
        },
      })
      const created = result[0]
      if (created) {
        locationMap.set(loc.name, created.id)
        logger.info(`  [Stock Location] Created: ${loc.name} (${created.id})`)
      }
    }
  }

  // Link Locations to Sales Channels
  const naLocationId = locationMap.get("North America Central Warehouse")
  if (naLocationId) {
    for (const [slug, channelId] of channelMap.entries()) {
      try {
        await linkSalesChannelsToStockLocationWorkflow(container).run({
          input: {
            id: naLocationId,
            add: [channelId],
          },
        })
      } catch {
        // idempotent link
      }
    }
  }

  // 4. Publishable API Keys (One key per Sales Channel)
  const existingApiKeys = await apiKeyModule.listApiKeys({ type: "publishable" })
  for (const sc of desiredChannels) {
    const channelId = channelMap.get(sc.slug)
    if (!channelId) continue

    const keyTitle = `${sc.name} Publishable Key`
    const existingKey = existingApiKeys.find((k) => k.title === keyTitle)

    if (existingKey) {
      logger.info(`  [Publishable Key] Already exists: ${keyTitle} (${existingKey.token})`)
      // Ensure channel is linked
      try {
        await linkSalesChannelsToApiKeyWorkflow(container).run({
          input: {
            id: existingKey.id,
            add: [channelId],
          },
        })
      } catch {
        // Link exists
      }
    } else {
      const { result } = await createApiKeysWorkflow(container).run({
        input: {
          api_keys: [
            {
              title: keyTitle,
              type: "publishable",
              created_by: "seed_admin",
            },
          ],
        },
      })
      const createdKey = result[0]
      if (createdKey) {
        await linkSalesChannelsToApiKeyWorkflow(container).run({
          input: {
            id: createdKey.id,
            add: [channelId],
          },
        })
        logger.info(`  [Publishable Key] Created & Linked: ${keyTitle} -> ${createdKey.token}`)
      }
    }
  }

  // 5. Customer Groups for B2B Wholesale
  const existingGroups = await customerModule.listCustomerGroups({})
  const groupMap = new Map<string, string>()

  const desiredGroups = [
    { name: "Wholesale Tier 1 (Standard 20% Off)" },
    { name: "Wholesale Tier 2 (VIP 35% Off)" },
  ]

  for (const grp of desiredGroups) {
    const existing = existingGroups.find((g) => g.name === grp.name)
    if (existing) {
      groupMap.set(grp.name, existing.id)
      logger.info(`  [Customer Group] Already exists: ${grp.name} (${existing.id})`)
    } else {
      const { result } = await createCustomerGroupsWorkflow(container).run({
        input: {
          customersData: [{ name: grp.name }],
        },
      })
      const created = result[0]
      if (created) {
        groupMap.set(grp.name, created.id)
        logger.info(`  [Customer Group] Created: ${grp.name} (${created.id})`)
      }
    }
  }

  // 6. Products per Sales Channel
  const existingProducts = await productModule.listProducts({})
  const auroraChannelId = channelMap.get("aurora-luxury")
  const apexChannelId = channelMap.get("apex-tactical")
  const vanguardChannelId = channelMap.get("vanguard-wholesale")

  const catalogProducts = [
    // Aurora B2C Products
    {
      channelId: auroraChannelId,
      title: "Aurora Silk Evening Gown",
      handle: "aurora-silk-evening-gown",
      description: "Handcrafted Italian mulberry silk with an architectural drape.",
      variants: [
        {
          title: "Midnight Blue / S",
          sku: "AUR-SLK-BLU-S",
          prices: [
            { currency_code: "usd", amount: 480 },
            { currency_code: "eur", amount: 450 },
            { currency_code: "gbp", amount: 390 },
          ],
        },
        {
          title: "Midnight Blue / M",
          sku: "AUR-SLK-BLU-M",
          prices: [
            { currency_code: "usd", amount: 480 },
            { currency_code: "eur", amount: 450 },
            { currency_code: "gbp", amount: 390 },
          ],
        },
      ],
    },
    {
      channelId: auroraChannelId,
      title: "Aurora Minimalist Cashmere Coat",
      handle: "aurora-cashmere-coat",
      description: "Double-faced Mongolian cashmere tailored for timeless elegance.",
      variants: [
        {
          title: "Camel / Standard",
          sku: "AUR-COAT-CAM",
          prices: [
            { currency_code: "usd", amount: 890 },
            { currency_code: "eur", amount: 840 },
            { currency_code: "gbp", amount: 720 },
          ],
        },
      ],
    },

    // Apex Tactical Specialized B2C Products
    {
      channelId: apexChannelId,
      title: "Apex Sentinel Tactical Modular Rucksack",
      handle: "apex-sentinel-rucksack",
      description: "Mil-spec 1000D Cordura rucksack with modular MOLLE load-bearing attachments.",
      variants: [
        {
          title: "Stealth Black / 45L",
          sku: "APX-RUK-45-BLK",
          prices: [
            { currency_code: "usd", amount: 260 },
            { currency_code: "eur", amount: 240 },
            { currency_code: "gbp", amount: 210 },
          ],
        },
        {
          title: "Coyote Tan / 45L",
          sku: "APX-RUK-45-TAN",
          prices: [
            { currency_code: "usd", amount: 260 },
            { currency_code: "eur", amount: 240 },
            { currency_code: "gbp", amount: 210 },
          ],
        },
      ],
    },

    // Vanguard B2B Wholesale Products
    {
      channelId: vanguardChannelId,
      title: "Industrial Grade Carbon Steel Fasteners (Box of 1000)",
      handle: "vanguard-industrial-fasteners-1000",
      description: "ISO 898-1 certified structural steel hex-head fastener units for manufacturing.",
      variants: [
        {
          title: "Grade 8.8 M12x50",
          sku: "VG-FST-M12-1000",
          prices: [
            { currency_code: "usd", amount: 250 },
            { currency_code: "eur", amount: 230 },
            { currency_code: "gbp", amount: 200 },
          ],
        },
      ],
    },
    {
      channelId: vanguardChannelId,
      title: "Heavy-Duty Modular Storage Container (Unit of 10)",
      handle: "vanguard-modular-storage-10pk",
      description: "High-density polymer stackable warehouse containment crates.",
      variants: [
        {
          title: "Standard 60L / Blue",
          sku: "VG-STR-60L-10PK",
          prices: [
            { currency_code: "usd", amount: 450 },
            { currency_code: "eur", amount: 420 },
            { currency_code: "gbp", amount: 360 },
          ],
        },
      ],
    },
  ]

  for (const prod of catalogProducts) {
    if (!prod.channelId) continue
    const existing = existingProducts.find((p) => p.handle === prod.handle)

    if (existing) {
      logger.info(`  [Product] Already exists: ${prod.title} (${prod.handle})`)
    } else {
      await createProductsWorkflow(container).run({
        input: {
          products: [
            {
              title: prod.title,
              handle: prod.handle,
              description: prod.description,
              sales_channels: [{ id: prod.channelId }],
              variants: prod.variants.map((v) => ({
                title: v.title,
                sku: v.sku,
                prices: v.prices,
              })),
            },
          ],
        },
      })
      logger.info(`  [Product] Created & Scoped to Channel: ${prod.title}`)
    }
  }

  // 7. Gated B2B Price Lists with Wholesale Volume Tiers
  const tier1GroupId = groupMap.get("Wholesale Tier 1 (Standard 20% Off)")
  if (tier1GroupId) {
    const vanguardProducts = await productModule.listProducts({
      handle: "vanguard-industrial-fasteners-1000",
    })
    const vanguardVariant = vanguardProducts[0]?.variants?.[0]
    const variantId = vanguardVariant?.id || "var_vg_fastener_default"

    try {
      await createPriceListsWorkflow(container).run({
        input: {
          price_lists_data: [
            {
              title: "Vanguard Wholesale Tier 1 Price List",
              description: "Exclusive contracted pricing for approved wholesale accounts",
              rules: {
                customer_group_id: [tier1GroupId],
              },
              prices: [
                {
                  variant_id: variantId,
                  currency_code: "usd",
                  amount: 200, // 20% off $250
                  rules: {
                    min_quantity: "5",
                  },
                },
                {
                  variant_id: variantId,
                  currency_code: "usd",
                  amount: 160, // volume tier >= 20 units
                  rules: {
                    min_quantity: "20",
                  },
                },
              ],
            },
          ],
        },
      })
      logger.info("  [Price List] Created Gated Wholesale Tier 1 Price List")
    } catch {
      logger.info("  [Price List] Wholesale price list already exists or linked")
    }
  }

  logger.info("✅ Multi-tenant platform seed completed idempotently!")
}
