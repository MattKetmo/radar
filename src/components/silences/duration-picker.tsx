"use client"

import { useState } from "react"
import { addMinutes, format, differenceInMinutes } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { parseDurationInput } from "@/lib/duration-parser"

const PRESETS = [
  { minutes: 15, label: "15m" },
  { minutes: 30, label: "30m" },
  { minutes: 60, label: "1h" },
  { minutes: 120, label: "2h" },
  { minutes: 240, label: "4h" },
  { minutes: 480, label: "8h" },
  { minutes: 1440, label: "1d" },
  { minutes: 4320, label: "3d" },
] as const

type DurationPickerProps = {
  startsAt: Date
  endsAt: Date
  onEndsAtChange: (date: Date) => void
}

export function DurationPicker({
  startsAt: _startsAt,
  endsAt,
  onEndsAtChange,
}: DurationPickerProps) {
  const [inputValue, setInputValue] = useState(
    format(endsAt, "dd MMM yyyy, HH:mm")
  )

  function handlePresetClick(minutes: number) {
    const newDate = addMinutes(new Date(), minutes)
    onEndsAtChange(newDate)
    setInputValue(format(newDate, "dd MMM yyyy, HH:mm"))
  }

  function handleInputChange(value: string) {
    setInputValue(value)
  }

  function handleInputBlur() {
    const parsed = parseDurationInput(inputValue)
    if (parsed) {
      onEndsAtChange(parsed)
      setInputValue(format(parsed, "dd MMM yyyy, HH:mm"))
    } else {
      setInputValue(format(endsAt, "dd MMM yyyy, HH:mm"))
    }
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleInputBlur()
    }
  }

  function handleDateTimeChange(date: Date) {
    onEndsAtChange(date)
    setInputValue(format(date, "dd MMM yyyy, HH:mm"))
  }

  const currentMinutes = differenceInMinutes(endsAt, new Date())
  const isValidPreset = PRESETS.some((p) => p.minutes === currentMinutes)

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium">Duration</span>

      <DateTimePicker
        value={endsAt}
        onChange={handleDateTimeChange}
        placeholder="Pick end date and time"
      />

      <input
        type="text"
        placeholder="e.g. 2h, in 2 days, 30m"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
      />

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(({ minutes, label }) => (
          <Button
            key={minutes}
            type="button"
            variant={isValidPreset && differenceInMinutes(endsAt, new Date()) === minutes ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetClick(minutes)}
          >
            {label}
          </Button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Ends at: {format(endsAt, "MMM d, yyyy HH:mm")}
      </p>
    </div>
  )
}
