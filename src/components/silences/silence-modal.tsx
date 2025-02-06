import Link from "next/link"
import { useQueryState } from "nuqs"
import { formatDistanceToNowStrict } from "date-fns"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Alert, Silence } from "@/types/alertmanager"
import { useAlerts } from "@/contexts/alerts"
import { AlertSeverity } from "@/components/alerts/alert-severity"
import { formatDate } from "@/lib/date"
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"
import { ArrowRightFromLine } from "lucide-react"
import { matchAlerts } from "./utils"

type Props = {
  silence: Silence | null
  cluster: string | null
}

function calculateProgress(startsAt: string, endsAt: string): number {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  return ((now - start) / (end - start)) * 100;
}

function progressColor(progress: number): string {
  if (progress <= 50) return 'bg-green-600';
  if (progress > 50 && progress <= 70) return 'bg-blue-600';
  if (progress > 70 && progress <= 90) return 'bg-orange-600';
  if (progress > 90) return 'bg-red-600';
  return '';
}

export function SilenceModal(props: Props) {
  const { cluster, silence } = props
  const { alerts } = useAlerts()
  const [selectedSilenceId, setSelectedSilenceId] = useQueryState('silence', { defaultValue: '' })

  const matchedAlerts = silence ? matchAlerts(silence, alerts[cluster ?? '']) : []
  const progress = silence ? calculateProgress(silence.startsAt, silence.endsAt) : 0;

  return (
    <Sheet open={!!selectedSilenceId} onOpenChange={() => setSelectedSilenceId(null)}>
      {/* <SheetTrigger>Open</SheetTrigger> */}
      <SheetContent className="w-screen">
        <div className="flex flex-col h-screen">
          <SheetHeader className="shrink-0">
            <SheetTitle className="flex items-baseline gap-2">
              <span>Silence</span>
              <span className="font-mono font-medium text-sm">{silence?.id}</span>
            </SheetTitle>
            {/* <SheetDescription className="text-left">
              {silence?.comment}
            </SheetDescription> */}
          </SheetHeader>

          <div className="overflow-auto pb-10">
            {
              silence && (
                <>
                  <div className="bg-secondary p-4 rounded-lg mt-4 truncate overflow-clip">
                    {silence?.comment}
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                      <div
                        className={cn("h-full rounded-full", progressColor(progress))}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {/*<div className="text-sm">
                      <strong>ID:</strong> {silence.id}
                    </div>*/}
                    <div className="flex">
                      <time
                        className="text-sm block grow"
                        dateTime={silence.startsAt}
                        title={silence.startsAt}
                      >
                        Started <span className="font-semibold">{formatDistanceToNowStrict(new Date(silence.startsAt), { addSuffix: true })}</span>
                      </time>
                      <time
                        className="text-sm block"
                        dateTime={silence.endsAt}
                        title={silence.endsAt}
                      >
                        Expires in <span className="font-semibold">{formatDistanceToNowStrict(new Date(silence.endsAt), {})}</span>
                      </time>
                    </div>
                  </div>

                  <div className="mt-6">
                    <SilenceMatchers silence={silence} />
                  </div>

                  <div className="mt-6">
                    <SilenceMatchedAlerts alerts={matchedAlerts} />
                  </div>
                </>
              )
            }
          </div>
        </div>
      </SheetContent>
    </Sheet >
  )
}

type SilenceMatcherProps = {
  silence: Silence
}

function SilenceMatchers({ silence }: SilenceMatcherProps) {
  return (
    <div>
      <h3 className="text-sm font-medium flex item-center gap-2">
        Condition
      </h3>
      <div className="text-sm mt-2 flex gap-2 flex-col">
        {silence.matchers.map((matcher, i) => (
          <span key={i} className="truncate inline-flex gap-1 items-center leading-tight">
            <span className="text-sm bg-secondary px-3 py-1 items-center rounded-sm flex hover:border-primary">
              <strong className="font-semibold">{matcher.name}</strong>
              <span>{matcherOperator(matcher.isEqual, matcher.isRegex)}</span>
              <span>"{matcher.value}"</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

function matcherOperator(isEqual: boolean, isRegex: boolean) {
  return isRegex ? (isEqual ? '=~' : '!~') : (isEqual ? '=' : '!=');
}

function SilenceMatchedAlerts({ alerts }: { alerts: Alert[] }) {
  return (
    <div>
      <h3 className="text-sm font-medium flex item-center gap-2">
        Matched alerts
      </h3>
      <div className="text-sm mt-2 flex gap-2 flex-col">
        {alerts.length === 0 && (
          <div className="text-sm text-gray-500">No alerts matched</div>
        )}
        {alerts.map((alert) => (
          <SilenceMatchedAlert key={alert.fingerprint} alert={alert} />
        ))}
      </div>
    </div>
  )
}

function SilenceMatchedAlert({ alert }: { alert: Alert }) {
  const [open, setOpen] = useState(false)

  return (
    // <Link href={`/alerts?alert=${alert.fingerprint}`}>
    <div className="bg-secondary px-3 py-2 rounded-md items-center gap-2 hover:border-primary cursor-pointer">
      <Collapsible defaultOpen={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-2 w-full">
            <AlertSeverity alert={alert} />
            <div>{alert.labels?.alertname}</div>
            <div className="grow" />
            <time
              className="w-[65px] text-right text-xs shrink-0 text-nowrap"
              dateTime={new Date(alert.startsAt).toISOString()}
              title={new Date(alert.startsAt).toISOString()}
            >
              {formatDate(new Date(alert.startsAt), 'en')}
            </time>
          </div>
        </CollapsibleTrigger>

        <div className={cn("overflow-clip transition-all")} style={{
          maxHeight: open ? `${Object.keys(alert.labels).length * 50}px` : '0',
        }}>
          <div className="pt-2">
            <strong>Description</strong>
            <div className="text-sm">{alert.annotations?.description}</div>
          </div>
          <div className="pt-2">
            <strong>Labels</strong>
            <ul>
              {Object.entries(alert.labels).map(([key, value]) => (
                <li key={key} className="text-sm">
                  <strong className="font-semibold font-mono">{key}</strong>: {value}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2">
            <Link className="hover:text-blue-700 text-blue-500 flex gap-2 items-center" href={`/alerts?alert=${alert.fingerprint}`}>
              <span>View alert</span>
              <ArrowRightFromLine size={14} />
            </Link>
          </div>
        </div>
      </Collapsible>
    </div>
  )
}
