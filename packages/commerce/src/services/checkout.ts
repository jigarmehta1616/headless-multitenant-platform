// PROTECTED ZONE: DO NOT EDIT WITHOUT REVIEW.
// Reason: Multi-step checkout service. Coordinates shipping address, shipping methods, payment session initiation, and order completion natively through Medusa v2.

import type Medusa from "@medusajs/js-sdk"
import { CartSchema, OrderSchema, type Cart, type Order, type Address } from "../types.js"
import { z } from "zod"

const CartResponseSchema = z.object({
  cart: CartSchema,
})

const OrderResponseSchema = z.object({
  type: z.literal("order").optional(),
  order: OrderSchema,
})

export async function setShippingAddress(
  sdk: Medusa,
  cartId: string,
  address: Address,
  email?: string
): Promise<Cart> {
  const payload: Record<string, any> = {
    shipping_address: address,
  }
  if (email) {
    payload.email = email
  }

  const response = await sdk.store.cart.update(cartId, payload)
  return CartResponseSchema.parse(response).cart
}

export async function addShippingMethod(
  sdk: Medusa,
  cartId: string,
  optionId: string
): Promise<Cart> {
  const response = await sdk.store.cart.addShippingMethod(cartId, {
    option_id: optionId,
  })
  return CartResponseSchema.parse(response).cart
}

export async function initiatePaymentSession(
  sdk: Medusa,
  cart: Cart,
  providerId = "pp_system_default"
): Promise<any> {
  const response = await sdk.store.payment.initiatePaymentSession(cart as any, {
    provider_id: providerId,
  })
  return response
}

export async function completeCart(sdk: Medusa, cartId: string): Promise<Order> {
  const response = await sdk.store.cart.complete(cartId)
  const validated = OrderResponseSchema.parse(response)
  return validated.order
}
