"use client";

import { useState, useEffect, useCallback } from "react";

interface ServiceWorkerState {
  registration: ServiceWorkerRegistration | null;
  needRefresh: boolean;
  updateApp: () => void;
}

export function useServiceWorker(): ServiceWorkerState {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [needRefresh, setNeedRefresh] = useState(false);

  const updateApp = useCallback(() => {
    if (!registration?.waiting) return;
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
    window.location.reload();
  }, [registration]);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        setRegistration(reg);

        // Check for updates periodically
        const checkUpdate = () => reg.update();
        const interval = setInterval(checkUpdate, 60 * 60 * 1000); // hourly

        // Listen for new service worker
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setNeedRefresh(true);
            }
          });
        });

        return () => clearInterval(interval);
      })
      .catch(() => {});

    // Listen for SW messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SYNC_INVOICES") {
        // Handle sync request from SW
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);

  return { registration, needRefresh, updateApp };
}
