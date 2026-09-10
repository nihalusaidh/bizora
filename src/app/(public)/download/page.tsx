"use client";

import { useState, useEffect } from "react";
import { Smartphone, Globe, Monitor, ArrowRight, Lock, Download, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { canDownloadDesktop, getAvailablePlans, PLAN_CONFIGS } from "@/lib/entitlements";
import { Badge } from "@/components/ui/badge";

function detectPlatform(): "mobile" | "web" | "desktop" {
  if (typeof window === "undefined") return "web";
  const ua = navigator.userAgent.toLowerCase();
  if (/android|iphone|ipad|ipod/.test(ua)) return "mobile";
  if (navigator.userAgent.includes("Electron")) return "desktop";
  return "web";
}

export default function DownloadPage() {
  const plan = useAppStore((s) => s.plan);
  const platform = detectPlatform();
  const availablePlans = getAvailablePlans(platform);
  const desktopEnabled = canDownloadDesktop(plan);
  const config = PLAN_CONFIGS[plan];
  const [isCapacitor, setIsCapacitor] = useState(false);

  useEffect(() => {
    setIsCapacitor(!!(window as any).Capacitor);
  }, []);

  const handleDownloadAPK = () => {
    window.open("/releases/bizora.apk", "_blank");
  };

  const handleDownloadEXE = () => {
    window.open("/releases/bizora.exe", "_blank");
  };

  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-[#0a0a0a]">
          Download Bizora
        </h1>
        <p className="mt-4 text-lg text-neutral-500 max-w-2xl mx-auto">
          Your account, business data and subscription travel with you across
          devices. Works online and offline.
        </p>

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
          {/* Android */}
          <div className="flex flex-col items-center rounded-2xl border border-neutral-200 bg-white p-8 text-center hover:border-[#DC2626]/30 transition-all">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#DC2626]/10">
              <Smartphone className="h-7 w-7 text-[#DC2626]" />
            </div>
            <h2 className="text-xl font-semibold text-[#0a0a0a]">Android</h2>
            <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
              Billing, inventory, POS and more. Works offline.
            </p>
            <div className="mt-6 w-full">
              <button
                onClick={handleDownloadAPK}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#b91c1c] transition-colors"
              >
                <Download className="h-4 w-4" />
                Download APK
              </button>
            </div>
            <p className="mt-2 text-xs text-neutral-400">v1.0.0 • ~15MB</p>
          </div>

          {/* Web */}
          <div className="flex flex-col items-center rounded-2xl border border-neutral-200 bg-white p-8 text-center hover:border-[#DC2626]/30 transition-all">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#DC2626]/10">
              <Globe className="h-7 w-7 text-[#DC2626]" />
            </div>
            <h2 className="text-xl font-semibold text-[#0a0a0a]">Web App</h2>
            <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
              Access from any browser. Install as PWA for offline use.
            </p>
            <div className="mt-6 w-full">
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#b91c1c] transition-colors"
              >
                Open Bizora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-2 text-xs text-neutral-400">No install required</p>
          </div>

          {/* Desktop */}
          <div className="flex flex-col items-center rounded-2xl border border-neutral-200 bg-white p-8 text-center hover:border-[#DC2626]/30 transition-all">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#DC2626]/10">
              <Monitor className="h-7 w-7 text-[#DC2626]" />
            </div>
            <h2 className="text-xl font-semibold text-[#0a0a0a]">Desktop</h2>
            <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
              Full-featured Windows app. Works completely offline.
            </p>
            <div className="mt-6 w-full">
              {desktopEnabled ? (
                <button
                  onClick={handleDownloadEXE}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#b91c1c] transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download for Windows
                </button>
              ) : (
                <Link
                  href="/settings/subscription"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-500 hover:bg-neutral-200 transition-colors"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Upgrade to Gold
                </Link>
              )}
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              {desktopEnabled ? "v1.0.0 • ~50MB" : "Requires Gold plan"}
            </p>
          </div>
        </div>

        {/* Features comparison */}
        <div className="mt-16 text-left max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-[#0a0a0a] mb-4">All platforms include:</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              "Billing & POS",
              "Inventory management",
              "Customer & Khata",
              "Expense tracking",
              "Sales reports",
              "Offline support",
              "GST compliance",
              "UPI QR payments",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-neutral-600">
                <CheckCircle className="h-4 w-4 text-[#DC2626] shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

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
