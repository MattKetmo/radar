"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

type DateTimePickerProps = {
  value: Date | undefined
  onChange: (date: Date) => void
  placeholder?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date and time",
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5)

  function handleDateSelect(selected: Date | undefined) {
    if (!selected) return
    const newDate = new Date(selected)
    newDate.setHours(value?.getHours() ?? 0)
    newDate.setMinutes(value?.getMinutes() ?? 0)
    newDate.setSeconds(0)
    newDate.setMilliseconds(0)
    onChange(newDate)
  }

  function handleTimeChange(type: "hour" | "minute", val: number) {
    const base = value ? new Date(value) : new Date()
    if (type === "hour") base.setHours(val)
    else base.setMinutes(val)
    base.setSeconds(0)
    base.setMilliseconds(0)
    onChange(base)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(value, "dd MMM yyyy, HH:mm")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    variant={
                      value && value.getHours() === hour ? "default" : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("hour", hour)}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {minutes.map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={
                      value && value.getMinutes() === minute
                        ? "default"
                        : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("minute", minute)}
                  >
                    {String(minute).padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
