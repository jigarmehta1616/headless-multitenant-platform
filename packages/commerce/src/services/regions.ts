// PROTECTED ZONE: DO NOT EDIT WITHOUT REVIEW.
// Reason: Region and currency routing service. Fetches available regions, currencies, and tax providers from Medusa v2.

import type Medusa from "@medusajs/js-sdk"
import { RegionSchema, ShippingOptionSchema, type Region, type ShippingOption } from "../types.js"
import { z } from "zod"

export async function listRegions(sdk: Medusa): Promise<Region[]> {
  const response = await sdk.store.region.list()
  const RegionListSchema = z.object({
    regions: z.array(RegionSchema),
  })
  const validated = RegionListSchema.parse(response)
  return validated.regions
}

export async function listShippingOptions(sdk: Medusa, cartId: string): Promise<ShippingOption[]> {
  const response = await sdk.store.fulfillment.listCartOptions({
    cart_id: cartId,
  })
  const ShippingOptionListSchema = z.object({
    shipping_options: z.array(ShippingOptionSchema),
  })
  const validated = ShippingOptionListSchema.parse(response)
  return validated.shipping_options
}
