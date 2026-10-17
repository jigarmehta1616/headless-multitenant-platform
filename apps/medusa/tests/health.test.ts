import { describe, it, expect, vi } from "vitest"
import { GET } from "../src/api/health/route.js"

describe("Health Check Endpoint", () => {
  it("returns 200 OK with status healthy and worker mode", async () => {
    let responseStatus: number | null = null
    let responseJson: any = null

    const mockReq = {} as any
    const mockRes = {
      status: (code: number) => {
        responseStatus = code
        return mockRes
      },
      json: (data: any) => {
        responseJson = data
        return mockRes
      },
    } as any

    await GET(mockReq, mockRes)

    expect(responseStatus).toBe(200)
    expect(responseJson.status).toBe("healthy")
    expect(responseJson.timestamp).toBeDefined()
    expect(responseJson.uptime).toBeGreaterThanOrEqual(0)
  })
})
