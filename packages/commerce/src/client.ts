// PROTECTED ZONE: DO NOT EDIT WITHOUT REVIEW.
// Reason: Central Medusa JS SDK client factory. Enforces publishable API key authentication, base URL routing, and security headers.

import Medusa from "@medusajs/js-sdk"

export interface CommerceClientConfig {
  baseUrl: string
  publishableKey: string
  debug?: boolean
}

/**
 * Creates a configured instance of Medusa JS SDK v2
 */
export function createCommerceClient(config: CommerceClientConfig): Medusa {
  if (!config.baseUrl) {
    throw new Error("[CommerceClient] baseUrl is required.")
  }
  if (!config.publishableKey) {
    throw new Error("[CommerceClient] publishableKey is required for multi-tenant channel isolation.")
  }

  return new Medusa({
    baseUrl: config.baseUrl,
    publishableKey: config.publishableKey,
    debug: config.debug ?? process.env.NODE_ENV === "development",
  })
}

let defaultClient: Medusa | null = null

/**
 * Gets or initializes singleton client for server/client runtime
 */
export function getCommerceClient(): Medusa {
  if (defaultClient) {
    return defaultClient
  }

  const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

  defaultClient = createCommerceClient({
    baseUrl,
    publishableKey,
  })

  return defaultClient
}
