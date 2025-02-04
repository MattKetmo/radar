import { Group } from "./types"
import { SilenceRow } from "./silence-row";
import { Collapsible, CollapsibleTrigger } from "../ui/collapsible";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SilenceGroupsProps = {
  silenceGroups: Group[]
}

export function SilenceGroups(props: SilenceGroupsProps) {
  const { silenceGroups } = props

  return (
    <>
      {silenceGroups.map(silenceGroup => silenceGroup.silences.length > 0 && (
        <SilenceGroup
          key={silenceGroup.name}
          silenceGroup={silenceGroup}
        />
      ))}
    </>
  )
}

type SilenceGroupProps = {
  silenceGroup: Group
}

function SilenceGroup(props: SilenceGroupProps) {
  const { silenceGroup } = props
  const [open, setOpen] = useState(true)

  return (
    <Collapsible defaultOpen={true} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className="sticky z-10 top-0 bg-accent group cursor-pointer h-[40px] px-6 text-sm flex items-center border-b">
          <SilenceGroupHeader silenceGroup={silenceGroup} open={open} />
        </div>
      </CollapsibleTrigger>
      <div className={cn("overflow-clip transition-all")} style={{
        maxHeight: open ? `${silenceGroup.silences.length * 50}px` : '0',
      }}>
        <ul>
          {silenceGroup.silences.map(silence => (
            <li key={`${silenceGroup.name}-${silence.id}`}>
              <SilenceRow silence={silence} cluster={silenceGroup.name} />
            </li>
          ))}
        </ul>
      </div>
    </Collapsible>
  )
}

type SilenceGroupHeaderProps = {
  silenceGroup: Group
  open: boolean
}

function SilenceGroupHeader(props: SilenceGroupHeaderProps) {
  const { silenceGroup, open } = props

  return (
    <div className="flex space-x-2 items-center w-full">
      <div className="flex items-baseline gap-2 overflow-hidden">
        <span className="text-sm font-mono truncate font-medium group-hover:underline">
          {silenceGroup.name}
        </span>
        <span className="text-xs text-slate-500 bg-secondary rounded-sm p-1 w-6 text-center">
          {silenceGroup.silences.length}
        </span>
      </div>
      <div className="grow" />
      <div>
        <ChevronDown size={16} className={cn('transition-transform', !open ? '-rotate-90' : '')} />
      </div>
    </div>
  )
}
