"use client"

import { useState } from "react"
import { addMinutes, format, differenceInMinutes } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { parseDurationInput } from "@/lib/duration-parser"

const PRESETS = [
  { minutes: 15, label: "15m" },
  { minutes: 30, label: "30m" },
  { minutes: 60, label: "1h" },
  { minutes: 120, label: "2h" },
  { minutes: 240, label: "4h" },
  { minutes: 1440, label: "1d" },
] as const

type DurationPickerProps = {
  startsAt: Date
  endsAt: Date | null
  onEndsAtChange: (date: Date | null) => void
}

export function DurationPicker({
  startsAt: _startsAt,
  endsAt,
  onEndsAtChange,
}: DurationPickerProps) {
  const [inputValue, setInputValue] = useState(
    endsAt ? format(endsAt, "yyyy-MM-dd HH:mm") : ""
  )
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5)

  function handlePresetClick(presetMinutes: number) {
    const newDate = addMinutes(new Date(), presetMinutes)
    onEndsAtChange(newDate)
    setInputValue(format(newDate, "yyyy-MM-dd HH:mm"))
  }

  function handleInputChange(value: string) {
    setInputValue(value)
  }

  function handleInputBlur() {
    if (!inputValue.trim()) {
      onEndsAtChange(null)
      return
    }
    const parsed = parseDurationInput(inputValue)
    if (parsed) {
      onEndsAtChange(parsed)
      setInputValue(format(parsed, "yyyy-MM-dd HH:mm"))
    } else if (endsAt) {
      setInputValue(format(endsAt, "yyyy-MM-dd HH:mm"))
    } else {
      setInputValue("")
    }
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleInputBlur()
    }
  }

  function handleCalendarDateSelect(selected: Date | undefined) {
    if (!selected) return
    const newDate = new Date(selected)
    newDate.setHours(endsAt?.getHours() ?? 0)
    newDate.setMinutes(endsAt?.getMinutes() ?? 0)
    newDate.setSeconds(0)
    newDate.setMilliseconds(0)
    onEndsAtChange(newDate)
    setInputValue(format(newDate, "yyyy-MM-dd HH:mm"))
  }

  function handleCalendarTimeChange(type: "hour" | "minute", val: number) {
    const newDate = endsAt ? new Date(endsAt) : new Date()
    if (type === "hour") newDate.setHours(val)
    else newDate.setMinutes(val)
    newDate.setSeconds(0)
    newDate.setMilliseconds(0)
    onEndsAtChange(newDate)
    setInputValue(format(newDate, "yyyy-MM-dd HH:mm"))
  }

  const currentMinutes = endsAt ? differenceInMinutes(endsAt, new Date()) : null
  const isValidPreset = currentMinutes !== null && PRESETS.some((p) => p.minutes === currentMinutes)

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium">Duration</span>

      <div className="relative flex items-center max-w-64">
        <input
          type="text"
          placeholder="e.g. 2h, in 2 days, 30m"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-background pl-3 pr-9 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        />
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="absolute right-2 text-muted-foreground hover:text-foreground"
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="sm:flex">
              <Calendar
                mode="single"
                selected={endsAt ?? undefined}
                onSelect={handleCalendarDateSelect}
                initialFocus
                className="min-w-[17.5rem]"
              />
              <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x">
                <div
                  className="flex sm:flex-col p-2 overflow-x-auto sm:overflow-x-hidden sm:overflow-y-auto sm:h-[300px]"
                  onWheel={(e) => {
                    e.currentTarget.scrollTop += e.deltaY
                    e.stopPropagation()
                  }}
                >
                  {hours.map((hour) => (
                    <Button
                      key={hour}
                      type="button"
                      size="icon"
                      variant={endsAt?.getHours() === hour ? "default" : "ghost"}
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() => handleCalendarTimeChange("hour", hour)}
                    >
                      {hour}
                    </Button>
                  ))}
                </div>
                <div
                  className="flex sm:flex-col p-2 overflow-x-auto sm:overflow-x-hidden sm:overflow-y-auto sm:h-[300px]"
                  onWheel={(e) => {
                    e.currentTarget.scrollTop += e.deltaY
                    e.stopPropagation()
                  }}
                >
                  {minutes.map((minute) => (
                    <Button
                      key={minute}
                      type="button"
                      size="icon"
                      variant={endsAt?.getMinutes() === minute ? "default" : "ghost"}
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() => handleCalendarTimeChange("minute", minute)}
                    >
                      {String(minute).padStart(2, "0")}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(({ minutes: presetMin, label }) => (
          <Button
            key={presetMin}
            type="button"
            variant={isValidPreset && currentMinutes === presetMin ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetClick(presetMin)}
          >
            {label}
          </Button>
        ))}
      </div>

      {endsAt && (
        <p className="text-xs text-muted-foreground">
          Ends at: {format(endsAt, "MMM d, yyyy HH:mm")}
        </p>
      )}
    </div>
  )
}
