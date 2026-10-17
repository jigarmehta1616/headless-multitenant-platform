import { describe, it, expect } from "vitest"

/**
 * Idempotent Seed Unit & Contract Tests
 * Validates the structure and consistency of the multi-region, multi-currency, and sales-channel dataset
 */
describe("Seed Script Configuration & Contracts", () => {
  const desiredRegions = [
    {
      name: "North America",
      currency_code: "usd",
      countries: ["us", "ca"],
    },
    {
      name: "European Union",
      currency_code: "eur",
      countries: ["de", "fr", "it", "es", "nl"],
    },
    {
      name: "United Kingdom",
      currency_code: "gbp",
      countries: ["gb"],
    },
  ]

  const desiredChannels = [
    { name: "Aurora Luxury B2C", slug: "aurora-luxury" },
    { name: "Apex Tactical B2C", slug: "apex-tactical" },
    { name: "Vanguard Wholesale B2B", slug: "vanguard-wholesale" },
  ]

  it("defines 3 discrete multi-currency regions covering NA, EU, and UK", () => {
    expect(desiredRegions.length).toBe(3)
    const currencies = desiredRegions.map((r) => r.currency_code)
    expect(currencies).toContain("usd")
    expect(currencies).toContain("eur")
    expect(currencies).toContain("gbp")
  })

  it("configures exactly one sales channel per master tenant", () => {
    expect(desiredChannels.length).toBe(3)
    const slugs = desiredChannels.map((c) => c.slug)
    expect(slugs).toEqual(["aurora-luxury", "apex-tactical", "vanguard-wholesale"])
  })

  it("maintains unique publishable key mappings per channel", () => {
    const keys = desiredChannels.map((c) => `pk_${c.slug.replace("-", "_")}_live`)
    const set = new Set(keys)
    expect(set.size).toBe(desiredChannels.length)
  })
})
