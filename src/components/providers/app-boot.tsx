"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { isCapacitor } from "@/lib/platform";

/** Hides the native splash once the web app has settled (redirects done)
 *  so installed APK/desktop never sit on a stale splash — or flash content. */
export function AppBoot() {
  useEffect(() => {
    if (!isCapacitor()) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      // Old shells lack the plugin — auto-hide covers them; never throw.
      if (!Capacitor.isPluginAvailable("SplashScreen")) return;
      import("@capacitor/splash-screen")
        .then(({ SplashScreen }) => SplashScreen.hide().catch(() => {}))
        .catch(() => {});
    }, 1200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);
  return null;
}

/** Minimal brand boot screen rendered instead of marketing pages in-app. */
export function NativeBootScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="h-14 w-14 rounded-2xl bg-[#DC2626] flex items-center justify-center mb-4">
        <span className="text-white font-extrabold text-2xl">B</span>
      </div>
      <p className="text-lg font-extrabold tracking-tight">BIZORA</p>
      <div className="mt-4 h-6 w-6 rounded-full border-2 border-[#DC2626]/20 border-t-[#DC2626] animate-spin" />
    </div>
  );
}
