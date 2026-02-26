import { describe, it, expect } from "vitest"
import { parseFilter, filterToString, alertFilter, alertSort } from "@/components/alerts/utils"
import { safeRegExp, escapeRegExp } from "@/lib/regexp"
import { Alert } from "@/types/alertmanager"

function makeAlert(labels: Record<string, string>, startsAt = "2026-02-26T10:00:00.000Z"): Alert {
  return {
    labels,
    annotations: {},
    startsAt,
    endsAt: "0001-01-01T00:00:00.000Z",
    generatorURL: "http://prometheus:9090/graph",
    fingerprint: Math.random().toString(36).slice(2),
    status: { inhibitedBy: [], silencedBy: [], state: "active" },
  }
}

describe("parseFilter", () => {
  it("parses equality filter (=)", () => {
    const filter = parseFilter("severity=critical")
    expect(filter).toEqual({ label: "severity", value: "critical", exclude: false, regex: false })
  })

  it("parses not-equal filter (!=)", () => {
    const filter = parseFilter("env!=prod")
    expect(filter).toEqual({ label: "env", value: "prod", exclude: true, regex: false })
  })

  it("parses regex filter (=~)", () => {
    const filter = parseFilter("job=~api.*")
    expect(filter).toEqual({ label: "job", value: "api.*", exclude: false, regex: true })
  })

  it("parses negative regex filter (!~)", () => {
    const filter = parseFilter("instance!~localhost.*")
    expect(filter).toEqual({ label: "instance", value: "localhost.*", exclude: true, regex: true })
  })

  it("parses comma-separated values into array", () => {
    const filter = parseFilter("severity=critical,warning")
    expect(filter.value).toEqual(["critical", "warning"])
  })
})

describe("filterToString", () => {
  it("round-trips with parseFilter for all operator types", () => {
    const cases = ["severity=critical", "env!=prod", "job=~api.*", "instance!~localhost.*"]
    for (const str of cases) {
      expect(filterToString(parseFilter(str))).toBe(str)
    }
  })

  it("serializes array values with commas", () => {
    const filter = { label: "severity", value: ["critical", "warning"], exclude: false, regex: false }
    expect(filterToString(filter)).toBe("severity=critical,warning")
  })
})

describe("alertFilter", () => {
  const alerts = [
    makeAlert({ severity: "critical", job: "api", env: "prod" }),
    makeAlert({ severity: "warning", job: "web", env: "staging" }),
    makeAlert({ severity: "info", job: "api", env: "prod" }),
  ]

  it("returns all alerts when filters are empty", () => {
    const fn = alertFilter([])
    expect(alerts.filter(fn)).toHaveLength(3)
  })

  it("filters by exact label match", () => {
    const fn = alertFilter([{ label: "severity", value: "critical", exclude: false, regex: false }])
    expect(alerts.filter(fn)).toHaveLength(1)
    expect(alerts.filter(fn)[0].labels.severity).toBe("critical")
  })

  it("excludes matching labels", () => {
    const fn = alertFilter([{ label: "severity", value: "info", exclude: true, regex: false }])
    const result = alerts.filter(fn)
    expect(result).toHaveLength(2)
    expect(result.every(a => a.labels.severity !== "info")).toBe(true)
  })

  it("filters with regex pattern", () => {
    const fn = alertFilter([{ label: "severity", value: "critical|warning", exclude: false, regex: true }])
    expect(alerts.filter(fn)).toHaveLength(2)
  })

  it("uses matchAll=false to match any filter", () => {
    const filters = [
      { label: "job", value: "api", exclude: false, regex: false },
      { label: "env", value: "staging", exclude: false, regex: false },
    ]
    const fn = alertFilter(filters, false)
    // api+prod matches job=api, web+staging matches env=staging, api+prod matches job=api
    expect(alerts.filter(fn)).toHaveLength(3)
  })
})

describe("alertSort", () => {
  it("sorts critical before warning before info", () => {
    const info = makeAlert({ severity: "info" })
    const critical = makeAlert({ severity: "critical" })
    const warning = makeAlert({ severity: "warning" })
    const sorted = [info, critical, warning].sort(alertSort)
    expect(sorted.map(a => a.labels.severity)).toEqual(["critical", "warning", "info"])
  })

  it("sorts unknown severity after known severities", () => {
    const custom = makeAlert({ severity: "custom" })
    const warning = makeAlert({ severity: "warning" })
    const sorted = [custom, warning].sort(alertSort)
    expect(sorted[0].labels.severity).toBe("warning")
    expect(sorted[1].labels.severity).toBe("custom")
  })
})

describe("safeRegExp", () => {
  it("returns RegExp for valid pattern", () => {
    const result = safeRegExp("foo.*bar")
    expect(result).toBeInstanceOf(RegExp)
    expect(result!.test("fooXbar")).toBe(true)
  })

  it("returns null for invalid pattern", () => {
    const result = safeRegExp("[invalid")
    expect(result).toBeNull()
  })

  it("supports flags parameter", () => {
    const result = safeRegExp("hello", "i")
    expect(result).toBeInstanceOf(RegExp)
    expect(result!.test("HELLO")).toBe(true)
  })
})

describe("escapeRegExp", () => {
  it("escapes special regex characters", () => {
    const result = escapeRegExp("foo.bar+baz?")
    expect(result).toBe("foo\\.bar\\+baz\\?")
    const regex = new RegExp(result)
    expect(regex.test("foo.bar+baz?")).toBe(true)
    expect(regex.test("fooXbarXbazX")).toBe(false)
  })
})
