'use client'

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { Config } from '@/config/types'
import Loading from '@/components/layout/loading'

interface ConfigContextProps {
  config: Config
}

const ConfigContext = createContext<ConfigContextProps | undefined>(undefined)

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<Config | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config')
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        setConfig(data)
      } catch (error) {
        console.error('Failed to fetch config:', error)
        setError("Failed to fetch config")
      }
    }

    fetchConfig()
  }, [])

  if (error !== null) {
    return <div>{error}</div>
  }

  if (config === null) {
    return <Loading />
  }

  return (
    <ConfigContext.Provider value={{ config }}>
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
