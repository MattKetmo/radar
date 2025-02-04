import { Alert, Silence } from "@/types/alertmanager";

export function matchAlerts(silence: Silence, alerts: Alert[]) {
  return alerts.filter((alert) => {
    return silence.matchers.every((matcher) => {
      const alertLabelValue = alert.labels[matcher.name];
      if (matcher.isRegex) {
        const regex = new RegExp(matcher.value);
        return matcher.isEqual ? regex.test(alertLabelValue) : !regex.test(alertLabelValue);
      } else {
        return matcher.isEqual ? alertLabelValue === matcher.value : alertLabelValue !== matcher.value;
      }
    })
  })
}
