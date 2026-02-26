'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { useConfig } from '@/contexts/config'

export function useClusterData<T>(
  endpoint: string,
  schema: z.ZodType<T[]>,
) {
  const { config } = useConfig()
  const [data, setData] = useState<Record<string, T[]>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [logoutDetected, setLogoutDetected] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const abortRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const newData: Record<string, T[]> = {}
    const newErrors: Record<string, string> = {}

    await Promise.all(
      config.clusters.map(async (cluster) => {
        try {
          const res = await fetch(`/api/clusters/${cluster.name}${endpoint}`, {
            signal: controller.signal,
          })
          if (res.status === 401) {
            setLogoutDetected(true)
            return
          }
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const json = await res.json()
          const parsed = schema.safeParse(json)
          if (!parsed.success) throw new Error('Invalid response format')
          newData[cluster.name] = parsed.data
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') return
          newErrors[cluster.name] = err instanceof Error ? err.message : String(err)
        }
      })
    )

    if (controller.signal.aborted) return

    setData(newData)
    setErrors(newErrors)
    setLoading(false)
  }, [config.clusters, endpoint, schema])

  const refresh = useCallback(async () => {
    setLoading(true)
    await fetchData()
  }, [fetchData])

  // Initial fetch on mount
  useEffect(() => {
    fetchData()
    return () => {
      abortRef.current?.abort()
    }
  }, [fetchData])

  // Polling: re-fetch every refreshInterval seconds
  useEffect(() => {
    if (refreshInterval === 0) return
    const id = setInterval(() => {
      fetchData()
    }, refreshInterval * 1000)
    return () => clearInterval(id)
  }, [fetchData, refreshInterval])

  const value = useMemo(
    () => ({ data, errors, loading, logoutDetected, refreshInterval, setRefreshInterval, refresh }),
    [data, errors, loading, logoutDetected, refreshInterval, refresh]
  )

  return value
}
