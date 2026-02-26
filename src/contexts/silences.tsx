'use client'

import { createContext, useContext, useMemo } from 'react'
import { z } from 'zod'
import { useClusterData } from '@/hooks/use-cluster-data'
import { Silence, SilenceSchema } from '@/types/alertmanager'

type SilencesContextType = {
  silences: Record<string, Silence[]>
  errors: Record<string, string>
  loading: boolean
  logoutDetected: boolean
  refreshInterval: number
  setRefreshInterval: (interval: number) => void
  refreshSilences: () => Promise<void>
}

const SilencesContext = createContext<SilencesContextType | undefined>(undefined)

export function SilencesProvider({ children }: { children: React.ReactNode }) {
  const { data: silences, errors, loading, logoutDetected, refreshInterval, setRefreshInterval, refresh } =
    useClusterData<Silence>('/silences', z.array(SilenceSchema))

  const value = useMemo(
    () => ({ silences, errors, loading, logoutDetected, refreshInterval, setRefreshInterval, refreshSilences: refresh }),
    [silences, errors, loading, logoutDetected, refreshInterval, setRefreshInterval, refresh]
  )

  return <SilencesContext.Provider value={value}>{children}</SilencesContext.Provider>
}

export function useSilences() {
  const ctx = useContext(SilencesContext)
  if (!ctx) throw new Error('useSilences must be used within SilencesProvider')
  return ctx
}
