'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { LoaderCircle, RefreshCcw, TriangleAlert } from 'lucide-react'
import { Alert } from '@/types/alertmanager'
import { ViewConfig } from '@/config/types'
import { useAlerts } from '@/contexts/alerts'
import AppHeader from '@/components/layout/app-header'
import { AlertGroups } from './alert-groups'
import { AlertModal } from './alert-modal'
import { Group } from './types'
import { useConfig } from '@/contexts/config'
import { alertFilter, alertSort } from './utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  view: string
}

export function AlertsTemplate(props: Props) {
  const { view: viewName } = props
  const { config } = useConfig()
  const { alerts, loading, errors, refreshAlerts, refreshInterval, setRefreshInterval } = useAlerts()

  // Local state
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [selectedAlertId, _] = useQueryState('alert', { defaultValue: '' })
  const [flattenedAlerts, setFlattenedAlerts] = useState<Alert[]>([])
  const [view, setView] = useState<ViewConfig | null>(null)
  const [alertGroups, setAlertGroups] = useState<Group[]>([])

  // Load view config
  useEffect(() => setView(config.views[viewName]), [viewName, config])

  // Filter & group matching alerts
  useEffect(() => {
    if (!view) {
      return
    }

    // Flatten alerts
    const flatAlerts = Object.values(alerts).reduce((acc, val) => acc.concat(val), [])
    setFlattenedAlerts(flatAlerts)

    // Filter and sort alerts
    const filteredAlerts = flatAlerts.filter(alertFilter(view.filters))
    filteredAlerts.sort(alertSort)

    // Group alerts by specified field
    const alertGroups: Group[] = Object.entries(
      filteredAlerts.reduce((acc: Record<string, Alert[]>, alert: Alert) => {
        const cluster = alert.labels[view.groupBy]
        if (!acc[cluster]) {
          acc[cluster] = []
        }
        acc[cluster].push(alert)
        return acc
      }, {})
    ).map(([name, alerts]) => ({ name, alerts }))
    alertGroups.sort((a, b) => {
      return a.name.localeCompare(b.name)
    })
    setAlertGroups(alertGroups)
  }, [view, alerts])

  // Select alert by ID (fingerprint)
  useEffect(() => {
    if (!selectedAlertId) {
      setSelectedAlert(null)
      return
    }
    const alert = flattenedAlerts.find((a) => a.fingerprint === selectedAlertId)
    if (alert) {
      setSelectedAlert(alert)
    }
  }, [selectedAlertId, flattenedAlerts])

  // 404 on server side if view not found
  if (!config.views[viewName]) {
    return notFound()
  }

  return (
    <div className="flex flex-col h-screen overflow-clip">
      <AppHeader>
        <div className='flex items-center  gap-2'>
          <div className="font-medium">
            Alerts
          </div>
          <div className="text-muted-foreground">/</div>
          <div>
            {view?.name ? view?.name : viewName}
          </div>
          <div>
            {
              !loading && Object.entries(errors).length > 0 && (
                <TriangleAlert
                  size={16}
                  className='text-orange-500'
                />
              )
            }
          </div>

          <div className='grow' />

          <button
            disabled={loading}
            onClick={() => refreshAlerts()}
            className={loading ? 'cursor-not-allowed text-muted-foreground ' : ''}
          >
            {loading && (
              <LoaderCircle size={16} className='animate-[spin_1s]' />
            ) || (
                <RefreshCcw size={16} />
              )}
          </button>

          <div>
            <Select value={`${refreshInterval}`} onValueChange={(value) => setRefreshInterval(Number(value))}>
              <SelectTrigger className="w-[100px] h-[30px]">
                <SelectValue placeholder="Refresh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Off</SelectItem>
                <SelectItem value="5">5s</SelectItem>
                <SelectItem value="10">10s</SelectItem>
                <SelectItem value="30">30s</SelectItem>
                <SelectItem value="60">60s</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </AppHeader>

      <div className="overflow-auto">
        <AlertGroups alertGroups={alertGroups} />

        <footer className="my-6 text-xs flex gap-2 justify-center text-muted-foreground">
          {loading && (
            <span>loading...</span>
          ) || (
              <>
                <span>
                  Total of <span className="font-semibold">{flattenedAlerts.length} alerts</span> displayed.
                </span>
                <button
                  disabled={loading}
                  onClick={() => refreshAlerts()}
                  className="font-semibold hover:underline underline-offset-2"
                >
                  Refresh
                </button>
              </>
            )}
        </footer>
      </div>

      <AlertModal
        alert={selectedAlert}
      />
    </div>
  )
}
