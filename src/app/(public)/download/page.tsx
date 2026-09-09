"use client";

import { Smartphone, Globe, Monitor, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { canDownloadDesktop, getAvailablePlans, PLAN_CONFIGS } from "@/lib/entitlements";
import { Badge } from "@/components/ui/badge";

function detectPlatform(): "mobile" | "web" | "desktop" {
  if (typeof window === "undefined") return "web";
  const ua = navigator.userAgent.toLowerCase();
  if (/android|iphone|ipad|ipod/.test(ua)) return "mobile";
  return "web";
}

const platforms = [
  {
    name: "Android",
    description: "Billing, inventory, POS & more on your phone.",
    icon: Smartphone,
    action: {
      label: "Download App",
      href: "#",
      disabled: true,
    },
    minPlan: "free" as const,
  },
  {
    name: "Web",
    description: "Access Bizora from any browser, anywhere.",
    icon: Globe,
    action: {
      label: "Open Bizora",
      href: "/login",
      disabled: false,
    },
    minPlan: "free" as const,
  },
  {
    name: "Desktop",
    description: "Full-featured app for Windows workstations.",
    icon: Monitor,
    action: {
      label: "Download for Windows",
      href: "#",
      disabled: false,
    },
    minPlan: "gold" as const,
  },
];

export default function DownloadPage() {
  const plan = useAppStore((s) => s.plan);
  const platform = detectPlatform();
  const availablePlans = getAvailablePlans(platform);
  const desktopEnabled = canDownloadDesktop(plan);
  const config = PLAN_CONFIGS[plan];

  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-[#0a0a0a]">
          Download Bizora
        </h1>
        <p className="mt-4 text-lg text-neutral-500 max-w-2xl mx-auto">
          Your account, business data and subscription travel with you across
          devices.
        </p>

        {/* Current plan indicator */}
        <div className="mt-6 inline-flex items-center gap-2 bg-neutral-100 rounded-full px-4 py-2">
          <span className="text-xs font-medium text-neutral-500">Your plan:</span>
          <Badge
            variant={plan === "free" ? "secondary" : "default"}
            className={
              plan === "gold"
                ? "bg-[#DC2626] text-white"
                : plan === "diamond"
                ? "bg-[#0a0a0a] text-white"
                : ""
            }
          >
            {config.name}
          </Badge>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {platforms.map((p) => {
            const Icon = p.icon;
            const isDesktop = p.name === "Desktop";
            const isLocked = isDesktop && !desktopEnabled;
            const isDownloadDisabled = p.action.disabled || isLocked;

            return (
              <div
                key={p.name}
                className={`flex flex-col items-center rounded-2xl border p-8 text-center transition-all ${
                  isLocked
                    ? "border-neutral-200 bg-neutral-50 opacity-75"
                    : "border-neutral-200 bg-white hover:border-[#DC2626]/30"
                }`}
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#DC2626]/10">
                  <Icon className="h-7 w-7 text-[#DC2626]" />
                </div>
                <h2 className="text-xl font-semibold text-[#0a0a0a]">
                  {p.name}
                </h2>
                <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                  {p.action.disabled
                    ? "Coming soon"
                    : isLocked
                    ? "Requires Gold or Diamond plan"
                    : p.description}
                </p>

                {isLocked && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400">
                    <Lock className="w-3 h-3" />
                    <span>Upgrade to Gold to download</span>
                  </div>
                )}

                <div className="mt-6 w-full">
                  {isDownloadDisabled ? (
                    <button
                      disabled
                      className="w-full rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-400 cursor-not-allowed"
                    >
                      {isLocked ? (
                        <span className="flex items-center justify-center gap-2">
                          <Lock className="w-3.5 h-3.5" />
                          Upgrade to Gold
                        </span>
                      ) : (
                        p.action.label
                      )}
                    </button>
                  ) : (
                    <Link
                      href={p.action.href}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#b91c1c] transition-colors"
                    >
                      {p.action.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile plan restriction notice */}
        {platform === "mobile" && (
          <div className="mt-10 bg-neutral-50 border border-neutral-200 rounded-xl p-6 max-w-lg mx-auto">
            <p className="text-sm font-medium text-[#0a0a0a] mb-2">
              Mobile Plans
            </p>
            <p className="text-xs text-neutral-500 leading-relaxed">
              On mobile, only Free and Gold plans are available. Diamond plan
              features (multi-branch, API access, white-label) are best used on
              desktop or web.
            </p>
          </div>
        )}

        <p className="mt-12 text-sm text-neutral-400 italic">
          Continue billing even when your internet connection disappears.
        </p>
      </div>
    </section>
  );
}
