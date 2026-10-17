// PROTECTED ZONE: DO NOT EDIT WITHOUT REVIEW.
// Reason: Cart management service. Direct native Medusa v2 Store API cart operations.

import type Medusa from "@medusajs/js-sdk"
import { CartSchema, type Cart } from "../types.js"
import { z } from "zod"

const CartResponseSchema = z.object({
  cart: CartSchema,
})

export async function getCart(sdk: Medusa, cartId: string): Promise<Cart> {
  const response = await sdk.store.cart.retrieve(cartId, {
    fields: "*items,*items.variant,*shipping_address,*billing_address,*shipping_methods,*payment_collection",
  })
  const validated = CartResponseSchema.parse(response)
  return validated.cart
}

export async function createCart(
  sdk: Medusa,
  params?: {
    region_id?: string
    currency_code?: string
    sales_channel_id?: string
  }
): Promise<Cart> {
  const response = await sdk.store.cart.create(params || {})
  const validated = CartResponseSchema.parse(response)
  return validated.cart
}

export async function addToCart(
  sdk: Medusa,
  cartId: string,
  variantId: string,
  quantity = 1
): Promise<Cart> {
  const response = await sdk.store.cart.createLineItem(cartId, {
    variant_id: variantId,
    quantity,
  })
  const validated = CartResponseSchema.parse(response)
  return validated.cart
}

export async function updateLineItem(
  sdk: Medusa,
  cartId: string,
  lineItemId: string,
  quantity: number
): Promise<Cart> {
  const response = await sdk.store.cart.updateLineItem(cartId, lineItemId, {
    quantity,
  })
  const validated = CartResponseSchema.parse(response)
  return validated.cart
}

export async function removeLineItem(
  sdk: Medusa,
  cartId: string,
  lineItemId: string
): Promise<Cart> {
  const response = await sdk.store.cart.deleteLineItem(cartId, lineItemId)
  // In Medusa v2, deleteLineItem returns { parent: cart, ... }
  if (response && "parent" in response && response.parent) {
    return CartSchema.parse(response.parent)
  }
  return getCart(sdk, cartId)
}
