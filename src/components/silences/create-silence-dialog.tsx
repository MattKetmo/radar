'use client'

import { useCallback, useEffect, useMemo, useState } from "react"
import { ChevronRight, LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { useHotkeys } from "react-hotkeys-hook"

import { SilenceCreateSchema } from "@/types/alertmanager"
import type {  MatcherOperator, Silence } from "@/types/alertmanager"
import { useConfig } from "@/contexts/config"
import { useSilences } from "@/contexts/silences"
import { useAlerts } from "@/contexts/alerts"
import { useSilenceDialog } from "@/contexts/silence-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertSeverity } from "@/components/alerts/alert-severity"
import { formatDate } from "@/lib/date"
import { cn } from "@/lib/utils"
import { operatorToMatcher } from "./matcher-utils"
import { MatcherBuilder } from "./matcher-builder"
import { DurationPicker } from "./duration-picker"
import { matchAlerts } from "./utils"

type MatcherRow = {
  name: string
  value: string
  operator: MatcherOperator
}

const LOCAL_STORAGE_AUTHOR_KEY = "radar-silence-author"

export function CreateSilenceDialog() {
  const { config } = useConfig()
  const { refreshSilences } = useSilences()
  const { isOpen, mode, prefillData, prefillClusters, openCreate, close } = useSilenceDialog()
  const { alerts: cachedAlerts } = useAlerts()

  useHotkeys('n', () => openCreate(), { preventDefault: true })


  const [selectedClusters, setSelectedClusters] = useState<string[]>([])
  const [matchers, setMatchers] = useState<MatcherRow[]>([
    { name: "", value: "", operator: "=" },
  ])
  const [startsAt, setStartsAt] = useState(() => new Date())
  const [endsAt, setEndsAt] = useState<Date | null>(null)
  const [author, setAuthor] = useState("")
  const [comment, setComment] = useState("")
  const [silenceId, setSilenceId] = useState<string | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewExpanded, setPreviewExpanded] = useState(false)
  const [clusterFilter, setClusterFilter] = useState("")

  const filteredClusters = useMemo(
    () =>
      [...config.clusters]
        .filter((c) => c.name.toLowerCase().includes(clusterFilter.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [config.clusters, clusterFilter]
  )

  const previewResults = useMemo(() => {
    const validMatchers = matchers.filter((m) => m.name.trim() !== "")
    if (selectedClusters.length === 0 || validMatchers.length === 0) return []
    const mockSilence: Silence = {
      id: "",
      matchers: validMatchers.map((m) => ({
        name: m.name,
        value: m.value,
        ...operatorToMatcher(m.operator),
      })),
      startsAt: "",
      endsAt: "",
      createdBy: "",
      comment: "",
      status: { state: "pending" as const },
    }
    return selectedClusters.map((cluster) => ({
      cluster,
      alerts: matchAlerts(
        mockSilence,
        cachedAlerts[cluster] || []
      ).sort((a, b) => b.startsAt.localeCompare(a.startsAt)),
    }))
  }, [selectedClusters, matchers, cachedAlerts])

  const { labelNames, getValuesForLabel } = useMemo(() => {
    const names = new Set<string>()
    const valuesByName = new Map<string, Set<string>>()

    for (const clusterAlerts of Object.values(cachedAlerts)) {
      for (const alert of clusterAlerts) {
        for (const [name, value] of Object.entries(alert.labels)) {
          if (name.startsWith('@')) continue

          names.add(name)
          if (!valuesByName.has(name)) {
            valuesByName.set(name, new Set<string>())
          }
          valuesByName.get(name)?.add(value)
        }
      }
    }

    return {
      labelNames: [...names].sort((a, b) => a.localeCompare(b)),
      getValuesForLabel: (name: string) =>
        [...(valuesByName.get(name) ?? [])].sort((a, b) => a.localeCompare(b)),
    }
  }, [cachedAlerts])

  const totalMatched = previewResults.reduce((sum, r) => sum + r.alerts.length, 0)

  // Initialize form state when dialog opens
  useEffect(() => {
    if (!isOpen) return
    setClusterFilter("")

    const now = new Date()

    if (prefillData) {
      setSelectedClusters(prefillData.selectedClusters)
      setMatchers(
        prefillData.matchers.length > 0
          ? prefillData.matchers
          : [{ name: "", value: "", operator: "=" as MatcherOperator }]
      )

      setStartsAt(prefillData.startsAt)
      setEndsAt(prefillData.endsAt)

      setAuthor(
        prefillData.author ||
          localStorage.getItem(LOCAL_STORAGE_AUTHOR_KEY) ||
          ""
      )
      setComment(prefillData.comment)
      setSilenceId(prefillData.id)
    } else {
      setSelectedClusters(
        prefillClusters.length > 0
          ? prefillClusters
          : []
      )
      setMatchers([{ name: "", value: "", operator: "=" as MatcherOperator }])
      setStartsAt(now)
      setEndsAt(null)
      setAuthor(localStorage.getItem(LOCAL_STORAGE_AUTHOR_KEY) || "")
      setComment("")
      setSilenceId(undefined)
    }
  }, [isOpen, prefillData, prefillClusters, config.clusters])

  const toggleCluster = useCallback((clusterName: string) => {
    setSelectedClusters((prev) =>
      prev.includes(clusterName)
        ? prev.filter((c) => c !== clusterName)
        : [...prev, clusterName]
    )
  }, [])

  const handleSubmit = useCallback(async () => {
    // Validate: at least one cluster
    if (selectedClusters.length === 0) {
      toast.error("Select at least one cluster")
      return
    }

    // Validate: at least one matcher with non-empty name
    const validMatchers = matchers.filter((m) => m.name.trim() !== "")
    if (validMatchers.length === 0) {
      toast.error("Add at least one matcher with a label name")
      return
    }

    if (!author.trim()) {
      toast.error("Author is required")
      return
    }

    if (!comment.trim()) {
      toast.error("Comment is required")
      return
    }

    if (!endsAt) {
      toast.error("Select a duration")
      return
    }

    // Build payload
    const payload = {
      matchers: validMatchers.map((m) => ({
        name: m.name,
        value: m.value,
        ...operatorToMatcher(m.operator),
      })),
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      createdBy: author.trim(),
      comment: comment.trim(),
      ...(silenceId ? { id: silenceId } : {}),
    }

    // Zod validation
    const parsed = SilenceCreateSchema.safeParse(payload)
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(", ")
      toast.error(`Validation failed: ${issues}`)
      console.error("Silence validation errors:", parsed.error.issues)
      return
    }

    setIsSubmitting(true)

    // Save author to localStorage
    localStorage.setItem(LOCAL_STORAGE_AUTHOR_KEY, author.trim())

    // POST to each selected cluster
    const results: { cluster: string; ok: boolean; error?: string }[] = []

    await Promise.all(
      selectedClusters.map(async (cluster) => {
        try {
          const res = await fetch(`/api/clusters/${cluster}/silences`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsed.data),
          })
          if (!res.ok) {
            const text = await res.text().catch(() => res.statusText)
            results.push({ cluster, ok: false, error: `${res.status} ${text}` })
          } else {
            results.push({ cluster, ok: true })
          }
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : String(error)
          results.push({ cluster, ok: false, error: message })
        }
      })
    )

    const failed = results.filter((r) => !r.ok)
    const succeeded = results.filter((r) => r.ok)

    if (failed.length === 0) {
      toast.success(
        mode === "edit" ? "Silence updated" : "Silence created"
      )
      close()
      await refreshSilences()
    } else if (succeeded.length === 0) {
      toast.error(
        `Failed: ${failed.map((r) => `${r.cluster}: ${r.error}`).join(", ")}`
      )
    } else {
      toast.error(
        `Partial failure: ${results
          .map((r) => `${r.cluster}: ${r.ok ? "OK" : r.error}`)
          .join(", ")}`
      )
      await refreshSilences()
    }

    setIsSubmitting(false)
  }, [
    selectedClusters,
    matchers,
    author,
    comment,
    startsAt,
    endsAt,
    silenceId,
    mode,
    close,
    refreshSilences,
  ])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0 border-b -mx-6 px-6 pb-4">
          <DialogTitle>
            {mode === "edit" ? "Edit Silence" : "Create Silence"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the silence configuration."
              : "Silence alerts matching the specified criteria."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 no-scrollbar -my-4 py-4 -mx-6 max-h-[50vh] overflow-y-auto px-6 flex-1">
          {/* Clusters */}
          <fieldset className="space-y-3">
            <Label asChild>
              <legend>Clusters</legend>
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Filter clusters..."
                value={clusterFilter}
                onChange={(e) => setClusterFilter(e.target.value)}
                className="h-7 flex-1 rounded-md border border-input bg-transparent px-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setSelectedClusters(filteredClusters.map(c => c.name))}
              >
                Select all
              </button>
              <span className="text-xs text-muted-foreground">/</span>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setSelectedClusters([])}
              >
                Deselect all
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {filteredClusters.map((cluster) => (
                <label
                  key={cluster.name}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <Checkbox
                    checked={selectedClusters.includes(cluster.name)}
                    onCheckedChange={() => toggleCluster(cluster.name)}
                    disabled={mode === "edit"}
                  />
                  <span className="text-sm">{cluster.name}</span>
                </label>
              ))}
            </div>
            {selectedClusters.length === 0 && (
              <p className="text-xs text-destructive">
                Select at least one cluster
              </p>
            )}
          </fieldset>

          {/* Matchers */}
          <fieldset className="space-y-3">
            <Label asChild>
              <legend>Matchers</legend>
            </Label>
            <MatcherBuilder
              matchers={matchers}
              onChange={setMatchers}
              labelNames={labelNames}
              getValuesForLabel={getValuesForLabel}
            />
          </fieldset>

          {/* Alert Preview */}
          {totalMatched > 0 && (
            <div className="space-y-2">
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setPreviewExpanded(!previewExpanded)}
              >
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    previewExpanded && "rotate-90"
                  )}
                />
                Matching alerts ({totalMatched})
              </button>
              {previewExpanded && (
                <div className="space-y-3">
                  {previewResults.map((result) => (
                    <div key={result.cluster}>
                      {previewResults.length > 1 && (
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          {result.cluster}
                        </div>
                      )}
                      <div className="space-y-1">
                        {result.alerts.map((alert) => (
                          <div
                            key={`${alert.labels?.alertname}-${alert.fingerprint}`}
                            className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-md text-sm"
                          >
                            <AlertSeverity alert={alert} />
                            <div className="truncate">{alert.labels?.alertname}</div>
                            <div className="grow" />
                            <time
                              className="w-[65px] text-right text-xs shrink-0 text-nowrap text-muted-foreground"
                              dateTime={new Date(alert.startsAt).toISOString()}
                              title={new Date(alert.startsAt).toISOString()}
                            >
                              {formatDate(new Date(alert.startsAt), "en")}
                            </time>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Duration */}
          <fieldset className="space-y-3">
            <DurationPicker
              startsAt={startsAt}
              endsAt={endsAt}
              onEndsAtChange={setEndsAt}
            />
          </fieldset>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="silence-author">Author</Label>
            <Input
              id="silence-author"
              placeholder="your-name@example.com"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="silence-comment">Comment</Label>
            <textarea
              id="silence-comment"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Reason for silencing these alerts..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="bg-muted/50 -mx-6 -mb-6 flex flex-col-reverse gap-2 rounded-b-xl border-t px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !endsAt}
          >
            {isSubmitting && (
              <LoaderCircle className="animate-spin" />
            )}
            {mode === "edit" ? "Update Silence" : "Create Silence"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
