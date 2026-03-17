import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { parseDurationInput } from "@/lib/duration-parser"

describe("parseDurationInput", () => {
  const REF = new Date("2026-03-17T12:00:00.000Z")

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(REF)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Happy path — shorthand codes
  it("parses '15m'", () => {
    const result = parseDurationInput("15m")
    expect(result).toEqual(new Date("2026-03-17T12:15:00.000Z"))
  })

  it("parses '30m'", () => {
    const result = parseDurationInput("30m")
    expect(result).toEqual(new Date("2026-03-17T12:30:00.000Z"))
  })

  it("parses '1h'", () => {
    const result = parseDurationInput("1h")
    expect(result).toEqual(new Date("2026-03-17T13:00:00.000Z"))
  })

  it("parses '2h'", () => {
    const result = parseDurationInput("2h")
    expect(result).toEqual(new Date("2026-03-17T14:00:00.000Z"))
  })

  it("parses '4h'", () => {
    const result = parseDurationInput("4h")
    expect(result).toEqual(new Date("2026-03-17T16:00:00.000Z"))
  })

  it("parses '8h'", () => {
    const result = parseDurationInput("8h")
    expect(result).toEqual(new Date("2026-03-17T20:00:00.000Z"))
  })

  it("parses '1d'", () => {
    const result = parseDurationInput("1d")
    expect(result).toEqual(new Date("2026-03-18T12:00:00.000Z"))
  })

  it("parses '3d'", () => {
    const result = parseDurationInput("3d")
    expect(result).toEqual(new Date("2026-03-20T12:00:00.000Z"))
  })

  it("parses '1w'", () => {
    const result = parseDurationInput("1w")
    expect(result).toEqual(new Date("2026-03-24T12:00:00.000Z"))
  })

  // Variants
  it("is case insensitive: '2H'", () => {
    const result = parseDurationInput("2H")
    expect(result).toEqual(new Date("2026-03-17T14:00:00.000Z"))
  })

  it("trims whitespace: '  2h  '", () => {
    const result = parseDurationInput("  2h  ")
    expect(result).toEqual(new Date("2026-03-17T14:00:00.000Z"))
  })

  it("handles plural: '2 hours'", () => {
    const result = parseDurationInput("2 hours")
    expect(result).toEqual(new Date("2026-03-17T14:00:00.000Z"))
  })

  it("handles 'in 30 minutes'", () => {
    const result = parseDurationInput("in 30 minutes")
    expect(result).toEqual(new Date("2026-03-17T12:30:00.000Z"))
  })

  it("handles 'in 2 days'", () => {
    const result = parseDurationInput("in 2 days")
    expect(result).toEqual(new Date("2026-03-19T12:00:00.000Z"))
  })

  // Edge cases — return null
  it("returns null for empty string", () => {
    const result = parseDurationInput("")
    expect(result).toBeNull()
  })

  it("returns null for '0h'", () => {
    const result = parseDurationInput("0h")
    expect(result).toBeNull()
  })

  it("returns null for unrecognized input 'abc'", () => {
    const result = parseDurationInput("abc")
    expect(result).toBeNull()
  })

  it("returns null for negative: '-2h'", () => {
    const result = parseDurationInput("-2h")
    expect(result).toBeNull()
  })

  // Additional variants
  it("handles 'min' unit", () => {
    const result = parseDurationInput("45min")
    expect(result).toEqual(new Date("2026-03-17T12:45:00.000Z"))
  })

  it("handles 'mins' unit", () => {
    const result = parseDurationInput("20mins")
    expect(result).toEqual(new Date("2026-03-17T12:20:00.000Z"))
  })

  it("handles 'hr' unit", () => {
    const result = parseDurationInput("3hr")
    expect(result).toEqual(new Date("2026-03-17T15:00:00.000Z"))
  })

  it("handles 'hrs' unit", () => {
    const result = parseDurationInput("5hrs")
    expect(result).toEqual(new Date("2026-03-17T17:00:00.000Z"))
  })

  it("handles 'day' unit", () => {
    const result = parseDurationInput("2day")
    expect(result).toEqual(new Date("2026-03-19T12:00:00.000Z"))
  })

  it("handles 'days' unit", () => {
    const result = parseDurationInput("4days")
    expect(result).toEqual(new Date("2026-03-21T12:00:00.000Z"))
  })

  it("handles 'week' unit", () => {
    const result = parseDurationInput("2week")
    expect(result).toEqual(new Date("2026-03-31T11:00:00.000Z"))
  })

  it("handles 'weeks' unit", () => {
    const result = parseDurationInput("3weeks")
    expect(result).toEqual(new Date("2026-04-07T11:00:00.000Z"))
  })

  it("handles 'in N minute' (singular)", () => {
    const result = parseDurationInput("in 1 minute")
    expect(result).toEqual(new Date("2026-03-17T12:01:00.000Z"))
  })

  it("handles 'in N hour' (singular)", () => {
    const result = parseDurationInput("in 1 hour")
    expect(result).toEqual(new Date("2026-03-17T13:00:00.000Z"))
  })

  it("handles 'in N day' (singular)", () => {
    const result = parseDurationInput("in 1 day")
    expect(result).toEqual(new Date("2026-03-18T12:00:00.000Z"))
  })

  it("handles 'in N week' (singular)", () => {
    const result = parseDurationInput("in 1 week")
    expect(result).toEqual(new Date("2026-03-24T12:00:00.000Z"))
  })

  it("accepts custom reference date", () => {
    const customRef = new Date("2026-01-01T00:00:00.000Z")
    const result = parseDurationInput("1h", customRef)
    expect(result).toEqual(new Date("2026-01-01T01:00:00.000Z"))
  })

  it("returns null for whitespace-only string", () => {
    const result = parseDurationInput("   ")
    expect(result).toBeNull()
  })

  it("returns null for 'in' without duration", () => {
    const result = parseDurationInput("in")
    expect(result).toBeNull()
  })

  it("returns null for decimal zero: '0.0h'", () => {
    const result = parseDurationInput("0.0h")
    expect(result).toBeNull()
  })

  it("handles decimal durations: '1.5h'", () => {
    const result = parseDurationInput("1.5h")
    expect(result).toEqual(new Date("2026-03-17T13:30:00.000Z"))
  })

  it("handles decimal durations: '0.5d'", () => {
    const result = parseDurationInput("0.5d")
    expect(result).toEqual(new Date("2026-03-17T12:00:00.000Z"))
  })
})
