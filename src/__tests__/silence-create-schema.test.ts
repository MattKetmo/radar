import { describe, it, expect } from "vitest"
import { SilenceCreateSchema } from "@/types/alertmanager"

const validPayload = {
  matchers: [{ name: "alertname", value: "Test", isRegex: false, isEqual: true }],
  startsAt: "2026-01-01T00:00:00Z",
  endsAt: "2026-01-02T00:00:00Z",
  createdBy: "test-user",
  comment: "test comment",
}

describe("SilenceCreateSchema", () => {
  it("accepts valid payload", () => {
    expect(SilenceCreateSchema.safeParse(validPayload).success).toBe(true)
  })

  it("accepts valid payload with optional id", () => {
    expect(
      SilenceCreateSchema.safeParse({ ...validPayload, id: "some-uuid" }).success
    ).toBe(true)
  })

  it("rejects empty matchers array", () => {
    expect(
      SilenceCreateSchema.safeParse({ ...validPayload, matchers: [] }).success
    ).toBe(false)
  })

  it("rejects missing matchers", () => {
    const { matchers: _, ...rest } = validPayload
    expect(SilenceCreateSchema.safeParse(rest).success).toBe(false)
  })

  it("rejects missing startsAt", () => {
    const { startsAt: _, ...rest } = validPayload
    expect(SilenceCreateSchema.safeParse(rest).success).toBe(false)
  })

  it("rejects missing endsAt", () => {
    const { endsAt: _, ...rest } = validPayload
    expect(SilenceCreateSchema.safeParse(rest).success).toBe(false)
  })

  it("rejects missing createdBy", () => {
    const { createdBy: _, ...rest } = validPayload
    expect(SilenceCreateSchema.safeParse(rest).success).toBe(false)
  })

  it("rejects missing comment", () => {
    const { comment: _, ...rest } = validPayload
    expect(SilenceCreateSchema.safeParse(rest).success).toBe(false)
  })
})
