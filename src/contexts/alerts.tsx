'use client'

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react'
import { Alert, AlertSchema } from '@/types/alertmanager'
import { ClusterConfig } from '@/config/types'
import { useConfig } from '@/contexts/config'
import { z } from 'zod'

interface AlertsContextProps {
  alerts: Record<string, Alert[]>
  errors: Record<string, string>
  loading: boolean
  refreshAlerts: () => Promise<void>
}

const AlertsContext = createContext<AlertsContextProps | undefined>(undefined)

export const AlertsProvider = ({ children }: { children: ReactNode }) => {
  const { config } = useConfig()
  const { clusters } = config

  const [loading, setLoading] = useState(false)
  const [alerts, setAlerts] = useState<Record<string, Alert[]>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fetchAlertsForCluster = async (cluster: ClusterConfig) => {
    try {
      // Fetch alerts for this cluster
      const response = await fetch(`/api/clusters/${cluster.name}/alerts`)
      if (!response.ok) {
        throw new Error(`Failed to fetch alerts for ${cluster.name}`)
      }
      const data = await response.json()

      // Validate the response data
      const parsedData = z.array(AlertSchema).safeParse(data)
      if (!parsedData.success) {
        throw new Error(`Invalid alert format for ${cluster.name}`)
      }

      // Add extra labels to each alert
      parsedData.data.forEach(alert => {
        alert.labels = {
          ...alert.labels,
          ...cluster.labels,
          '@cluster': cluster.name,
        }
      })

      // Update alerts for this cluster
      setAlerts(prev => ({
        ...prev,
        [cluster.name]: parsedData.data
      }))

      // Clear any previous errors
      setErrors(prev => {
        const { [cluster.name]: _, ...rest } = prev
        return rest
      })
    } catch (error: unknown) {
      let message = 'Unknown Error'
      if (error instanceof Error) message = error.message

      // Update errors for this cluster
      setErrors(prev => ({
        ...prev,
        [cluster.name]: message
      }))
    }
  }

  // Fetch alerts for all clusters
  const refreshAlerts = useCallback(async () => {
    if (clusters.length === 0) return
    setLoading(true)
    await Promise.all(clusters.map(cluster => fetchAlertsForCluster(cluster)))
    setLoading(false)
  }, [clusters])

  useEffect(() => {
    refreshAlerts()
  }, [refreshAlerts])

  return (
    <AlertsContext.Provider value={{ alerts, errors, loading, refreshAlerts }}>
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
