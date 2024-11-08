import { cn } from "@/lib/utils"
import { Alert } from "@/types/alertmanager"

export function AlertSeverity({ alert }: { alert: Alert }) {
  const { severity } = alert.labels

  let color = 'bg-black'
  let text = '???'

  switch (severity) {
    case 'critical':
      color = 'bg-red-600'
      text = 'CRIT'
      break
    case 'error':
      color = 'bg-red-500'
      text = 'ERR'
      break
    case 'warning':
      color = 'bg-orange-300 dark:text-black'
      text = 'WARN'
      break
    case 'info':
      color = 'bg-blue-400'
      text = 'INFO'
      break
    case 'none':
      color = 'bg-slate-500'
      text = 'NONE'
      break
  }

  return (
    <div
      title={severity}
      className={cn("text-center text-white text-xs px-1 py-1 rounded-sm shrink-0 font-mono w-12", color)}
    >
      {text}
    </div>
  )
}
