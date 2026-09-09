"use client";

import { useServiceWorker } from "@/lib/hooks/use-service-worker";
import { useRecurringExpenses } from "@/lib/hooks/use-recurring-expenses";

export function OfflineWrapper({ children }: { children: React.ReactNode }) {
  const { needRefresh, updateApp } = useServiceWorker();
  useRecurringExpenses();

  return (
    <>
      {/* Update available banner */}
      {needRefresh && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-[#DC2626] text-white px-4 py-2.5 flex items-center justify-center gap-3 text-sm">
          <span>New version available</span>
          <button
            onClick={updateApp}
            className="underline font-semibold hover:no-underline"
          >
            Update now
          </button>
        </div>
      )}
      {children}
    </>
  );
}
