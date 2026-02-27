"use client"

import { useState } from "react"
import { addMinutes, format, differenceInMinutes } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const PRESETS = [
  { minutes: 30, label: "30m" },
  { minutes: 60, label: "1h" },
  { minutes: 120, label: "2h" },
  { minutes: 240, label: "4h" },
  { minutes: 480, label: "8h" },
  { minutes: 1440, label: "1d" },
] as const

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

type DurationPickerProps = {
  startsAt: Date
  endsAt: Date
  onStartsAtChange: (date: Date) => void
  onEndsAtChange: (date: Date) => void
}

export function DurationPicker({
  startsAt,
  endsAt,
  onStartsAtChange,
  onEndsAtChange,
}: DurationPickerProps) {
  const [mode, setMode] = useState<"preset" | "custom">("preset")

  const currentPreset = differenceInMinutes(endsAt, startsAt)
  const isValidPreset = PRESETS.some((p) => p.minutes === currentPreset)

  function handlePresetChange(value: string) {
    if (!value) return
    const minutes = Number(value)
    onEndsAtChange(addMinutes(startsAt, minutes))
  }

  const durationMinutes = differenceInMinutes(endsAt, startsAt)
  const isEndBeforeStart = durationMinutes <= 0

  if (mode === "custom") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Duration</span>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setMode("preset")}
          >
            Presets
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Start</label>
            <input
              type="datetime-local"
              value={format(startsAt, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => onStartsAtChange(new Date(e.target.value))}
              className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">End</label>
            <input
              type="datetime-local"
              value={format(endsAt, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => onEndsAtChange(new Date(e.target.value))}
              className={cn(
                "flex h-9 w-full rounded-md border bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isEndBeforeStart
                  ? "border-destructive"
                  : "border-input",
              )}
            />
          </div>
        </div>

        {isEndBeforeStart ? (
          <p className="text-xs text-destructive">
            End time must be after start time
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Duration: {formatDuration(durationMinutes)}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Duration</span>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => setMode("custom")}
        >
          Custom
        </Button>
      </div>

      <ToggleGroup
        type="single"
        value={isValidPreset ? String(currentPreset) : ""}
        onValueChange={handlePresetChange}
        className="justify-start"
      >
        {PRESETS.map(({ minutes, label }) => (
          <ToggleGroupItem
            key={minutes}
            value={String(minutes)}
            size="sm"
          >
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <p className="text-xs text-muted-foreground">
        Ends at: {format(endsAt, "MMM d, yyyy HH:mm")}
      </p>
    </div>
  )
}
