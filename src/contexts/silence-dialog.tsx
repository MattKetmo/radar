'use client'

import { createContext, useContext, useState } from 'react'
import type { Silence, MatcherOperator } from '@/types/alertmanager'

export type SilenceFormData = {
  id?: string
  selectedClusters: string[]
  matchers: Array<{ name: string; value: string; operator: MatcherOperator }>
  durationMode: 'preset' | 'custom'
  durationPreset: number          // minutes
  customStartsAt: Date
  customEndsAt: Date
  author: string
  comment: string
}

type SilenceDialogContextType = {
  isOpen: boolean
  mode: 'create' | 'edit'
  prefillData: SilenceFormData | null
  prefillClusters: string[]
  openCreate: () => void
  openEdit: (silence: Silence, cluster: string) => void
  openFromAlert: (labels: Record<string, string>, cluster: string) => void
  close: () => void
}

const SilenceDialogContext = createContext<SilenceDialogContextType | undefined>(undefined)

export function SilenceDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [prefillData, setPrefillData] = useState<SilenceFormData | null>(null)
  const [prefillClusters, setPrefillClusters] = useState<string[]>([])

  const openCreate = () => {
    setMode('create')
    setPrefillData(null)
    setPrefillClusters([])
    setIsOpen(true)
  }

  const openEdit = (silence: Silence, cluster: string) => {
    setMode('edit')
    setPrefillData({
      id: silence.id,
      selectedClusters: [cluster],
      matchers: silence.matchers.map(m => ({
        name: m.name,
        value: m.value,
        operator: m.isRegex ? (m.isEqual ? '=~' : '!~') : (m.isEqual ? '=' : '!='),
      })),
      durationMode: 'custom',
      durationPreset: 60,
      customStartsAt: new Date(silence.startsAt),
      customEndsAt: new Date(silence.endsAt),
      author: silence.createdBy,
      comment: silence.comment,
    })
    setPrefillClusters([cluster])
    setIsOpen(true)
  }

  // TODO: make this configurable
  const ignoredLabels = ['cluster', 'prometheus', 'uid', 'instance', 'endpoint']

  const openFromAlert = (labels: Record<string, string>, cluster: string) => {
    const now = new Date()
    const endsAt = new Date(now.getTime() + 60 * 60 * 1000) // 1h default
    setMode('create')
    setPrefillData({
      selectedClusters: [cluster],
      matchers: Object.entries(labels)
        .filter(([name]) => !name.startsWith('@'))  // skip internal labels
        .filter(([name]) => !ignoredLabels.includes(name))
        .map(([name, value]) => ({ name, value, operator: '=' as MatcherOperator })),
      durationMode: 'preset',
      durationPreset: 60,
      customStartsAt: now,
      customEndsAt: endsAt,
      author: '',
      comment: '',
    })
    setPrefillClusters([cluster])
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
    setPrefillData(null)
    setPrefillClusters([])
  }

  return (
    <SilenceDialogContext.Provider value={{ isOpen, mode, prefillData, prefillClusters, openCreate, openEdit, openFromAlert, close }}>
      {children}
    </SilenceDialogContext.Provider>
  )
}

export function useSilenceDialog(): SilenceDialogContextType {
  const ctx = useContext(SilenceDialogContext)
  if (!ctx) throw new Error('useSilenceDialog must be used inside SilenceDialogProvider')
  return ctx
}
