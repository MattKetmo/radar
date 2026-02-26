import { describe, it, expect } from "vitest"
import { matchAlerts } from "@/components/silences/utils"
import { Alert, Silence } from "@/types/alertmanager"

const mockAlert = (labels: Record<string, string>): Alert => ({
  labels,
  annotations: {},
  startsAt: "2026-01-01T00:00:00.000Z",
  endsAt: "0001-01-01T00:00:00Z",
  generatorURL: "http://prometheus:9090",
  fingerprint: "test-fingerprint",
  status: {
    inhibitedBy: [],
    silencedBy: [],
    state: "active",
  },
})

const mockSilence = (matchers: Array<{ name: string; value: string; isEqual: boolean; isRegex: boolean }>): Silence => ({
  id: "test-silence-id",
  matchers,
  startsAt: "2026-01-01T00:00:00.000Z",
  endsAt: "2026-01-02T00:00:00.000Z",
  createdBy: "test-user",
  comment: "test silence",
  status: {
    state: "active",
  },
})

describe("matchAlerts", () => {
  describe("= (exact match)", () => {
    it("returns alert when label matches", () => {
      const alerts = [mockAlert({ alertname: "TestAlert" })]
      const silence = mockSilence([{ name: "alertname", value: "TestAlert", isEqual: true, isRegex: false }])
      expect(matchAlerts(silence, alerts)).toEqual(alerts)
    })

    it("returns empty when label doesn't match", () => {
      const alerts = [mockAlert({ alertname: "TestAlert" })]
      const silence = mockSilence([{ name: "alertname", value: "OtherAlert", isEqual: true, isRegex: false }])
      expect(matchAlerts(silence, alerts)).toEqual([])
    })
  })

  describe("!= (not-equal)", () => {
    it("returns alert when label differs", () => {
      const alerts = [mockAlert({ alertname: "TestAlert" })]
      const silence = mockSilence([{ name: "alertname", value: "OtherAlert", isEqual: false, isRegex: false }])
      expect(matchAlerts(silence, alerts)).toEqual(alerts)
    })

    it("returns empty when label equals", () => {
      const alerts = [mockAlert({ alertname: "TestAlert" })]
      const silence = mockSilence([{ name: "alertname", value: "TestAlert", isEqual: false, isRegex: false }])
      expect(matchAlerts(silence, alerts)).toEqual([])
    })
  })

  describe("=~ (regex match)", () => {
    it("returns alert when regex matches", () => {
      const alerts = [mockAlert({ alertname: "KubePodCrashLooping" })]
      const silence = mockSilence([{ name: "alertname", value: "KubePod.*", isEqual: true, isRegex: true }])
      expect(matchAlerts(silence, alerts)).toEqual(alerts)
    })

    it("returns empty when regex doesn't match", () => {
      const alerts = [mockAlert({ alertname: "TestAlert" })]
      const silence = mockSilence([{ name: "alertname", value: "KubePod.*", isEqual: true, isRegex: true }])
      expect(matchAlerts(silence, alerts)).toEqual([])
    })

    it("handles invalid regex gracefully (returns empty)", () => {
      const alerts = [mockAlert({ alertname: "TestAlert" })]
      const silence = mockSilence([{ name: "alertname", value: "[invalid(regex", isEqual: true, isRegex: true }])
      expect(matchAlerts(silence, alerts)).toEqual([])
    })
  })

  describe("!~ (regex not-match)", () => {
    it("returns alert when regex doesn't match", () => {
      const alerts = [mockAlert({ alertname: "TestAlert" })]
      const silence = mockSilence([{ name: "alertname", value: "KubePod.*", isEqual: false, isRegex: true }])
      expect(matchAlerts(silence, alerts)).toEqual(alerts)
    })

    it("returns empty when regex matches", () => {
      const alerts = [mockAlert({ alertname: "KubePodCrashLooping" })]
      const silence = mockSilence([{ name: "alertname", value: "KubePod.*", isEqual: false, isRegex: true }])
      expect(matchAlerts(silence, alerts)).toEqual([])
    })

    it("handles invalid regex gracefully (returns alert)", () => {
      const alerts = [mockAlert({ alertname: "TestAlert" })]
      const silence = mockSilence([{ name: "alertname", value: "[invalid(regex", isEqual: false, isRegex: true }])
      expect(matchAlerts(silence, alerts)).toEqual(alerts)
    })
  })

  describe("multiple matchers (AND logic)", () => {
    it("returns alert when both matchers match", () => {
      const alerts = [mockAlert({ alertname: "TestAlert", severity: "critical" })]
      const silence = mockSilence([
        { name: "alertname", value: "TestAlert", isEqual: true, isRegex: false },
        { name: "severity", value: "critical", isEqual: true, isRegex: false },
      ])
      expect(matchAlerts(silence, alerts)).toEqual(alerts)
    })

    it("returns empty when first matcher doesn't match", () => {
      const alerts = [mockAlert({ alertname: "TestAlert", severity: "critical" })]
      const silence = mockSilence([
        { name: "alertname", value: "OtherAlert", isEqual: true, isRegex: false },
        { name: "severity", value: "critical", isEqual: true, isRegex: false },
      ])
      expect(matchAlerts(silence, alerts)).toEqual([])
    })

    it("returns empty when second matcher doesn't match", () => {
      const alerts = [mockAlert({ alertname: "TestAlert", severity: "critical" })]
      const silence = mockSilence([
        { name: "alertname", value: "TestAlert", isEqual: true, isRegex: false },
        { name: "severity", value: "warning", isEqual: true, isRegex: false },
      ])
      expect(matchAlerts(silence, alerts)).toEqual([])
    })
  })

  describe("missing labels", () => {
    it("returns empty when label is missing with = operator", () => {
      const alerts = [mockAlert({ alertname: "TestAlert" })]
      const silence = mockSilence([{ name: "severity", value: "critical", isEqual: true, isRegex: false }])
      expect(matchAlerts(silence, alerts)).toEqual([])
    })

    it("returns alert when label is missing with != operator", () => {
      const alerts = [mockAlert({ alertname: "TestAlert" })]
      const silence = mockSilence([{ name: "severity", value: "critical", isEqual: false, isRegex: false }])
      expect(matchAlerts(silence, alerts)).toEqual(alerts)
    })
  })

  describe("no matching alerts", () => {
    it("returns empty array when no alerts match", () => {
      const alerts = [
        mockAlert({ alertname: "Alert1" }),
        mockAlert({ alertname: "Alert2" }),
      ]
      const silence = mockSilence([{ name: "alertname", value: "Alert3", isEqual: true, isRegex: false }])
      expect(matchAlerts(silence, alerts)).toEqual([])
    })
  })

  describe("multiple alerts", () => {
    it("returns only matching alerts", () => {
      const alert1 = mockAlert({ alertname: "TestAlert", severity: "critical" })
      const alert2 = mockAlert({ alertname: "TestAlert", severity: "warning" })
      const alert3 = mockAlert({ alertname: "OtherAlert", severity: "critical" })
      const alerts = [alert1, alert2, alert3]
      const silence = mockSilence([{ name: "alertname", value: "TestAlert", isEqual: true, isRegex: false }])
      expect(matchAlerts(silence, alerts)).toEqual([alert1, alert2])
    })
  })
})
