import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { formatDate } from "@/lib/date"

describe("formatDate", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-02-26T12:00:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("formats a date a few seconds ago", () => {
    const fiveSecondsAgo = new Date("2026-02-26T11:59:55.000Z")
    const result = formatDate(fiveSecondsAgo, "en-US")
    expect(result).toMatch(/5\s*sec/)
  })

  it("formats a date one hour ago", () => {
    const oneHourAgo = new Date("2026-02-26T11:00:00.000Z")
    const result = formatDate(oneHourAgo, "en-US")
    expect(result).toMatch(/1\s*hr/)
  })

  it("accepts a numeric timestamp", () => {
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000
    const result = formatDate(tenMinutesAgo, "en-US")
    expect(result).toMatch(/10\s*min/)
  })

  it("formats a future date", () => {
    const inTwoHours = new Date("2026-02-26T14:00:00.000Z")
    const result = formatDate(inTwoHours, "en-US")
    expect(result).toMatch(/in\s*2\s*hr/)
  })
})
