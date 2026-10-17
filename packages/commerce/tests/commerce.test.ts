import { describe, it, expect } from "vitest"
import { ProductSchema, CartSchema, AddressSchema } from "../src/types.js"
import { createCommerceClient } from "../src/client.js"

describe("Commerce Protected Zone", () => {
  it("initializes Medusa JS SDK client with baseUrl and publishableKey", () => {
    const client = createCommerceClient({
      baseUrl: "https://medusa.staging.example.com",
      publishableKey: "pk_test_12345",
    })
    expect(client).toBeDefined()
  })

  it("fails fast if publishable key or baseUrl is missing", () => {
    expect(() =>
      createCommerceClient({
        baseUrl: "",
        publishableKey: "pk_test",
      })
    ).toThrow(/baseUrl is required/)

    expect(() =>
      createCommerceClient({
        baseUrl: "https://medusa.staging.example.com",
        publishableKey: "",
      })
    ).toThrow(/publishableKey is required/)
  })

  it("validates Product schema matching Medusa v2 store shape", () => {
    const sampleProduct = {
      id: "prod_01J000000000000000000001",
      title: "Handcrafted Ceramic Vase",
      handle: "handcrafted-ceramic-vase",
      variants: [
        {
          id: "variant_01",
          title: "Default",
          inventory_quantity: 15,
          calculated_price: {
            calculated_amount: 8500,
            currency_code: "usd",
          },
        },
      ],
    }

    const validated = ProductSchema.parse(sampleProduct)
    expect(validated.handle).toBe("handcrafted-ceramic-vase")
    expect(validated.variants[0]?.calculated_price?.calculated_amount).toBe(8500)
  })

  it("validates Cart schema with line items and currency", () => {
    const sampleCart = {
      id: "cart_01J000000000000000000001",
      currency_code: "usd",
      items: [
        {
          id: "item_01",
          title: "Handcrafted Ceramic Vase",
          quantity: 2,
          unit_price: 8500,
          total: 17000,
        },
      ],
      subtotal: 17000,
      total: 17000,
    }

    const validated = CartSchema.parse(sampleCart)
    expect(validated.items.length).toBe(1)
    expect(validated.total).toBe(17000)
  })
})
