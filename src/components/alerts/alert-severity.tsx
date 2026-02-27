import { cn } from "@/lib/utils"
import { Alert } from "@/types/alertmanager"

type SeverityConfig = {
  bgClass: string
  text: string
  darkText?: string
}

const severityMap: Record<string, SeverityConfig> = {
  critical: { bgClass: "bg-severity-critical", text: "CRIT" },
  error:    { bgClass: "bg-severity-error",    text: "ERR"  },
  warning:  { bgClass: "bg-severity-warning",  text: "WARN", darkText: "text-black dark:text-black" },
  info:     { bgClass: "bg-severity-info",      text: "INFO" },
  none:     { bgClass: "bg-severity-none",      text: "NONE" },
}

const fallback: SeverityConfig = { bgClass: "bg-foreground", text: "???" }

export function AlertSeverity({ alert }: { alert: Alert }) {
  const { severity } = alert.labels
  const { bgClass, text, darkText } = severityMap[severity] ?? fallback

  return (
    <div
      title={severity}
      aria-label={`Severity: ${severity}`}
      className={cn(
        "text-center text-white text-xs px-1 py-1 rounded-sm shrink-0 font-mono w-12",
        bgClass,
        darkText
      )}
    >
      {text}
    </div>
  )
}
