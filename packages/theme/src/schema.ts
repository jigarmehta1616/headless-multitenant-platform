import { z } from "zod"

/**
 * Hex color validation regex (#RGB or #RRGGBB)
 */
const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export const BrandConfigSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  salesChannelEnv: z.string().default("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"),
  description: z.string().optional(),
  supportEmail: z.string().email().optional(),
})

export const ColorsConfigSchema = z.object({
  primary: z.string().regex(hexColorRegex, "Invalid hex color for primary"),
  secondary: z.string().regex(hexColorRegex, "Invalid hex color for secondary"),
  surface: z.string().regex(hexColorRegex, "Invalid hex color for surface"),
  text: z.string().regex(hexColorRegex, "Invalid hex color for text"),
  accent: z.string().regex(hexColorRegex, "Invalid hex color for accent"),
  muted: z.string().regex(hexColorRegex, "Invalid hex color for muted").optional().default("#6b7280"),
  border: z.string().regex(hexColorRegex, "Invalid hex color for border").optional().default("#e5e7eb"),
  error: z.string().regex(hexColorRegex, "Invalid hex color for error").optional().default("#ef4444"),
  success: z.string().regex(hexColorRegex, "Invalid hex color for success").optional().default("#22c55e"),
})

export const TypographyConfigSchema = z.object({
  heading: z.string().min(1, "Heading font is required"),
  body: z.string().min(1, "Body font is required"),
  scale: z.string().default("1.25"),
})

export const SpacingConfigSchema = z.object({
  base: z.number().positive(),
  sectionY: z.number().positive(),
  containerMax: z.number().positive(),
})

export const RadiusConfigSchema = z.object({
  sm: z.number().nonnegative(),
  md: z.number().nonnegative(),
  lg: z.number().nonnegative(),
  full: z.number().nonnegative().optional().default(9999),
})

export const GridConfigSchema = z.object({
  productColumns: z.object({
    base: z.number().int().min(1).max(4),
    md: z.number().int().min(2).max(6),
    xl: z.number().int().min(2).max(8),
  }),
  gap: z.number().positive(),
})

export const FeaturesConfigSchema = z.object({
  ageGate: z.boolean().default(false),
  wishlist: z.boolean().default(true),
  quickOrder: z.boolean().default(false),
  wholesaleGated: z.boolean().default(false),
  reviews: z.boolean().default(false),
})

export const NavItemSchema = z.object({
  label: z.string().min(1),
  href: z.string(),
  isExternal: z.boolean().optional().default(false),
})

export const ContentConfigSchema = z.object({
  nav: z.array(NavItemSchema).default([]),
  footer: z.array(NavItemSchema).default([]),
  banners: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        href: z.string().optional(),
        dismissible: z.boolean().optional().default(true),
        type: z.enum(["info", "warning", "promo"]).default("promo"),
      })
    )
    .default([]),
})

export const ThemeConfigSchema = z.object({
  $schema: z.string().optional(),
  brand: BrandConfigSchema,
  colors: ColorsConfigSchema,
  typography: TypographyConfigSchema,
  spacing: SpacingConfigSchema,
  radius: RadiusConfigSchema,
  grid: GridConfigSchema,
  features: FeaturesConfigSchema,
  content: ContentConfigSchema,
})

export type ThemeConfig = z.infer<typeof ThemeConfigSchema>
export type BrandConfig = z.infer<typeof BrandConfigSchema>
export type ColorsConfig = z.infer<typeof ColorsConfigSchema>
export type TypographyConfig = z.infer<typeof TypographyConfigSchema>
export type FeaturesConfig = z.infer<typeof FeaturesConfigSchema>
