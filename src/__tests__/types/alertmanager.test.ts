import { describe, it, expect } from "vitest"
import { AlertSchema, SilenceSchema } from "@/types/alertmanager"

describe("AlertSchema", () => {
  const validAlert = {
    labels: { alertname: "HighCPU", severity: "critical" },
    annotations: { summary: "CPU is high" },
    startsAt: "2026-02-26T10:00:00.000Z",
    endsAt: "0001-01-01T00:00:00.000Z",
    generatorURL: "http://prometheus:9090/graph",
    fingerprint: "abc123",
    status: { inhibitedBy: [], silencedBy: [], state: "active" },
  }

  it("validates a well-formed alert", () => {
    const result = AlertSchema.safeParse(validAlert)
    expect(result.success).toBe(true)
  })

  it("rejects missing required fields", () => {
    const { labels: _, ...incomplete } = validAlert
    const result = AlertSchema.safeParse(incomplete)
    expect(result.success).toBe(false)
  })

  it("rejects timestamps without exactly 3 decimal places", () => {
    const badTimestamp = { ...validAlert, startsAt: "2026-02-26T10:00:00Z" }
    const result = AlertSchema.safeParse(badTimestamp)
    expect(result.success).toBe(false)
  })

  it("rejects timestamps with too many decimal places", () => {
    const badTimestamp = { ...validAlert, startsAt: "2026-02-26T10:00:00.1234Z" }
    const result = AlertSchema.safeParse(badTimestamp)
    expect(result.success).toBe(false)
  })
})

describe("SilenceSchema", () => {
  const validSilence = {
    id: "silence-1",
    matchers: [{ name: "alertname", value: "HighCPU", isEqual: true, isRegex: false }],
    startsAt: "2026-02-26T10:00:00.000Z",
    endsAt: "2026-02-27T10:00:00.000Z",
    createdBy: "admin",
    comment: "Maintenance window",
    status: { state: "active" },
  }

  it("validates a well-formed silence", () => {
    const result = SilenceSchema.safeParse(validSilence)
    expect(result.success).toBe(true)
  })

  it("rejects wrong types for matcher fields", () => {
    const bad = {
      ...validSilence,
      matchers: [{ name: "alertname", value: "HighCPU", isEqual: "yes", isRegex: false }],
    }
    const result = SilenceSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })
})
