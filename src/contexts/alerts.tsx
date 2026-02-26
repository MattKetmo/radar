'use client'

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Alert, AlertSchema } from '@/types/alertmanager'
import { ClusterConfig } from '@/config/types'
import { useConfig } from '@/contexts/config'
import { z } from 'zod'

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

export const AlertsProvider = ({ children }: { children: ReactNode }) => {
  const { config } = useConfig()
  const { clusters } = config

  const [loading, setLoading] = useState(false)
  const [logoutDetected, setLogoutDetected] = useState(false)
  const [alerts, setAlerts] = useState<Record<string, Alert[]>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [refreshInterval, setRefreshInterval] = useState<number>(30)
  const failCount = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchAlertsForCluster = async (cluster: ClusterConfig, signal: AbortSignal): Promise<boolean> => {
    try {
      // Fetch alerts for this cluster
      const response = await fetch(`/api/clusters/${cluster.name}/alerts`, { redirect: 'manual', signal })
      if (response.type === 'opaqueredirect') {
        setLogoutDetected(true)
        throw new Error(`redirection not allowed`)
      }
      if (!response.ok) {
        throw new Error(`failed to fetch alerts`)
      }
      const data = await response.json()

      // Validate the response data
      const parsedData = z.array(AlertSchema).safeParse(data)
      if (!parsedData.success) {
        console.error(`invalid alert format`, parsedData.error.issues)
        throw new Error(`invalid alert format`)
      }

      // Add extra labels to each alert (immutable transform)
      const enrichedAlerts = parsedData.data.map(alert => ({
        ...alert,
        labels: {
          '@cluster': cluster.name,
          ...alert.labels,
          ...cluster.labels,
        },
      }))

      // Update alerts for this cluster
      setAlerts(prev => ({
        ...prev,
        [cluster.name]: enrichedAlerts
      }))

      // Clear any previous errors
      setErrors(prev => {
        const { [cluster.name]: _, ...rest } = prev
        return rest
      })

      return true
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return true

      let message = 'Unknown Error'
      if (error instanceof Error) message = error.message

      // Update errors for this cluster
      setErrors(prev => ({
        ...prev,
        [cluster.name]: message
      }))

      return false
    }
  }

  // Fetch alerts for all clusters
  const refreshAlerts = useCallback(async () => {
    if (clusters.length === 0) return

    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    const results = await Promise.all(clusters.map(cluster => fetchAlertsForCluster(cluster, controller.signal)))
    setLoading(false)

    if (controller.signal.aborted) return

    if (results.every(Boolean)) {
      failCount.current = 0
    } else {
      failCount.current++
    }
  }, [clusters])

  // Refresh alerts on an interval
  useEffect(() => {
    if (refreshInterval === 0) return

    let timeoutId: ReturnType<typeof setTimeout>
    let cancelled = false

    const schedule = () => {
      const delay = Math.min(refreshInterval * 1000 * Math.pow(2, failCount.current), 300000)
      timeoutId = setTimeout(async () => {
        if (cancelled) return
        await refreshAlerts()
        if (!cancelled) schedule()
      }, delay)
    }

    schedule()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      abortControllerRef.current?.abort()
    }
  }, [refreshInterval, refreshAlerts])

  // Fetch alerts on initial load
  useEffect(() => {
    refreshAlerts()
  }, [refreshAlerts])

  const value = useMemo(() => ({
    alerts,
    errors,
    loading,
    logoutDetected,
    refreshInterval,
    setRefreshInterval,
    refreshAlerts,
  }), [alerts, errors, loading, logoutDetected, refreshInterval, refreshAlerts])

  return (
    <AlertsContext.Provider value={value}>
      {children}
    </AlertsContext.Provider>
  )
}

export const useAlerts = () => {
  const context = useContext(AlertsContext)
  if (context === undefined) {
    throw new Error('useAlerts must be used within a AlertsProvider')
  }
  return context
}
