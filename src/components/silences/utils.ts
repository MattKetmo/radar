import { Alert, Silence } from "@/types/alertmanager";
import { safeRegExp } from "@/lib/regexp";

export function matchAlerts(silence: Silence, alerts: Alert[]) {
  return alerts.filter((alert) => {
    return silence.matchers.every((matcher) => {
      const alertLabelValue = alert.labels[matcher.name];
      if (matcher.isRegex) {
        const regex = safeRegExp(matcher.value);
        if (!regex) {
          return matcher.isEqual ? false : true;
        }
        return matcher.isEqual ? regex.test(alertLabelValue) : !regex.test(alertLabelValue);
      } else {
        return matcher.isEqual ? alertLabelValue === matcher.value : alertLabelValue !== matcher.value;
      }
    })
  })
}
