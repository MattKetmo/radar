"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

type AutocompleteInputProps = {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
  className?: string
}

export function AutocompleteInput({
  value,
  onChange,
  suggestions,
  placeholder,
  className,
}: AutocompleteInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const listId = useId()
  const optionRefs = useRef<Array<HTMLDivElement | null>>([])

  const filteredSuggestions = useMemo(() => {
    const query = value.trim().toLowerCase()
    if (!query) return suggestions
    return suggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(query)
    )
  }, [suggestions, value])

  useEffect(() => {
    if (!isFocused) {
      setIsOpen(false)
      return
    }

    setIsOpen(filteredSuggestions.length > 0)
  }, [filteredSuggestions.length, isFocused])

  useEffect(() => {
    if (!isOpen) return

    const highlightedElement = optionRefs.current[highlightedIndex]
    highlightedElement?.scrollIntoView({ block: "nearest" })
  }, [highlightedIndex, isOpen])

  return (
    <PopoverPrimitive.Root open={isOpen}>
      <PopoverPrimitive.Anchor asChild>
        <input
          value={value}
          placeholder={placeholder}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-activedescendant={
            isOpen && filteredSuggestions[highlightedIndex]
              ? `${listId}-option-${highlightedIndex}`
              : undefined
          }
          onChange={(e) => {
            onChange(e.target.value)
            setHighlightedIndex(0)
          }}
          onFocus={() => {
            setIsFocused(true)
            setHighlightedIndex(0)
          }}
          onBlur={() => {
            setIsFocused(false)
            setIsOpen(false)
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Tab") {
              setIsOpen(false)
              return
            }

            if (e.key === "ArrowDown") {
              if (!isOpen) {
                setIsOpen(filteredSuggestions.length > 0)
              }

              e.preventDefault()
              setHighlightedIndex((prev) =>
                filteredSuggestions.length === 0
                  ? 0
                  : (prev + 1) % filteredSuggestions.length
              )
              return
            }

            if (e.key === "ArrowUp") {
              if (!isOpen) {
                setIsOpen(filteredSuggestions.length > 0)
              }

              e.preventDefault()
              setHighlightedIndex((prev) =>
                filteredSuggestions.length === 0
                  ? 0
                  : (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length
              )
              return
            }

            if (e.key === "Enter" && isOpen) {
              e.preventDefault()
              const highlightedSuggestion = filteredSuggestions[highlightedIndex]
              if (highlightedSuggestion) {
                onChange(highlightedSuggestion)
                setIsOpen(false)
              }
            }
          }}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        />
      </PopoverPrimitive.Anchor>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={() => setIsOpen(false)}
          className="z-50 w-[var(--radix-popper-anchor-width)] rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <Command shouldFilter={false}>
            <CommandList className="max-h-[200px] overflow-y-auto">
              <CommandEmpty className="hidden" />
              <CommandGroup id={listId}>
                {filteredSuggestions.map((suggestion, index) => (
                  <CommandItem
                    ref={(el) => {
                      optionRefs.current[index] = el
                    }}
                    key={suggestion}
                    id={`${listId}-option-${index}`}
                    role="option"
                    aria-selected={highlightedIndex === index}
                    value={suggestion}
                    className={cn(
                      "cursor-default text-sm",
                      highlightedIndex === index && "bg-accent text-accent-foreground"
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onSelect={() => {
                      onChange(suggestion)
                      setIsOpen(false)
                    }}
                  >
                    <span className="truncate">{suggestion}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>

      {!isOpen && (
        <Command className="hidden" shouldFilter={false}>
          <CommandList aria-hidden />
        </Command>
      )}
    </PopoverPrimitive.Root>
  )
}
