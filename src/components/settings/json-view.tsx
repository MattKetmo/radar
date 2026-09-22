'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

// Depth at which nested objects/arrays start collapsed.
const COLLAPSE_DEPTH = 2

export function JsonView({ src }: { src: unknown }) {
  return (
    <div className="font-mono text-xs leading-5">
      <JsonNode value={src as Json} depth={0} />
    </div>
  )
}

function JsonNode({ value, depth }: { value: Json, depth: number }) {
  if (value === null || typeof value !== 'object') {
    return <JsonScalar value={value} />
  }

  const entries: [string, Json][] = Array.isArray(value)
    ? value.map((v, i) => [String(i), v])
    : Object.entries(value)

  return <JsonBranch entries={entries} isArray={Array.isArray(value)} depth={depth} />
}

function JsonBranch({ entries, isArray, depth }: {
  entries: [string, Json][]
  isArray: boolean
  depth: number
}) {
  const [collapsed, setCollapsed] = useState(depth >= COLLAPSE_DEPTH)
  const [open, close] = isArray ? ['[', ']'] : ['{', '}']

  if (entries.length === 0) {
    return <span className="text-muted-foreground">{open}{close}</span>
  }

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="text-muted-foreground hover:text-foreground align-middle"
      >
        <ChevronRight className="inline size-3" />
        {open}<span className="px-1">{entries.length} {entries.length > 1 ? 'items' : 'item'}</span>{close}
      </button>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setCollapsed(true)}
        className="text-muted-foreground hover:text-foreground align-middle"
        aria-label="Collapse"
      >
        <ChevronDown className="inline size-3" />
        {open}
      </button>
      <ul className="border-l border-border/60 ml-[5px] pl-3">
        {entries.map(([key, child]) => (
          <li key={key}>
            <span className={cn(isArray ? 'text-muted-foreground' : 'text-sky-700 dark:text-sky-300')}>
              {key}
            </span>
            <span className="text-muted-foreground">: </span>
            <JsonNode value={child} depth={depth + 1} />
          </li>
        ))}
      </ul>
      <span className="text-muted-foreground">{close}</span>
    </>
  )
}

function JsonScalar({ value }: { value: string | number | boolean | null }) {
  if (typeof value === 'string') {
    return <span className="text-emerald-700 dark:text-emerald-400">&quot;{value}&quot;</span>
  }
  if (typeof value === 'number') {
    return <span className="text-violet-700 dark:text-violet-400">{value}</span>
  }
  if (typeof value === 'boolean') {
    return <span className="text-amber-700 dark:text-amber-400">{String(value)}</span>
  }
  return <span className="text-muted-foreground">null</span>
}
