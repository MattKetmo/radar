'use client'

import { Alert } from '@/types/alertmanager'
import { useAlerts } from '@/contexts/alerts'
import AppHeader from '@/components/layout/app-header'
import { AlertGroups } from './alert-groups'
import { LoaderCircle, RefreshCcw, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { AlertModal } from './alert-modal'
import { LabelFilter, Group } from './types'
import { useConfig } from '@/contexts/config'
import { alertFilter, alertSort } from './utils'
import { notFound } from 'next/navigation'
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
  const { view } = props
  const { config } = useConfig()
  const { alerts, loading, errors, refreshAlerts, refreshInterval, setRefreshInterval } = useAlerts()
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  if (!config.views[view]) {
    return notFound()
  }

  const { filters, groupBy, name: viewName } = config.views[view]

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
        <div className='flex items-center  gap-2'>
          <div className="font-medium">
            Alerts
          </div>
          <div className="text-muted-foreground">/</div>
          <div>
            {viewName ? viewName : view}
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
        <AlertGroups
          alertGroups={alertGroups}
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
        setSelectedAlert={setSelectedAlert}
        close={() => setSelectedAlert(null)}
      />
    </div>
  )
}
