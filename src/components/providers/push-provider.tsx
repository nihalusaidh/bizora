"use client";

import { useEffect, useCallback } from "react";
import { useBusiness } from "@/lib/store";

export function PushProvider({ children }: { children: React.ReactNode }) {
  const { businessId } = useBusiness();

  const subscribe = useCallback(async () => {
    if (!businessId || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY,
      });

      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON(), businessId }),
      });
    } catch (err) {
      console.error("Push subscription failed:", err);
    }
  }, [businessId]);

  useEffect(() => {
    subscribe();
  }, [subscribe]);

  return <>{children}</>;
}
