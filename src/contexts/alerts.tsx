'use client'

import { createContext, useContext, useMemo } from 'react'
import { z } from 'zod'
import { useConfig } from '@/contexts/config'
import { useClusterData } from '@/hooks/use-cluster-data'
import { Alert, AlertSchema } from '@/types/alertmanager'

interface AlertsContextProps {
  alerts: Record<string, Alert[]>
  errors: Record<string, string>
  loading: boolean
  logoutDetected: boolean
  refreshInterval: number
  setRefreshInterval: (interval: number) => void
  refreshAlerts: () => Promise<void>
}

const AlertsContext = createContext<AlertsContextProps | undefined>(undefined)

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const { config } = useConfig()
  const { data, errors, loading, logoutDetected, refreshInterval, setRefreshInterval, refresh } =
    useClusterData<Alert>('/alerts', z.array(AlertSchema))

  const alerts = useMemo(() => {
    const result: Record<string, Alert[]> = {}
    for (const [clusterName, clusterAlerts] of Object.entries(data)) {
      const cluster = config.clusters.find((c) => c.name === clusterName)
      result[clusterName] = clusterAlerts.map((alert) => ({
        ...alert,
        labels: { '@cluster': clusterName, ...alert.labels, ...(cluster?.labels ?? {}) },
      }))
    }
    return result
  }, [data, config.clusters])

  const value = useMemo(
    () => ({ alerts, errors, loading, logoutDetected, refreshInterval, setRefreshInterval, refreshAlerts: refresh }),
    [alerts, errors, loading, logoutDetected, refreshInterval, setRefreshInterval, refresh]
  )

  return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>
}

export function useAlerts() {
  const ctx = useContext(AlertsContext)
  if (!ctx) throw new Error('useAlerts must be used within AlertsProvider')
  return ctx
}
