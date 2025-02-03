'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { z } from 'zod';
import { useConfig } from './config';
import type { ClusterConfig } from '@/config/types';
import { Silence, SilenceSchema } from '@/types/alertmanager';

type SilencesContextType = {
  silences: Record<string, Silence[]>;
  errors: Record<string, string>;
  loading: boolean;
  logoutDetected: boolean;
  refreshInterval: number;
  setRefreshInterval: (interval: number) => void;
  refreshSilences: () => Promise<void>;
};

const SilencesContext = createContext<SilencesContextType | null>(null);

export const useSilences = () => {
  const context = useContext(SilencesContext);
  if (!context) {
    throw new Error('useSilences must be used within a SilencesProvider');
  }
  return context;
};

export const SilencesProvider = ({ children }: { children: ReactNode }) => {
  const { config } = useConfig();
  const { clusters } = config;

  const [loading, setLoading] = useState(false);
  const [logoutDetected, setLogoutDetected] = useState(false);
  const [silences, setSilences] = useState<Record<string, Silence[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [refreshInterval, setRefreshInterval] = useState<number>(60);

  const fetchSilencesForCluster = async (cluster: ClusterConfig) => {
    try {
      const response = await fetch(`/api/clusters/${cluster.name}/silences`, { redirect: 'manual' });
      if (response.type === 'opaqueredirect') {
        setLogoutDetected(true);
        throw new Error(`redirection not allowed`);
      }
      if (!response.ok) {
        throw new Error(`failed to fetch silences`);
      }
      const data = await response.json();

      const parsedData = z.array(SilenceSchema).safeParse(data);
      if (!parsedData.success) {
        console.error(`invalid silence format`, parsedData.error.errors);
        throw new Error(`invalid silence format`);
      }

      setSilences(prev => ({
        ...prev,
        [cluster.name]: parsedData.data
      }));

      setErrors(prev => {
        const { [cluster.name]: _, ...rest } = prev;
        return rest;
      });
    } catch (error: unknown) {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;

      setErrors(prev => ({
        ...prev,
        [cluster.name]: message
      }));
    }
  };

  const refreshSilences = useCallback(async () => {
    if (clusters.length === 0) return;
    setLoading(true);
    await Promise.all(clusters.map(cluster => fetchSilencesForCluster(cluster)));
    setLoading(false);
  }, [clusters]);

  useEffect(() => {
    if (refreshInterval === 0) return;

    const intervalId = setInterval(() => {
      refreshSilences();
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [refreshInterval, refreshSilences]);

  useEffect(() => {
    refreshSilences();
  }, [refreshSilences]);

  const value = {
    silences,
    errors,
    loading,
    logoutDetected,
    refreshInterval,
    setRefreshInterval,
    refreshSilences,
  };

  return (
    <SilencesContext.Provider value={value}>
      {children}
    </SilencesContext.Provider>
  );
};
