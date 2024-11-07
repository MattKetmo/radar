import { Alert } from "@/types/alertmanager"
import { LabelFilter } from "./types"

const showOnlyActive = true

export function flattenAlerts(alerts: Record<string, Alert[]>): Alert[] {
  return Object.values(alerts).reduce((acc, val) => acc.concat(val), [])
}

export function alertFilter(filters: LabelFilter[]): (alert: Alert) => boolean {
  return (alert: Alert) => {
    return filters.map(filter => {
      if (showOnlyActive && alert.status.state !== 'active') {
        return false
      }
      const value = alert.labels[filter.label]
      if (filter.value.length === 0) {
        return true
      }
      if (filter.regex) {
        const regex = new RegExp(Array.isArray(filter.value) ? filter.value.join('|') : filter.value)
        if (filter.exclude) {
          return !regex.test(value)
        }
        return regex.test(value)
      } else {
        if (filter.exclude) {
          return !filter.value.includes(value)
        }
        return filter.value.includes(value)
      }
    }).every(Boolean)
  }
}

export function alertSort(a: Alert, b: Alert) {
  const severityOrder = {
    critical: 1,
    error: 2,
    warning: 3,
    info: 4,
    none: 5,
    default: 6,
  }

  const severityA = severityOrder[a.labels.severity as keyof typeof severityOrder] || severityOrder.default
  const severityB = severityOrder[b.labels.severity as keyof typeof severityOrder] || severityOrder.default

  if (severityA === severityB) {
    // if (a.labels.alertname === b.labels.alertname) {
    return new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
    // }
    // return a.labels.alertname.localeCompare(b.labels.alertname)
  }

  return severityA - severityB
}

export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}
