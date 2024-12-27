'use client'

import { useTheme } from 'next-themes'
import ReactJson from 'react-json-view'
import { useConfig } from "@/contexts/config"
import ThemeSelect from "./theme-select"

export function SettginsTemplate() {
  const { config } = useConfig()
  const { theme } = useTheme()

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
        <div className="mt-4">
          <ReactJson
            src={config}
            name={false}
            quotesOnKeys={false}
            theme={theme === 'dark' ? 'monokai' : 'rjv-default'}
            style={{backgroundColor: 'transparent'}}
            displayDataTypes={false}
            enableClipboard={false}
            shouldCollapse={({ namespace }) => namespace.length > 2}
          />
        </div>
      </section>
    </div>
  )
}

