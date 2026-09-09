"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { hasFeature, getUpgradeRequired, PLAN_CONFIGS } from "@/lib/entitlements";
import { Badge } from "@/components/ui/badge";

interface PlanGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PlanGate({ feature, children, fallback }: PlanGateProps) {
  const plan = useAppStore((s) => s.plan);

  if (hasFeature(plan, feature)) {
    return <>{children}</>;
  }

  const upgradeTo = getUpgradeRequired(plan, feature);
  const config = upgradeTo ? PLAN_CONFIGS[upgradeTo] : null;

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative">
      {/* Blurred content preview */}
      <div className="blur-[2px] opacity-40 pointer-events-none select-none">
        {children}
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white dark:bg-[#141414] border border-border rounded-2xl p-6 shadow-xl text-center max-w-xs mx-4">
          <div className="w-10 h-10 bg-[#DC2626]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Lock className="w-5 h-5 text-[#DC2626]" />
          </div>
          <h3 className="font-bold text-sm mb-1">Upgrade Required</h3>
          <p className="text-xs text-muted-foreground mb-4">
            This feature requires{" "}
            <Badge variant="secondary" className="mx-0.5">
              {config?.name}
            </Badge>{" "}
            plan
          </p>
          <Link
            href="/settings/subscription"
            className="inline-flex items-center gap-1.5 bg-[#DC2626] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#B91C1C] transition-colors"
          >
            Upgrade to {config?.name}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PlanBadge() {
  const plan = useAppStore((s) => s.plan);
  const config = PLAN_CONFIGS[plan];

  return (
    <Badge
      variant={plan === "free" ? "secondary" : "default"}
      className={
        plan === "gold"
          ? "bg-[#DC2626] text-white"
          : plan === "diamond"
          ? "bg-[#0a0a0a] text-white dark:bg-white dark:text-[#0a0a0a]"
          : ""
      }
    >
      {config.name}
    </Badge>
  );
}
