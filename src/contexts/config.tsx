'use client'

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback, useMemo } from 'react'
import { AlertCircle } from 'lucide-react'
import { Config } from '@/config/types'
import { Button } from '@/components/ui/button'
import Loading from '@/components/layout/loading'

interface ConfigContextProps {
  config: Config
}

const ConfigContext = createContext<ConfigContextProps | undefined>(undefined)

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<Config | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchConfig = useCallback(async () => {
    setError(null)
    setConfig(null)

    const maxAttempts = 3
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch('/api/config')
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        setConfig(data)
        return
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`Failed to fetch config (attempt ${attempt}/${maxAttempts}):`, message)
        if (attempt < maxAttempts) {
          const delay = Math.pow(2, attempt - 1) * 1000
          await new Promise((resolve) => setTimeout(resolve, delay))
        } else {
          setError(`Failed to fetch config after ${maxAttempts} attempts: ${message}`)
        }
      }
    }
  }, [])

  const value = useMemo(() => ({ config: config! }), [config])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig, retryCount])

  if (error !== null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-background rounded-lg shadow border p-8 max-w-md w-full text-center space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold">Configuration Error</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => setRetryCount((c) => c + 1)}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (config === null) {
    return <Loading />
  }

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  )
}

export const useConfig = () => {
  const context = useContext(ConfigContext)
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return context
}
