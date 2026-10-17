// PROTECTED ZONE: DO NOT EDIT WITHOUT REVIEW.
// Reason: Customer authentication and session service. Interfaces with native Medusa v2 Auth API (emailpass provider).

import type Medusa from "@medusajs/js-sdk"
import { CustomerSchema, type Customer } from "../types.js"
import { z } from "zod"

export async function getCurrentCustomer(sdk: Medusa): Promise<Customer | null> {
  try {
    const response = await sdk.store.customer.retrieve({
      fields: "*groups,*metadata",
    })
    const CustomerResponseSchema = z.object({
      customer: CustomerSchema,
    })
    const validated = CustomerResponseSchema.parse(response)
    return validated.customer
  } catch (err: any) {
    if (err?.status === 401 || err?.response?.status === 401) {
      return null
    }
    throw err
  }
}

export async function loginCustomer(
  sdk: Medusa,
  credentials: { email: string; password: string }
): Promise<string> {
  const response = (await sdk.auth.login("customer", "emailpass", credentials)) as any
  // Medusa v2 returns a session token or sets cookie
  return response?.token || ""
}

export async function registerCustomer(
  sdk: Medusa,
  data: { email: string; password: string; first_name?: string; last_name?: string }
): Promise<any> {
  const response = await sdk.auth.register("customer", "emailpass", data)
  return response
}
