// PROTECTED ZONE: DO NOT EDIT WITHOUT REVIEW.
// Reason: Product data access layer. Enforces channel-scoped fetching, variant mapping, and runtime schema validation.

import type Medusa from "@medusajs/js-sdk"
import { ProductSchema, type Product } from "../types.js"
import { z } from "zod"

export async function listProducts(
  sdk: Medusa,
  params?: {
    limit?: number
    offset?: number
    collection_id?: string[]
    category_id?: string[]
    q?: string
    currency_code?: string
    region_id?: string
  }
): Promise<{ products: Product[]; count: number }> {
  const queryParams: Record<string, any> = {
    limit: params?.limit ?? 20,
    offset: params?.offset ?? 0,
    fields: "*variants,*variants.calculated_price,*variants.options,*images,*categories",
  }

  if (params?.collection_id?.length) {
    queryParams.collection_id = params.collection_id
  }
  if (params?.category_id?.length) {
    queryParams.category_id = params.category_id
  }
  if (params?.q) {
    queryParams.q = params.q
  }
  if (params?.region_id) {
    queryParams.region_id = params.region_id
  }
  if (params?.currency_code) {
    queryParams.currency_code = params.currency_code
  }

  const response = await sdk.store.product.list(queryParams)

  const ProductListResponseSchema = z.object({
    products: z.array(ProductSchema),
    count: z.number().optional().default(0),
  })

  const validated = ProductListResponseSchema.parse(response)
  return {
    products: validated.products,
    count: validated.count ?? validated.products.length,
  }
}

export async function getProductByHandle(
  sdk: Medusa,
  handle: string,
  regionId?: string
): Promise<Product | null> {
  const queryParams: Record<string, any> = {
    handle,
    fields: "*variants,*variants.calculated_price,*variants.options,*images,*categories",
  }
  if (regionId) {
    queryParams.region_id = regionId
  }

  const response = await sdk.store.product.list(queryParams)
  const products = response.products as any[]

  if (!products || products.length === 0) {
    return null
  }

  return ProductSchema.parse(products[0])
}
