'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { Config } from '@/config/types'

interface ConfigContextProps {
  config: Config
}

const ConfigContext = createContext<ConfigContextProps | undefined>(undefined)

export const ConfigProvider = ({ children, config }: { children: ReactNode, config: Config }) => {
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
