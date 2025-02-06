import Link from "next/link"
import { useRouter } from "next/navigation"
import { Alert } from "@/types/alertmanager"
import { formatDate } from "@/lib/date"
import { stringToColor } from "./utils"
import { AlertSeverity } from "./alert-severity"
import { BellOff, MegaphoneOff } from "lucide-react"
import { cn } from "@/lib/utils"

const importantLabels = [
  'host',
  'ingress',
  'status',
  'claim_namespace',
  'exported_service',
  'exported_namespace',
  'namespace',
  'persistentvolumeclaim',
  'name',
  'job',
  'pod',
]

type Props = {
  alert: Alert
}

function paramsWithAlert(id: string) {
  const params = new URLSearchParams(window.location.search)
  params.set('alert', id)
  return params.toString()
}

export function AlertRow(props: Props) {
  const { alert } = props

  return (
    <Link
      href={`?${paramsWithAlert(alert.fingerprint)}`}
      className="flex gap-2 xl:gap-4 items-center px-6 relative h-[45px] border-b group cursor-pointer"
    >
      <AlertSeverity alert={alert} />
      <AlertState alert={alert} />
      <AlertTitle alert={alert} />
      <AlertSummary alert={alert} />
      <div className="grow" />
      <AlertLabels alert={alert} />
      <AlertTime alert={alert} />
    </Link>
  )
}

function AlertState({ alert }: { alert: Alert }) {
  if (alert.status.state === 'active') {
    return null
  }

  return (
    <div title="Alert silenced" className="shrink-0">
      <BellOff size={12} className="xl:-mr-2" />
    </div>
  )
}

function AlertTitle({ alert }: { alert: Alert }) {
  const { alertname } = alert.labels

  return (
    <div className="text-sm font-medium truncate group-hover:text-blue-500 dark:group-hover:text-blue-300">
      {alertname}
    </div>
  )
}

function AlertSummary({ alert }: { alert: Alert }) {
  const { summary } = alert.annotations

  return (
    <div className="text-xs text-muted-foreground truncate hidden md:block">
      {summary}
    </div>
  )
}

function AlertLabels({ alert }: { alert: Alert }) {
  const labels = Object.entries(alert.labels).map(([key, value]) => {
    return { key: key, value: value }
  }).filter((label) => importantLabels.indexOf(label.key) !== -1).sort((a, b) => {
    const indexA = importantLabels.indexOf(a.key);
    const indexB = importantLabels.indexOf(b.key);
    if (indexA === -1 && indexB === -1) {
      return a.key.localeCompare(b.key);
    }
    if (indexA === -1) {
      return 1;
    }
    if (indexB === -1) {
      return -1;
    }
    return indexA - indexB;
  })

  return (
    <div className="shrink truncate relative -mr-[0.2rem] hidden sm:block sm:max-w-[45%] md:max-w-auto">
      {/* {labels.length > 2 && (
        <div className="absolute top-0 right-0 bottom-0 w-[30px] bg-gradient-to-r from-transparent to-background" />
      )} */}
      <ul className="flex items-center gap-1">
        {labels.map(({ key, value }) => (
          <li key={key}>
            <button
              title={`${key}: ${value}`}
              className="text-xs bg-secondary px-2 py-1 items-center rounded-sm gap-1 flex hover:border-primary"
            // className="text-xs border px-2  items-center rounded-full gap-2 flex hover:border-primary"
            >
              {/* {key === 'namespace' && (
                <span className="h-2 w-2 block rounded-full" style={{backgroundColor: stringToColor(value)}}/>
              )} */}
              <div className="shrink-0 truncate text-primary max-w-[230px]">
                <span className="font-medium">
                  {key}{': '}
                </span>
                <span className="">
                  {value}
                </span>
              </div>
            </button>
          </li>
        ))}
        {/* <li>
          <span className="text-xs border px-2 py-1 rounded-full flex gap-1 hover:border-primary">
            +1
          </span>
        </li> */}
      </ul>
    </div>
  )
}

function AlertTime({ alert }: { alert: Alert }) {
  const time = new Date(alert.startsAt)

  return (
    <time
      className="w-[65px] text-right text-xs shrink-0 text-nowrap"
      dateTime={time.toISOString()}
      title={time.toISOString()}
    >
      {formatDate(time, 'en')}
    </time>
  )
}
