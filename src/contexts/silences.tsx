'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, useMemo, type ReactNode } from 'react';
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
  const failCount = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSilencesForCluster = async (cluster: ClusterConfig, signal: AbortSignal): Promise<boolean> => {
    try {
      const response = await fetch(`/api/clusters/${cluster.name}/silences`, { redirect: 'manual', signal });
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
        console.error(`invalid silence format`, parsedData.error.issues);
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

      return true;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return true;

      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;

      setErrors(prev => ({
        ...prev,
        [cluster.name]: message
      }));

      return false;
    }
  };

  const refreshSilences = useCallback(async () => {
    if (clusters.length === 0) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    const results = await Promise.all(clusters.map(cluster => fetchSilencesForCluster(cluster, controller.signal)));
    setLoading(false);

    if (controller.signal.aborted) return;

    if (results.every(Boolean)) {
      failCount.current = 0;
    } else {
      failCount.current++;
    }
  }, [clusters]);

  useEffect(() => {
    if (refreshInterval === 0) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const schedule = () => {
      const delay = Math.min(refreshInterval * 1000 * Math.pow(2, failCount.current), 300000);
      timeoutId = setTimeout(async () => {
        if (cancelled) return;
        await refreshSilences();
        if (!cancelled) schedule();
      }, delay);
    };

    schedule();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      abortControllerRef.current?.abort();
    };
  }, [refreshInterval, refreshSilences]);

  useEffect(() => {
    refreshSilences();
  }, [refreshSilences]);

  const value = useMemo(() => ({
    silences,
    errors,
    loading,
    logoutDetected,
    refreshInterval,
    setRefreshInterval,
    refreshSilences,
  }), [silences, errors, loading, logoutDetected, refreshInterval, refreshSilences])

  return (
    <SilencesContext.Provider value={value}>
      {children}
    </SilencesContext.Provider>
  );
};
