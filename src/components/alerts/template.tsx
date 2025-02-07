'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { parseAsArrayOf, useQueryState } from 'nuqs'
import { ListFilter, LoaderCircle, RefreshCcw, TriangleAlert, XIcon } from 'lucide-react'
import { ViewConfig } from '@/config/types'
import { useAlerts } from '@/contexts/alerts'
import { useConfig } from '@/contexts/config'
import AppHeader from '@/components/layout/app-header'
import { Button } from '@/components/ui/button'
import { Alert } from '@/types/alertmanager'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AlertGroups } from './alert-groups'
import { AlertModal } from './alert-modal'
import { Group, LabelFilter } from './types'
import { alertFilter, alertSort, parseAsFilter } from './utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import GroupSelect from './group-select'
import { useHotkeys } from 'react-hotkeys-hook'

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
  const [filters, setFilters] = useQueryState('filters', parseAsArrayOf(parseAsFilter, ';'))
  const [filterMatch] = useQueryState('match', { defaultValue: 'all' })
  const [alertState, setAlertState] = useQueryState('state', { defaultValue: 'active' })

  useHotkeys('r', () => refreshAlerts(), []);

  // Load view config
  useEffect(() => setView(config.views[viewName]), [viewName, config])

  // Filter & group matching alerts
  useEffect(() => {
    if (!view) {
      return
    }

    const groupBy = group !== '' ? group : view.groupBy

    // Flatten, filter & sort alerts
    const flatAlerts = Object.values(alerts)
      .reduce((acc, val) => acc.concat(val), [])
      .filter(alertFilter(view.filters, view.filtersMatch === 'all'))
      .filter(alertFilter(filters || [], filterMatch !== 'any'))
    flatAlerts.sort(alertSort)

    setFlattenedAlerts(flatAlerts)

    // Group alerts by specified field
    const filterActive = alertState !== 'inactive'
    const alertGroups: Group[] = Object.entries(
      flatAlerts
        .filter((alert) => filterActive ? alert.status.state === 'active' : alert.status.state !== 'active')
        .reduce((acc: Record<string, Alert[]>, alert: Alert) => {
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
  }, [view, alerts, group, filters, filterMatch, alertState])

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
    <div className="flex flex-col h-full">
      <AppHeader>
        <div className='flex items-center gap-2'>
          <div className="font-medium">
            Alerts
          </div>
          <div className="text-muted-foreground">/</div>
          <div className='truncate'>
            {view.name ? view.name : viewName}
          </div>
          <div className="hidden sm:inline-flex ml-2 h-8 items-center justify-center rounded-md bg-accent p-1 text-accent-foreground">
            <button
              data-state={alertState === 'inactive' ? '' : 'active'}
              onClick={() => { setAlertState('active') }}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-0.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/20"
            >
              Active
            </button>
            <button
              data-state={alertState === 'inactive' ? 'active' : ''}
              onClick={() => { setAlertState('inactive') }}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-0.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/20"
            >
              Inactive
            </button>
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

          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent side="left" className="flex items-center gap-2">
              <span>Refresh</span>
              <span className="font-mono flex items-center justify-center h-5 w-5 text-muted-foreground border-muted-foreground border rounded-sm">R</span>
            </TooltipContent>
          </Tooltip>

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
        <AlertFilters filters={filters || []} setFilters={setFilters} />
        <div className='grow' />
        <div className='flex items-center'>
          <GroupSelect labels={labels} defaultValue={view.groupBy} />
        </div>
      </div>

      <div className="overflow-x-clip overflow-y-auto">
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

type AlertFiltersProps = {
  filters: LabelFilter[]
  setFilters: (value: LabelFilter[]) => void
}

function AlertFilters(props: AlertFiltersProps) {
  const { filters } = props

  // No filters, display the filters button
  if (filters.length === 0) {
    return (
      <div className='-ml-2'>
        <Button
          variant="secondary"
          size="sm"
          disabled
          className="h-[30px] w-full justify-between bg-background px-3 font-normal hover:bg-secondary"
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
    )
  }

  return (
    <div className='gap-2 flex items-center'>
      {filters.map((filter, i) => (
        <div key={i} className="flex items-center px-2 py-0.5 bg-secondary rounded-sm shadow-sm border-border/20">
          <span className="font-semibold font-mono">{filter.label}</span>
          <span className="text-muted-foreground">{filterOperand(!filter.exclude, filter.regex)}</span>
          <span className="truncate">{filter.value}</span>
          <button className="ml-1" title="Remove filter" onClick={() => props.setFilters(filters.filter((_, j) => i !== j))}>
            <XIcon size={14} className="text-muted-foreground" />
          </button>
        </div>
      ))}
    </div>
  )
}

function filterOperand(isEqual: boolean, isRegex: boolean) {
  return isRegex ? (isEqual ? '=~' : '!~') : (isEqual ? '=' : '!=')
}
