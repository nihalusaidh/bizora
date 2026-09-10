"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { offlineDB } from "@/lib/offline-db";
import { createClient } from "@/lib/supabase/client";

interface OfflineDataState<T> {
  data: T[];
  isLoading: boolean;
  isOffline: boolean;
  isSyncing: boolean;
  lastSynced: string | null;
  error: string | null;
}

export function useOfflineData<T extends { id: string }>(
  cacheKey: string,
  fetchFn: () => Promise<T[]>,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
): OfflineDataState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<OfflineDataState<T>>({
    data: [],
    isLoading: true,
    isOffline: false,
    isSyncing: false,
    lastSynced: null,
    error: null,
  });
  const mountedRef = useRef(true);

  const loadData = useCallback(async () => {
    try {
      const isOnline = navigator.onLine;

      setState((prev) => ({ ...prev, isOffline: !isOnline }));

      // Always try cache first for instant display
      const cached = await offlineDB.cache.get(cacheKey);
      if (cached && mountedRef.current) {
        setState((prev) => ({
          ...prev,
          data: cached,
          isLoading: false,
        }));
      }

      // If online, fetch fresh data
      if (isOnline) {
        setState((prev) => ({ ...prev, isSyncing: true }));
        try {
          const freshData = await fetchFn();
          if (mountedRef.current) {
            await offlineDB.cache.set(cacheKey, freshData);
            setState((prev) => ({
              ...prev,
              data: freshData,
              isSyncing: false,
              lastSynced: new Date().toISOString(),
            }));
          }
        } catch (fetchError) {
          if (mountedRef.current) {
            setState((prev) => ({
              ...prev,
              isSyncing: false,
              error: fetchError instanceof Error ? fetchError.message : "Fetch failed",
            }));
          }
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isSyncing: false,
          error: err instanceof Error ? err.message : "Unknown error",
        }));
      }
    }
  }, [cacheKey, fetchFn]);

  useEffect(() => {
    mountedRef.current = true;
    if (options?.enabled !== false) {
      loadData();
    }

    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOffline: false }));
      loadData();
    };
    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOffline: true }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    let interval: ReturnType<typeof setInterval> | undefined;
    if (options?.refetchInterval) {
      interval = setInterval(loadData, options.refetchInterval);
    }

    return () => {
      mountedRef.current = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (interval) clearInterval(interval);
    };
  }, [loadData, options?.enabled, options?.refetchInterval]);

  return {
    ...state,
    refetch: loadData,
  };
}

export function useOfflineMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onMutate?: (variables: TVariables) => void;
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    offlineTableName?: string;
  }
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (variables: TVariables) => {
      setIsPending(true);
      setError(null);

      try {
        const isOnline = navigator.onLine;

        if (isOnline) {
          const data = await mutationFn(variables);
          options?.onSuccess?.(data, variables);
          setIsPending(false);
          return data;
        } else {
          // Offline: queue for later sync
          if (options?.offlineTableName) {
            await offlineDB.syncQueue.add({
              table_name: options.offlineTableName,
              operation: "insert",
              data: variables,
              record_id: (variables as any).id || crypto.randomUUID(),
            });
          }
          options?.onMutate?.(variables);
          setIsPending(false);
          return variables as unknown as TData;
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        options?.onError?.(error, variables);
        setIsPending(false);
        throw error;
      }
    },
    [mutationFn, options]
  );

  const mutateAsync = useCallback(
    async (variables: TVariables) => {
      return mutate(variables);
    },
    [mutate]
  );

  return { mutate, mutateAsync, isPending, error };
}

export function getPlatform(): "mobile" | "web" | "desktop" {
  if (typeof window === "undefined") return "web";
  const ua = navigator.userAgent.toLowerCase();
  if (/android|iphone|ipad|ipod/.test(ua)) return "mobile";
  if (navigator.userAgent.includes("Electron")) return "desktop";
  return "web";
}

export function isCapacitor(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as any).Capacitor;
}
