'use client'

import { useConfig } from "@/contexts/config"
import ThemeSelect from "./theme-select"

export function SettginsTemplate() {
  const { config } = useConfig()
  return (
    <div className="p-4 max-w-3xl mx-auto gap-8 flex flex-col">
      <div className="border-b">
        <h1 className="text-2xl py-4 font-semibold">
          Settings
        </h1>
      </div>

      <section className="border-b">
        <h2 className="text-xl">
          Appearance
        </h2>
        <div className="mt-4">
          <fieldset className="py-4">
            <legend className="text-sm font-medium leading-none text-foreground">
              Interface theme
            </legend>
            <ThemeSelect />
          </fieldset>
        </div>
      </section>

      <section>
        <h2 className="text-xl">
          Configuration
        </h2>
        <pre className="bg-accent rounded-lg p-4 mt-4 grow text-sm">
          {JSON.stringify(config, null, 2)}
        </pre>
      </section>
    </div>
  )
}

