'use client'

import { Alert } from '@/types/alertmanager'
import { useAlerts } from '@/contexts/alerts'
import AppHeader from '@/components/layout/app-header'
import { AlertGroups } from './alert-groups'
import { RefreshCcw, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { AlertModal } from './alert-modal'
import { LabelFilter, Group } from './types'
import { useConfig } from '@/contexts/config'
import { alertFilter, alertSort } from './utils'


type Props = {
  view: string
}

export function AlertsTemplate(props: Props) {
  const { view } = props
  const { config } = useConfig()
  const { alerts, loading, errors, refreshAlerts } = useAlerts()
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  const { filters, groupBy } = config.views[view]

  // Flatten alerts
  const flattenedAlerts = Object.values(alerts).reduce((acc, val) => acc.concat(val), [])

  // Filter and sort alerts
  const filteredAlerts = flattenedAlerts.filter(alertFilter(filters))
  filteredAlerts.sort(alertSort)

  // Group alerts by specified field
  const alertGroups: Group[] = Object.entries(
    filteredAlerts.reduce((acc: Record<string, Alert[]>, alert: Alert) => {
      const cluster = alert.labels[groupBy]
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

  return (
    <div className="flex flex-col h-screen overflow-clip">
      <AppHeader>
        <div className='flex items-center gap-2'>
          <span className="font-medium">
            Alerts
          </span>

          {
            loading && (
              <span>loading…</span>
            ) || (
              <RefreshCcw
                size={16}
                className='cursor-pointer'
                onClick={() => refreshAlerts()}
              />
            )
          }
          {
            !loading && Object.entries(errors).length > 0 && (
              <TriangleAlert
                size={16}
                className='text-orange-500'
              />
            )
          }
        </div>
      </AppHeader>

      <div className="overflow-auto">
        <AlertGroups
          alertGroups={alertGroups}
          selectedAlert={selectedAlert}
          setSelectedAlert={setSelectedAlert}
        />

        <footer className="my-6 text-xs flex gap-2 justify-center text-muted-foreground">
          {loading && (
            <span>loading...</span>
          ) || (
              <>
                <span>
                  Total of <span className="font-semibold">{filteredAlerts.length} alerts</span> displayed.
                </span>
                <button
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
        setSelectedAlert={setSelectedAlert}
        close={() => setSelectedAlert(null)}
      />
    </div>
  )
}
