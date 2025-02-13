'use client'

import { useSilences } from '@/contexts/silences'
import { SilenceGroups } from './silence-groups'
import { Header } from './header'
import { Footer } from './footer'
import { SilenceModal } from './silence-modal'
import { useEffect, useState } from 'react'
import { Silence } from '@/types/alertmanager'
import { useQueryState } from 'nuqs'
import { useHotkeys } from 'react-hotkeys-hook'

export default function SilencesTemplate() {
  const {
    silences,
    loading,
    refreshSilences,
    errors,
    refreshInterval,
    setRefreshInterval,
  } = useSilences()

  useHotkeys('r', () => refreshSilences(), []);

  const [selectedSilence, setSelectedSilence] = useState<Silence | null>(null)
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null)
  const [selectedSilenceId] = useQueryState('silence', { defaultValue: '' })

  const silenceCount = Object.values(silences).reduce((acc, s) => acc + s.length, 0)

  // Transform Map into array of objects
  const silenceGroups = Object.entries(silences).map(([cluster, clusterSilences]) => ({
    name: cluster,
    silences: clusterSilences
  }))

  // Select alert by ID (fingerprint)
  useEffect(() => {
    if (!selectedSilenceId) {
      setSelectedSilence(null)
      return
    }

    for (const [cluster, clusterSilences] of Object.entries(silences)) {
      const silence = clusterSilences.find((s) => s.id === selectedSilenceId)
      if (silence) {
        setSelectedSilence(silence)
        setSelectedCluster(cluster)
        break
      }
    }
  }, [selectedSilenceId, silences])

  return (
    <div className="flex flex-col h-full">
      <Header
        errors={errors}
        loading={loading}
        refreshSilences={refreshSilences}
        refreshInterval={refreshInterval}
        setRefreshInterval={setRefreshInterval}
      />

      <div className="overflow-x-clip overflow-y-auto">
        <SilenceGroups silenceGroups={silenceGroups} />

        <Footer
          silenceCount={silenceCount}
          loading={loading}
          refreshSilences={refreshSilences}
        />
      </div>

      <SilenceModal silence={selectedSilence} cluster={selectedCluster} />
    </div >
  )
}
