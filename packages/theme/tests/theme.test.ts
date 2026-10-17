import { describe, it, expect } from "vitest"
import { ThemeConfigSchema } from "../src/schema.js"
import { generateCssVariables, generateTailwindTheme } from "../src/tokens.js"

describe("Theme System", () => {
  const validConfig = {
    brand: {
      name: "Aurora Luxury",
      slug: "aurora-luxury",
      salesChannelEnv: "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
    },
    colors: {
      primary: "#111827",
      secondary: "#f3f4f6",
      surface: "#ffffff",
      text: "#1f2937",
      accent: "#d97706",
      muted: "#6b7280",
      border: "#e5e7eb",
    },
    typography: {
      heading: "Playfair Display",
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
      ageGate: false,
      wishlist: true,
      quickOrder: false,
      wholesaleGated: false,
    },
    content: {
      nav: [{ label: "Home", href: "/" }],
      footer: [{ label: "Terms", href: "/terms" }],
      banners: [],
    },
  }

  it("validates a compliant theme config successfully", () => {
    const parsed = ThemeConfigSchema.parse(validConfig)
    expect(parsed.brand.name).toBe("Aurora Luxury")
    expect(parsed.colors.primary).toBe("#111827")
  })

  it("rejects invalid hex colors", () => {
    const invalid = {
      ...validConfig,
      colors: {
        ...validConfig.colors,
        primary: "not-a-color",
      },
    }
    expect(() => ThemeConfigSchema.parse(invalid)).toThrow()
  })

  it("generates CSS root variables accurately", () => {
    const parsed = ThemeConfigSchema.parse(validConfig)
    const css = generateCssVariables(parsed)
    expect(css).toContain("--color-primary: #111827;")
    expect(css).toContain("--font-heading: Playfair Display, sans-serif;")
    expect(css).toContain("--container-max-width: 1280px;")
  })

  it("generates Tailwind theme extensions mapping to CSS variables", () => {
    const parsed = ThemeConfigSchema.parse(validConfig)
    const tw = generateTailwindTheme(parsed)
    expect(tw.extend.colors.brand.primary).toBe("var(--color-primary)")
    expect(tw.extend.fontFamily.heading).toEqual(["var(--font-heading)"])
    expect(tw.extend.maxWidth.container).toBe("var(--container-max-width)")
  })
})
