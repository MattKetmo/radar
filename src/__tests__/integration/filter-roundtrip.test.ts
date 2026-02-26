import { describe, it, expect } from "vitest"

import { parseFilter, filterToString, parseAsFilter } from "@/components/alerts/utils"
import { LabelFilter } from "@/components/alerts/types"

describe("filter round-trip: parseFilter → filterToString", () => {
  it("round-trips equals operator (=)", () => {
    const input = "severity=critical"
    const parsed = parseFilter(input)
    expect(parsed).toEqual({
      label: "severity",
      value: "critical",
      exclude: false,
      regex: false,
    })
    expect(filterToString(parsed)).toBe(input)
  })

  it("round-trips not-equals operator (!=)", () => {
    const input = "namespace!=monitoring"
    const parsed = parseFilter(input)
    expect(parsed).toEqual({
      label: "namespace",
      value: "monitoring",
      exclude: true,
      regex: false,
    })
    expect(filterToString(parsed)).toBe(input)
  })

  it("round-trips regex-match operator (=~)", () => {
    const input = "alertname=~KubePod.*"
    const parsed = parseFilter(input)
    expect(parsed).toEqual({
      label: "alertname",
      value: "KubePod.*",
      exclude: false,
      regex: true,
    })
    expect(filterToString(parsed)).toBe(input)
  })

  it("round-trips regex-not-match operator (!~)", () => {
    const input = "job!~kube-state-.*"
    const parsed = parseFilter(input)
    expect(parsed).toEqual({
      label: "job",
      value: "kube-state-.*",
      exclude: true,
      regex: true,
    })
    expect(filterToString(parsed)).toBe(input)
  })

  it("round-trips comma-separated values", () => {
    const input = "severity=critical,warning"
    const parsed = parseFilter(input)
    expect(parsed).toEqual({
      label: "severity",
      value: ["critical", "warning"],
      exclude: false,
      regex: false,
    })
    expect(filterToString(parsed)).toBe(input)
  })

  it("round-trips comma-separated values with exclude", () => {
    const input = "namespace!=payments,checkout"
    const parsed = parseFilter(input)
    expect(parsed).toEqual({
      label: "namespace",
      value: ["payments", "checkout"],
      exclude: true,
      regex: false,
    })
    expect(filterToString(parsed)).toBe(input)
  })
})

describe("parseFilter edge cases", () => {
  it("handles empty string gracefully", () => {
    const parsed = parseFilter("")
    expect(parsed).toEqual({
      label: "",
      value: "",
      exclude: false,
      regex: false,
    })
  })

  it("handles filter with empty value by backtracking regex", () => {
    const parsed = parseFilter("severity=")
    expect(parsed.label).toBe("severit")
    expect(parsed.exclude).toBe(false)
  })

  it("handles input without standard operator by backtracking regex", () => {
    const parsed = parseFilter("just-a-string")
    expect(parsed.label).toBe("just")
    expect(parsed.regex).toBe(false)
  })

  it("handles regex pipe patterns in value", () => {
    const input = "severity=~critical|warning|error"
    const parsed = parseFilter(input)
    expect(parsed.label).toBe("severity")
    expect(parsed.regex).toBe(true)
    expect(parsed.exclude).toBe(false)
    expect(typeof parsed.value).toBe("string")
  })
})

describe("parseAsFilter nuqs parser", () => {
  it("parse() returns the same result as parseFilter", () => {
    const input = "severity=critical"
    const fromParser = parseAsFilter.parse(input)
    const fromDirect = parseFilter(input)
    expect(fromParser).toEqual(fromDirect)
  })

  it("serialize() returns the same result as filterToString", () => {
    const filter: LabelFilter = {
      label: "alertname",
      value: "Watchdog",
      exclude: true,
      regex: false,
    }
    const fromParser = parseAsFilter.serialize(filter)
    const fromDirect = filterToString(filter)
    expect(fromParser).toBe(fromDirect)
    expect(fromParser).toBe("alertname!=Watchdog")
  })

  it("full round-trip through nuqs parser", () => {
    const original = "namespace=~pay.*"
    const parsed = parseAsFilter.parse(original)
    expect(parsed).not.toBeNull()
    const serialized = parseAsFilter.serialize(parsed!)
    expect(serialized).toBe(original)
  })
})
