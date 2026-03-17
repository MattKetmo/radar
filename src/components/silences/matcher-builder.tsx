"use client"

import { Plus, X } from "lucide-react"

import { MatcherOperator } from "@/types/alertmanager"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { AutocompleteInput } from "./autocomplete-input"

type MatcherBuilderProps = {
  matchers: Array<{ name: string; value: string; operator: MatcherOperator }>
  onChange: (matchers: Array<{ name: string; value: string; operator: MatcherOperator }>) => void
  labelNames?: string[]
  getValuesForLabel?: (name: string) => string[]
}

export function MatcherBuilder({
  matchers,
  onChange,
  labelNames,
  getValuesForLabel,
}: MatcherBuilderProps) {
  const updateMatcher = (
    index: number,
    field: "name" | "value" | "operator",
    val: string,
  ) => {
    const updated = matchers.map((m, i) =>
      i === index ? { ...m, [field]: val } : m,
    )
    onChange(updated)
  }

  const addMatcher = () => {
    onChange([...matchers, { name: "", value: "", operator: "=" }])
  }

  const removeMatcher = (index: number) => {
    onChange(matchers.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      {matchers.map((matcher, i) => (
        <div key={i} className="flex items-center gap-2">
          <AutocompleteInput
            placeholder="label name"
            value={matcher.name}
            onChange={(val) => updateMatcher(i, "name", val)}
            suggestions={labelNames ?? []}
            className="flex-1"
          />
          <Select
            value={matcher.operator}
            onValueChange={(val) => updateMatcher(i, "operator", val as MatcherOperator)}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="=">=</SelectItem>
              <SelectItem value="!=">!=</SelectItem>
              <SelectItem value="=~">=~</SelectItem>
              <SelectItem value="!~">!~</SelectItem>
            </SelectContent>
          </Select>
          <AutocompleteInput
            placeholder="value"
            value={matcher.value}
            onChange={(val) => updateMatcher(i, "value", val)}
            suggestions={getValuesForLabel?.(matcher.name) ?? []}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeMatcher(i)}
            disabled={matchers.length <= 1}
            className={cn(
              "shrink-0",
              matchers.length <= 1 && "opacity-0 pointer-events-none",
            )}
          >
            <X size={14} />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addMatcher}
        className="w-fit"
      >
        <Plus size={14} />
        Add matcher
      </Button>
    </div>
  )
}
