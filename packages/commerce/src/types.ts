// PROTECTED ZONE: DO NOT EDIT WITHOUT REVIEW.
// Reason: Core commerce data schemas, runtime Zod validators, and contracts for native Medusa v2 Store API.

import { z } from "zod"

export const MoneyAmountSchema = z.object({
  id: z.string().optional(),
  currency_code: z.string(),
  amount: z.number(),
  min_quantity: z.number().nullable().optional(),
  max_quantity: z.number().nullable().optional(),
})

export const ProductVariantSchema = z.object({
  id: z.string(),
  title: z.string(),
  sku: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  ean: z.string().nullable().optional(),
  inventory_quantity: z.number().optional().default(0),
  manage_inventory: z.boolean().optional(),
  allow_backorder: z.boolean().optional(),
  calculated_price: z
    .object({
      calculated_amount: z.number(),
      original_amount: z.number().optional(),
      currency_code: z.string(),
    })
    .optional(),
  prices: z.array(MoneyAmountSchema).optional(),
  options: z
    .array(
      z.object({
        id: z.string().optional(),
        value: z.string(),
        option_id: z.string().optional(),
      })
    )
    .optional(),
})

export const ProductImageSchema = z.object({
  id: z.string().optional(),
  url: z.string(),
})

export const ProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  handle: z.string(),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  images: z.array(ProductImageSchema).optional().default([]),
  variants: z.array(ProductVariantSchema).optional().default([]),
  collection_id: z.string().nullable().optional(),
  tags: z.array(z.object({ id: z.string().optional(), value: z.string() })).optional(),
  categories: z.array(z.object({ id: z.string(), name: z.string(), handle: z.string() })).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

export const LineItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  quantity: z.number().int().positive(),
  variant_id: z.string().nullable().optional(),
  product_id: z.string().nullable().optional(),
  unit_price: z.number(),
  total: z.number(),
  subtotal: z.number().optional(),
  tax_total: z.number().optional(),
  discount_total: z.number().optional(),
  variant: ProductVariantSchema.optional(),
})

export const AddressSchema = z.object({
  id: z.string().optional(),
  first_name: z.string().optional().default(""),
  last_name: z.string().optional().default(""),
  company: z.string().nullable().optional(),
  address_1: z.string().optional().default(""),
  address_2: z.string().nullable().optional(),
  city: z.string().optional().default(""),
  country_code: z.string().min(2).max(2),
  province: z.string().nullable().optional(),
  postal_code: z.string().optional().default(""),
  phone: z.string().nullable().optional(),
})

export const ShippingOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  price_type: z.enum(["flat", "calculated"]).optional().default("flat"),
  amount: z.number().optional(),
  provider_id: z.string().optional(),
})

export const CartSchema = z.object({
  id: z.string(),
  email: z.string().nullable().optional(),
  currency_code: z.string(),
  region_id: z.string().optional(),
  sales_channel_id: z.string().optional(),
  items: z.array(LineItemSchema).default([]),
  shipping_address: AddressSchema.nullable().optional(),
  billing_address: AddressSchema.nullable().optional(),
  shipping_methods: z
    .array(
      z.object({
        id: z.string(),
        shipping_option_id: z.string().optional(),
        price: z.number(),
        name: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  subtotal: z.number().default(0),
  discount_total: z.number().default(0),
  shipping_total: z.number().default(0),
  tax_total: z.number().default(0),
  total: z.number().default(0),
  payment_collection: z
    .object({
      id: z.string(),
      status: z.string().optional(),
      payment_sessions: z
        .array(
          z.object({
            id: z.string(),
            provider_id: z.string(),
            amount: z.number(),
            status: z.string().optional(),
            data: z.record(z.unknown()).optional(),
          })
        )
        .optional(),
    })
    .nullable()
    .optional(),
})

export const RegionSchema = z.object({
  id: z.string(),
  name: z.string(),
  currency_code: z.string(),
  countries: z
    .array(
      z.object({
        id: z.string().optional(),
        iso_2: z.string(),
        display_name: z.string().optional(),
      })
    )
    .optional(),
  payment_providers: z
    .array(
      z.object({
        id: z.string(),
        is_installed: z.boolean().optional(),
      })
    )
    .optional(),
})

export const CustomerSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  groups: z.array(z.object({ id: z.string(), name: z.string() })).optional().default([]),
  metadata: z.record(z.unknown()).nullable().optional(),
})

export const OrderSchema = z.object({
  id: z.string(),
  display_id: z.number().optional(),
  email: z.string(),
  currency_code: z.string(),
  total: z.number(),
  subtotal: z.number(),
  status: z.string(),
  items: z.array(LineItemSchema).default([]),
  shipping_address: AddressSchema.nullable().optional(),
  created_at: z.string(),
})

export type Product = z.infer<typeof ProductSchema>
export type ProductVariant = z.infer<typeof ProductVariantSchema>
export type Cart = z.infer<typeof CartSchema>
export type LineItem = z.infer<typeof LineItemSchema>
export type Address = z.infer<typeof AddressSchema>
export type Region = z.infer<typeof RegionSchema>
export type Customer = z.infer<typeof CustomerSchema>
export type Order = z.infer<typeof OrderSchema>
export type ShippingOption = z.infer<typeof ShippingOptionSchema>
