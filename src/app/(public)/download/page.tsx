"use client";

import { useState, useEffect } from "react";
import { Smartphone, Globe, Monitor, Lock, Download, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { canDownloadDesktop, PLAN_CONFIGS } from "@/lib/entitlements";
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
  const desktopEnabled = canDownloadDesktop(plan);
  const config = PLAN_CONFIGS[plan];
  const [apkError, setApkError] = useState("");
  const [shell, setShell] = useState("");
  useEffect(() => {
    const cap = !!(window as unknown as { Capacitor?: unknown }).Capacitor;
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setShell(cap ? "Installed BIZORA app" : standalone ? "Saved website shortcut" : "Browser");
  }, []);

  const handleDownloadAPK = async () => {
    setApkError("");
    try {
      const res = await fetch("/api/download/apk");
      if (!res.ok) throw new Error("download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bizora.apk";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setApkError("APK download failed. Please try again.");
    }
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
            {apkError && <p className="mt-2 text-xs font-bold text-[#DC2626]">{apkError}</p>}
            <p className="mt-2 text-xs text-neutral-400">v1.1.0 • ~15MB • in-app Google sign-in</p>
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
              <div className="rounded-lg border border-red-200 bg-[#FEF2F2] px-4 py-2.5 text-center">
                <p className="text-sm font-bold text-[#B91C1C]">Web app coming soon</p>
                <p className="text-xs text-[#DC2626]">Mobile app is the way for now →</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-neutral-400">Coming soon</p>
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
                <div className="rounded-lg border border-red-200 bg-[#FEF2F2] px-4 py-2.5 text-center">
                  <p className="text-sm font-bold text-[#B91C1C]">Windows app coming soon</p>
                  <Link href="/login" className="text-xs font-bold text-[#DC2626] hover:underline">
                    Use the Web app for now →
                  </Link>
                </div>
              ) : (
                <Link
                  href="/settings/subscription"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-500 hover:bg-neutral-200 transition-colors"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Upgrade to Pro
                </Link>
              )}
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              {desktopEnabled ? "Windows build in progress" : "Requires Pro plan"}
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
              On mobile, only Free and Pro plans are available. Diamond plan
              features (multi-branch, API access, white-label) are best used on
              desktop or web.
            </p>
          </div>
        )}

        <p className="mt-12 text-sm text-neutral-400 italic">
          Continue billing even when your internet connection disappears.
        </p>
        {shell && (
          <p className="mt-3 text-[11px] text-neutral-300">
            Opened in: {shell} • Install the Android app for the full experience.
          </p>
        )}
      </div>
    </section>
  );
}
