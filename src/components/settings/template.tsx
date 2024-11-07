'use client'

import { useConfig } from "@/contexts/config"

export function SettginsTemplate() {
  const { config } = useConfig()
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold font-mono">
        config.json
      </h1>
      <pre className="bg-secondary rounded-lg p-4 mt-4">
        {JSON.stringify(config, null, 2)}
      </pre>
    </div>
  )
}
