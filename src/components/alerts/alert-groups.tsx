import { motion, AnimatePresence } from "framer-motion"
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
  selectedAlert: Alert | null,
  setSelectedAlert: (alert: Alert | null) => void
}

export function AlertGroups(props: AlertGroupsProps) {
  const { alertGroups, selectedAlert, setSelectedAlert } = props

  return (
    <div>
      {alertGroups.map((alertGroup) => (
        <AlertGroup
          key={alertGroup.name}
          alertGroup={alertGroup}
          selectedAlert={selectedAlert}
          setSelectedAlert={setSelectedAlert}
        />
      ))}
    </div>
  )
}

type AlertGroupProps = {
  alertGroup: Group
  selectedAlert: Alert | null,
  setSelectedAlert: (alert: Alert | null) => void
}

function AlertGroup(props: AlertGroupProps) {
  const { alertGroup, selectedAlert, setSelectedAlert } = props
  const { name, alerts } = alertGroup
  const [open, setOpen] = useState(true)

  return (
    <Collapsible defaultOpen={true} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className="sticky top-0 bg-accent group cursor-pointer h-[40px] px-6 text-sm flex items-center border-b">
          <AlertGroupHeader alertGroup={{ name, alerts }} open={open} />
        </div>
      </CollapsibleTrigger>

      <div className={cn("overflow-clip transition-all")} style={{
        maxHeight: open ? `${alerts.length * 50}px` : '0',
      }}>
        <ul>
          <AnimatePresence>
            {alerts.map((alert: Alert) => (
              <motion.li
                key={alert.fingerprint}
                onClick={() => setSelectedAlert(alert)}
                initial={{ backgroundColor: 'yellow' }}
                animate={{ backgroundColor: 'transparent' }}
                exit={{ backgroundColor: 'yellow' }}
                transition={{ duration: 1 }}
              >
                <AlertRow alert={alert} isSelected={selectedAlert === alert} />
              </motion.li>
            ))}
          </AnimatePresence>
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
    <div className="flex space-x-2 items-baseline w-full">
      <span className="text-sm font-mono font-medium group-hover:underline">
        {name}
      </span>
      <span className="text-xs text-slate-500">
        {alerts.length}
      </span>
      <div className="grow" />
      <div>
        <ChevronDown size={16} className={cn(
          'transition-transform',
          !open ? '-rotate-90' : '',
        )} />
      </div>
    </div>
  )
}
