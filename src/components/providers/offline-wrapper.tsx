"use client";

import { OfflineIndicator } from "@/lib/hooks/use-offline";
import { useServiceWorker } from "@/lib/hooks/use-service-worker";

export function OfflineWrapper({ children }: { children: React.ReactNode }) {
  useServiceWorker();

  return (
    <>
      <OfflineIndicator />
      {children}
    </>
  );
}
