"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { getCurrentPlan } from "@/server/actions/subscription";
import { PLAN_CONFIGS } from "@/lib/entitlements";
import { Crown, RefreshCw, X } from "lucide-react";

const SYNC_INTERVAL_MS = 60_000;

/**
 * Watches the server-side plan and auto-applies upgrades bought on the
 * website — no reinstall needed. Shows an EarnKaro-style banner when the
 * plan changes so the user can refresh into the new limits immediately.
 */
export function PlanSyncProvider({ children }: { children: React.ReactNode }) {
  const plan = useAppStore((s) => s.plan);
  const setPlan = useAppStore((s) => s.setPlan);
  const [upgradedTo, setUpgradedTo] = useState<string | null>(null);
  const planRef = useRef(plan);
  planRef.current = plan;

  const sync = useCallback(async () => {
    if (typeof document !== "undefined" && document.hidden) return;
    try {
      const result = await getCurrentPlan();
      if ("error" in result && result.error) return;
      const serverPlan = (result as { plan: typeof plan }).plan;
      if (!serverPlan || serverPlan === planRef.current) return;
      const prevRank = rank(planRef.current);
      const nextRank = rank(serverPlan);
      setPlan(serverPlan);
      // Celebrate upgrades; silently apply downgrades/expiry.
      if (nextRank > prevRank) setUpgradedTo(serverPlan);
    } catch {
      // Offline or transient — try again on next tick.
    }
  }, [setPlan]);

  useEffect(() => {
    sync();
    const id = setInterval(sync, SYNC_INTERVAL_MS);
    const onVisible = () => {
      if (!document.hidden) sync();
    };
    const onFocus = () => sync();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [sync]);

  const handleRefresh = () => {
    setUpgradedTo(null);
    window.location.reload();
  };

  return (
    <>
      {upgradedTo && (
        <div className="fixed top-0 inset-x-0 z-[9998] px-3 pt-3 safe-area-top">
          <div className="mx-auto max-w-lg rounded-2xl bg-[#DC2626] text-white p-4 shadow-xl animate-scale-in">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Crown className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold">
                  You&apos;re now on {PLAN_CONFIGS[upgradedTo as keyof typeof PLAN_CONFIGS]?.name || upgradedTo}! 🎉
                </p>
                <p className="text-xs text-white/80">
                  Bought on the website — no reinstall needed. Refresh to unlock everything.
                </p>
              </div>
              <button onClick={() => setUpgradedTo(null)} aria-label="Dismiss" className="p-2 text-white/70">
                <X className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleRefresh}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-[#DC2626] tap-effect"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh app now
            </button>
          </div>
        </div>
      )}
      {children}
    </>
  );
}

function rank(p: string): number {
  if (p === "diamond") return 2;
  if (p === "gold") return 1;
  return 0;
}
