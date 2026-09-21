"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Smartphone, Zap, WifiOff, Bell } from "lucide-react";

/** BIZORA is mobile-app only: desktop browsers get a full-screen
 *  interstitial pointing to the APK instead of the web app. */
function isDesktopBrowser(): boolean {
  if (typeof window === "undefined") return false;
  if ((window as unknown as { Capacitor?: unknown }).Capacitor) return false;
  if (navigator.userAgent.includes("Electron")) return false;
  const ua = navigator.userAgent.toLowerCase();
  if (/android|iphone|ipad|ipod|mobile/.test(ua)) return false;
  return true;
}

export function DesktopBlocker() {
  const [blocked, setBlocked] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setBlocked(isDesktopBrowser());
  }, [pathname]);

  if (!blocked) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a] p-6 text-center">
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DC2626]">
          <span className="text-lg font-bold text-white">B</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-white">BIZORA</span>
      </div>

      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#DC2626]/20 bg-[#DC2626]/10">
        <Smartphone className="h-10 w-10 text-[#DC2626]" />
      </div>

      <h1 className="mb-3 text-2xl font-bold text-white">BIZORA lives in the mobile app</h1>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-neutral-400">
        Billing, stock, khata and AI — made for phones. Your data is safe in your account; pick up right where you left off in the app.
      </p>

      <a
        href="/download"
        className="rounded-xl bg-[#DC2626] px-8 py-3 text-base font-medium text-white hover:bg-[#b91c1c] transition-colors"
      >
        Get the Android App
      </a>
      <p className="mt-3 text-xs text-neutral-500">Free download • Works offline • Pro ₹399/mo on our website</p>

      <div className="mt-10 grid max-w-sm grid-cols-3 gap-6">
        {[
          { icon: Zap, label: "10-sec bills" },
          { icon: WifiOff, label: "Offline" },
          { icon: Bell, label: "Alerts" },
        ].map((f) => (
          <div key={f.label} className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800">
              <f.icon className="h-5 w-5 text-neutral-400" />
            </div>
            <span className="text-xs text-neutral-500">{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
