'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { ListFilter, LoaderCircle, RefreshCcw, TriangleAlert } from 'lucide-react'
import { ViewConfig } from '@/config/types'
import { useAlerts } from '@/contexts/alerts'
import { useConfig } from '@/contexts/config'
import AppHeader from '@/components/layout/app-header'
import { Button } from '@/components/ui/button'
import { Alert } from '@/types/alertmanager'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AlertGroups } from './alert-groups'
import { AlertModal } from './alert-modal'
import { Group } from './types'
import { alertFilter, alertSort } from './utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import GroupSelect from './group-select'

type Props = {
  view: string
}

export function AlertsTemplate(props: Props) {
  const { view: viewName } = props
  const { config } = useConfig()
  const { alerts, loading, errors, refreshAlerts, refreshInterval, setRefreshInterval } = useAlerts()

  // Local state
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [selectedAlertId] = useQueryState('alert', { defaultValue: '' })
  const [group] = useQueryState('group', { defaultValue: '' })
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

    const groupBy = group !== '' ? group : view.groupBy

    // Flatten, filter & sort alerts
    const flatAlerts = Object.values(alerts).
      reduce((acc, val) => acc.concat(val), []).
      filter(alertFilter(view.filters))
    flatAlerts.sort(alertSort)

    setFlattenedAlerts(flatAlerts)

    // Group alerts by specified field
    const alertGroups: Group[] = Object.entries(
      flatAlerts.reduce((acc: Record<string, Alert[]>, alert: Alert) => {
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
    setAlertGroups(alertGroups)
  }, [view, alerts, group])

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

  const labels = Array.from(new Set(flattenedAlerts.flatMap(alert => Object.keys(alert.labels)))).sort()

  if (!view) return null

  return (
    <div className="flex flex-col h-screen overflow-clip">
      <AppHeader>
        <div className='flex items-center gap-2'>
          <div className="font-medium">
            Alerts
          </div>
          <div className="text-muted-foreground">/</div>
          <div>
            {view.name ? view.name : viewName}
          </div>
          <div>
            {
              !loading && Object.entries(errors).length > 0 && (
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TriangleAlert
                        size={16}
                        className='text-orange-500'
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <ul>
                        {Object.entries(errors).map(([cluster, message]) => (
                          <li key={cluster}>
                            <span className='font-semibold'>{cluster}</span>: {message}
                          </li>
                        ))}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
              <SelectTrigger className="w-[80px] h-[30px]">
                <SelectValue placeholder="Refresh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Off</SelectItem>
                <SelectItem value="10">10s</SelectItem>
                <SelectItem value="30">30s</SelectItem>
                <SelectItem value="60">60s</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </AppHeader>

      <div className="flex text-sm items-center px-2 lg:px-6 border-b w-full min-h-[45px] shrink-0 bg-400">
        <div className='-ml-2'>
          <Button
            variant="secondary"
            size="sm"
            disabled
            className="h-[30px] w-full justify-between bg-background px-3 font-normal hover:bg-background"
          >
            <ListFilter
              size={16}
              strokeWidth={2}
              className="shrink-0 text-muted-foreground/80"
              aria-hidden="true"
            />
            <span>Filters</span>
          </Button>
        </div>
        <div className='grow' />
        <div className='flex items-center'>
          <GroupSelect labels={labels} defaultValue={view.groupBy} />
        </div>
      </div>

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

      <AlertModal alert={selectedAlert} />
    </div>
  )
}
