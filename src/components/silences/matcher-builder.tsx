"use client"

import { Plus, X } from "lucide-react"

import { MatcherOperator } from "@/types/alertmanager"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type MatcherBuilderProps = {
  matchers: Array<{ name: string; value: string; operator: MatcherOperator }>
  onChange: (matchers: Array<{ name: string; value: string; operator: MatcherOperator }>) => void
}

export function MatcherBuilder({ matchers, onChange }: MatcherBuilderProps) {
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
          <Input
            placeholder="label name"
            value={matcher.name}
            onChange={(e) => updateMatcher(i, "name", e.target.value)}
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
          <Input
            placeholder="value"
            value={matcher.value}
            onChange={(e) => updateMatcher(i, "value", e.target.value)}
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
