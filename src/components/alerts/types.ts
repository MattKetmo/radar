import { Alert } from "@/types/alertmanager"

export type Group = {
  name: string
  alerts: Alert[]
}

export type Filter = (alert: Alert) => boolean

export type LabelFilter = {
  label: string
  value: string | string[]
  exclude?: boolean
  regex?: boolean
}
