import { describe, it, expect } from "vitest"
import { cn } from "../src/utils.js"

describe("UI Utilities", () => {
  it("merges tailwind class names properly", () => {
    const result = cn("px-4 py-2", "px-6", { "bg-red-500": true, "bg-blue-500": false })
    expect(result).toBe("py-2 px-6 bg-red-500")
  })
})
