import { useState } from "react"
import { ChevronDown } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { Alert } from "@/types/alertmanager"
import { AlertRow } from "./alert-row"
import { cn } from "@/lib/utils"
import { Group } from "./types"

type AlertGroupsProps = {
  alertGroups: Group[]
}

export function AlertGroupsSkeleton() {
  return (
    <>
      <div className="sticky z-10 top-0 bg-accent group cursor-pointer h-[40px] px-6 text-sm flex items-center border-b" />
      <div className="border-b h-[45px] flex items-center px-6" />
      <div className="border-b h-[45px] flex items-center px-6" />
    </>
  )
}

export function AlertGroups(props: AlertGroupsProps) {
  const { alertGroups } = props

  if (alertGroups.length === 0) {
    return (
      <div className="text-lg items-center flex flex-col gap-4 text-muted-foreground h-[200px] justify-center border m-10 md:m-20 rounded-lg">
        <p>Nothing to see here.</p>
        <code>{`𐅁(⌐■_■)`}</code>
      </div>
    )
  }
  return (
    <div>
      {alertGroups.map((alertGroup) => (
        <AlertGroup
          key={alertGroup.name}
          alertGroup={alertGroup}
        />
      ))}
    </div>
  )
}

type AlertGroupProps = {
  alertGroup: Group
}

function AlertGroup(props: AlertGroupProps) {
  const { alertGroup } = props
  const { name, alerts } = alertGroup
  const [open, setOpen] = useState(true)

  return (
    <Collapsible defaultOpen={true} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className="sticky z-10 top-0 bg-accent group cursor-pointer h-[40px] px-6 text-sm flex items-center border-b">
          <AlertGroupHeader alertGroup={{ name, alerts }} open={open} />
        </div>
      </CollapsibleTrigger>

      <div className={cn("overflow-clip transition-all")} style={{
        maxHeight: open ? `${alerts.length * 50}px` : '0',
      }}>
        <ul>
          {alerts.map((alert: Alert) => (
            <li
              key={alert.fingerprint}
              className={cn({
                'animate-row-highlight': new Date(alert.startsAt) > new Date(Date.now() - 30 * 60 * 1000)
              })}
            >
              <AlertRow alert={alert} />
            </li>
          ))}
        </ul>
      </div>
    </Collapsible>
  )
}

type AlertGroupHeaderProps = {
  alertGroup: Group
  open: boolean
}

function AlertGroupHeader(props: AlertGroupHeaderProps) {
  const { alertGroup, open } = props
  const { name, alerts } = alertGroup

  return (
    <div className="flex space-x-2 items-center w-full">
      <div className="flex items-baseline gap-2 overflow-hidden">
        <span className="text-sm font-mono truncate font-medium group-hover:underline">
          {name}
        </span>
        <span className="text-xs text-slate-500 bg-secondary rounded-sm p-1 w-6 text-center">
          {alerts.length}
        </span>
      </div>
      <div className="grow" />
      <div>
        <ChevronDown size={16} className={cn('transition-transform', !open ? '-rotate-90' : '')} />
      </div>
    </div>
  )
}
