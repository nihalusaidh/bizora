"use client";

import { useState, useEffect, useCallback } from "react";

interface OfflineState {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
  pendingSync: number;
}

export function useOffline(): OfflineState {
  const [state, setState] = useState<OfflineState>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isOffline: typeof navigator !== "undefined" ? !navigator.onLine : false,
    wasOffline: false,
    pendingSync: 0,
  });

  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({
        isOnline: true,
        isOffline: false,
        wasOffline: prev.isOffline,
        pendingSync: 0,
      }));
      // Trigger sync
      window.dispatchEvent(new CustomEvent("offline-sync"));
    };

    const handleOffline = () => {
      setState((prev) => ({
        isOnline: false,
        isOffline: true,
        wasOffline: prev.wasOffline,
        pendingSync: prev.pendingSync,
      }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return state;
}

export function OfflineIndicator() {
  const { isOnline, isOffline, wasOffline } = useOffline();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (wasOffline && isOnline) {
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    }
  }, [wasOffline, isOnline]);

  if (!isOffline && !showReconnected) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-sm font-medium transition-all duration-300 ${
        isOffline
          ? "bg-amber-500 text-white"
          : "bg-emerald-500 text-white"
      }`}
    >
      {isOffline ? (
        <span className="flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          You&apos;re offline — data will sync when reconnected
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-white" />
          Back online — syncing data...
        </span>
      )}
    </div>
  );
}
