import { describe, it, expect } from "vitest"

import { AlertSchema, SilenceSchema } from "@/types/alertmanager"
import type { Alert } from "@/types/alertmanager"
import { alertFilter, alertSort, flattenAlerts } from "@/components/alerts/utils"
import type { LabelFilter } from "@/components/alerts/types"
import alertsFixture from "../../../mock/fixtures/alerts.json"
import silencesFixture from "../../../mock/fixtures/silences.json"

describe("fixture validation: alerts", () => {
  it("all fixture alerts pass AlertSchema validation", () => {
    expect(alertsFixture.length).toBe(16)
    for (const alert of alertsFixture) {
      const result = AlertSchema.safeParse(alert)
      if (!result.success) {
        throw new Error(
          `Alert ${alert.fingerprint} failed validation: ${JSON.stringify(result.error.issues)}`
        )
      }
      expect(result.success).toBe(true)
    }
  })

  it("fixture alerts span both prod and staging clusters", () => {
    const clusters = new Set(alertsFixture.map((a) => a.labels["@cluster"]))
    expect(clusters).toEqual(new Set(["prod", "staging"]))
  })

  it("fixture alerts have expected severity distribution", () => {
    const severities = alertsFixture.reduce(
      (acc, a) => {
        const s = a.labels.severity
        acc[s] = (acc[s] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    expect(severities.critical).toBe(4)
    expect(severities.warning).toBe(7)
    expect(severities.info).toBe(2)
    expect(severities.none).toBe(3)
  })
})

describe("fixture validation: silences", () => {
  it("all fixture silences pass SilenceSchema validation", () => {
    expect(silencesFixture.length).toBe(6)
    for (const silence of silencesFixture) {
      const result = SilenceSchema.safeParse(silence)
      if (!result.success) {
        throw new Error(
          `Silence ${silence.id} failed validation: ${JSON.stringify(result.error.issues)}`
        )
      }
      expect(result.success).toBe(true)
    }
  })

  it("fixture silences have expected state distribution", () => {
    const states = silencesFixture.reduce(
      (acc, s) => {
        const state = s.status.state
        acc[state] = (acc[state] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    expect(states.active).toBe(3)
    expect(states.expired).toBe(2)
    expect(states.pending).toBe(1)
  })
})

describe("alertFilter with fixture data", () => {
  const alerts = alertsFixture as unknown as Alert[]

  it("filters alerts by severity=critical", () => {
    const filters: LabelFilter[] = [
      { label: "severity", value: "critical", exclude: false, regex: false },
    ]
    const filtered = alerts.filter(alertFilter(filters))
    expect(filtered).toHaveLength(4)
    expect(filtered.every((a) => a.labels.severity === "critical")).toBe(true)
  })

  it("filters alerts by severity!=critical (exclude)", () => {
    const filters: LabelFilter[] = [
      { label: "severity", value: "critical", exclude: true, regex: false },
    ]
    const filtered = alerts.filter(alertFilter(filters))
    expect(filtered).toHaveLength(12)
    expect(filtered.every((a) => a.labels.severity !== "critical")).toBe(true)
  })

  it("filters alerts by regex match on alertname", () => {
    const filters: LabelFilter[] = [
      { label: "alertname", value: "Kube.*", exclude: false, regex: true },
    ]
    const filtered = alerts.filter(alertFilter(filters))
    expect(filtered).toHaveLength(4)
    expect(filtered.every((a) => a.labels.alertname.startsWith("Kube"))).toBe(true)
  })

  it("filters alerts by regex not-match on severity", () => {
    const filters: LabelFilter[] = [
      { label: "severity", value: "critical|warning", exclude: true, regex: true },
    ]
    const filtered = alerts.filter(alertFilter(filters))
    expect(filtered.every((a) => !["critical", "warning"].includes(a.labels.severity))).toBe(true)
    expect(filtered).toHaveLength(5)
  })

  it("filters with comma-separated values", () => {
    const filters: LabelFilter[] = [
      { label: "severity", value: ["critical", "warning"], exclude: false, regex: false },
    ]
    const filtered = alerts.filter(alertFilter(filters))
    expect(filtered).toHaveLength(11)
    expect(
      filtered.every((a) => ["critical", "warning"].includes(a.labels.severity))
    ).toBe(true)
  })

  it("filters with multiple filters (matchAll=true)", () => {
    const filters: LabelFilter[] = [
      { label: "severity", value: "critical", exclude: false, regex: false },
      { label: "@cluster", value: "prod", exclude: false, regex: false },
    ]
    const filtered = alerts.filter(alertFilter(filters, true))
    expect(filtered).toHaveLength(3)
    expect(
      filtered.every(
        (a) => a.labels.severity === "critical" && a.labels["@cluster"] === "prod"
      )
    ).toBe(true)
  })

  it("returns all alerts with empty filter array", () => {
    const filtered = alerts.filter(alertFilter([]))
    expect(filtered).toHaveLength(16)
  })
})

describe("alertSort with fixture data", () => {
  const alerts = alertsFixture as unknown as Alert[]

  it("sorts alerts by severity: critical before warning before info before none", () => {
    const sorted = [...alerts].sort(alertSort)
    const severities = sorted.map((a) => a.labels.severity)

    const criticalIndices = severities
      .map((s, i) => (s === "critical" ? i : -1))
      .filter((i) => i >= 0)
    const warningIndices = severities
      .map((s, i) => (s === "warning" ? i : -1))
      .filter((i) => i >= 0)
    const infoIndices = severities
      .map((s, i) => (s === "info" ? i : -1))
      .filter((i) => i >= 0)
    const noneIndices = severities
      .map((s, i) => (s === "none" ? i : -1))
      .filter((i) => i >= 0)

    for (const c of criticalIndices) {
      for (const w of warningIndices) {
        expect(c).toBeLessThan(w)
      }
    }
    for (const w of warningIndices) {
      for (const i of infoIndices) {
        expect(w).toBeLessThan(i)
      }
    }
    for (const i of infoIndices) {
      for (const n of noneIndices) {
        expect(i).toBeLessThan(n)
      }
    }
  })

  it("preserves array length after sorting", () => {
    const sorted = [...alerts].sort(alertSort)
    expect(sorted).toHaveLength(alerts.length)
  })
})

describe("flattenAlerts with fixture data", () => {
  it("flattens grouped alerts back to a flat array", () => {
    const alerts = alertsFixture as unknown as Alert[]
    const grouped: Record<string, Alert[]> = {
      prod: alerts.filter((a) => a.labels["@cluster"] === "prod"),
      staging: alerts.filter((a) => a.labels["@cluster"] === "staging"),
    }
    const flattened = flattenAlerts(grouped)
    expect(flattened).toHaveLength(16)
  })
})
