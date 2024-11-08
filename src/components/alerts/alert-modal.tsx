import { useMemo, useState } from "react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Alert } from "@/types/alertmanager"
import { Check, ClipboardCopy, Square, SquareArrowOutUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { AlertSeverity } from "./alert-severity"

function isURL(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

type Props = {
  alert: Alert | null
  setSelectedAlert: (alert: Alert | null) => void
  close: () => void
}

export function AlertModal(props: Props) {
  const { alert, close } = props
  const { summary } = alert?.annotations || {}

  return (
    <Sheet open={!!alert} onOpenChange={close}>
      {/* <SheetTrigger>Open</SheetTrigger> */}
      <SheetContent>
        <div className="flex flex-col h-screen">
          <SheetHeader className="shrink-0">
            <SheetTitle className="flex gap-2 items-center">
              {alert && <AlertSeverity alert={alert} />}
              {alert?.labels.alertname}
            </SheetTitle>
            <SheetDescription>{summary}</SheetDescription>
          </SheetHeader>

          <div className="overflow-auto pb-10">
            {
              alert && (
                <>
                  <div className="mt-4">
                    <AlertDescription alert={alert} />
                  </div>

                  <div className="mt-4">
                    <AlertAnnotations alert={alert} />
                  </div>

                  <div className="mt-6">
                    <AlertLabels alert={alert} />
                  </div>

                  <div className="mt-8">
                    <AlertQuery alert={alert} />
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



function AlertDescription(props: { alert: Alert }) {
  const { alert } = props

  if (!alert.annotations.description) return null

  return (
    <div className="bg-secondary p-4 rounded-lg">
      {alert.annotations.description}
    </div>
  )
}

function AlertAnnotations(props: { alert: Alert }) {
  const { alert } = props
  const { summary, description, ...annotations } = alert.annotations

  return (
    <div className="flex flex-col gap-2">
      {Object.entries(annotations).map(([key, value]) => (
        <div key={key} className="flex flex-col text-sm">
          {isURL(value) ? (
            <a href={value} target="_blank" className="group shrink-0 gap-2 font-semibold font-mono text-blue-500 items-center flex">
              <span className="group-hover:underline underline-offset-4">{key}</span>
              <SquareArrowOutUpRight size={12} />
            </a>
          ) : (
            <>
              <div className="shrink-0 w-[100px] font-semibold font-mono">{key}</div>
              <div>{value}</div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

function AlertLabels(props: { alert: Alert }) {
  const { alert } = props
  const [expanded, setExpanded] = useState(false)

  const selectElement = (e: React.MouseEvent<HTMLSpanElement>) => {
    const range = document.createRange();
    range.selectNodeContents(e.currentTarget);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  return (
    <div>
      <h3 className="text-sm font-medium flex item-center gap-2">
        Labels
        <button className="text-xs text-blue-500 focus:outline-0" onClick={() => setExpanded(e => !e)}>
          {expanded ? 'show less' : 'show all'}
        </button>
      </h3>
      <div className={cn("text-sm mt-1 flex gap-2", expanded ? 'flex-col' : 'flex-wrap')}>
        {Object.entries(alert.labels).map(([key, value]) => (
          <span key={key} className="truncate inline-flex gap-1 items-center  leading-tight">
            <span className="bg-secondary px-1">
              <span onDoubleClick={selectElement} className="font-semibold font-mono">{key}</span>{': '}
              <span onDoubleClick={selectElement}>{value}</span>
            </span>
          </span>
        ))}
      </div>
    </div >
  )
}

function AlertQuery(props: { alert: Alert }) {
  const { alert } = props
  const [copied, setCopied] = useState(false)
  const query = useMemo(() => {
    if (!alert?.generatorURL) return null
    const url = new URL(alert.generatorURL)
    const g0Expr = url.searchParams.get("g0.expr")
    return g0Expr ? decodeURIComponent(g0Expr) : null
  }, [alert])

  if (!query) return null

  return (
    <div className="bg-accent p-4 rounded-sm">
      <div className="flex items-center text-xs">
        <div className="grow ">
          PromQL
        </div>
        <button
          className={cn("shrink-0 flex items-center gap-1", copied ? "text-green-500" : "hover:text-blue-500")}
          onClick={() => {
            navigator.clipboard.writeText(query)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
        >
          {copied ? <Check size={12} /> : <ClipboardCopy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="whitespace-pre-wrap overflow-auto mt-2">
        {query}
      </pre>
    </div>
  )
}
