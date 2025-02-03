'use client'

import { useSilences } from '@/contexts/silences'
import { SilenceGroups } from './silence-groups'
import { Header } from './header'
import { Footer } from './footer'

export default function SilencesTemplate() {
  const {
    silences,
    loading,
    refreshSilences,
    errors,
    refreshInterval,
    setRefreshInterval,
  } = useSilences()

  const silenceGroups = Object.entries(silences).map(([cluster, clusterSilences]) => ({
    name: cluster,
    silences: clusterSilences
  }))

  const allSilences = Object.entries(silences).flatMap(([cluster, clusterSilences]) =>
    clusterSilences.map(silence => ({
      ...silence,
      cluster
    }))
  )

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
          silenceCount={allSilences.length}
          loading={loading}
          refreshSilences={refreshSilences}
        />
      </div>

      {/* <AlertModal alert={selectedAlert} /> */}
    </div >
  )
}
