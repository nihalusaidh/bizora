"use client";

import { useState, useEffect } from "react";
import { Smartphone, Download, Shield, Zap, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const ALLOWED_PATHS = [
  "/settings/subscription",
  "/pricing",
  "/download",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

function isMobileBrowser(): boolean {
  if (typeof window === "undefined") return false;

  // Capacitor native app — allow
  if ((window as any).Capacitor) return false;

  // Electron desktop app — allow
  if (navigator.userAgent.includes("Electron")) return false;

  // Mobile browser — block
  const ua = navigator.userAgent.toLowerCase();
  return /android|iphone|ipad|ipod/.test(ua);
}

export function MobileBrowserBlocker() {
  const [status, setStatus] = useState<"loading" | "blocked" | "allowed">("loading");
  const pathname = usePathname();

  useEffect(() => {
    setStatus(isMobileBrowser() ? "blocked" : "allowed");
  }, []);

  if (status === "loading") return null;

  // Allow certain paths even on mobile browser
  if (status === "blocked" && ALLOWED_PATHS.some((p) => pathname.startsWith(p))) {
    return null;
  }

  if (status !== "blocked") return null;

  const handleDownloadAPK = () => {
    const a = document.createElement("a");
    a.href = "/api/download/apk";
    a.download = "bizora.apk";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2.5">
        <div className="h-10 w-10 rounded-xl bg-[#DC2626] flex items-center justify-center">
          <span className="text-white font-bold text-lg">B</span>
        </div>
        <span className="text-xl font-bold text-white tracking-tight">BIZORA</span>
      </div>

      {/* Icon */}
      <div className="mb-6 h-20 w-20 rounded-2xl bg-[#DC2626]/10 border border-[#DC2626]/20 flex items-center justify-center">
        <Smartphone className="h-10 w-10 text-[#DC2626]" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-white mb-3">
        Use the BIZORA App
      </h1>
      <p className="text-neutral-400 text-sm max-w-sm mb-8 leading-relaxed">
        For the best experience on mobile, download the BIZORA app. It works offline, runs faster, and has all premium features.
      </p>

      {/* Download Button */}
      <Button
        onClick={handleDownloadAPK}
        className="bg-[#DC2626] hover:bg-[#b91c1c] text-white px-8 py-3 rounded-xl text-base font-medium h-auto"
      >
        <Download className="mr-2 h-5 w-5" />
        Download Android App
      </Button>

      <p className="mt-3 text-xs text-neutral-500">
        Free download • Works offline • Premium ready
      </p>

      {/* Features */}
      <div className="mt-10 grid grid-cols-3 gap-6 max-w-sm">
        {[
          { icon: Zap, label: "Faster" },
          { icon: Wifi, label: "Offline" },
          { icon: Shield, label: "Secure" },
        ].map((f) => (
          <div key={f.label} className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-neutral-800 flex items-center justify-center">
              <f.icon className="h-5 w-5 text-neutral-400" />
            </div>
            <span className="text-xs text-neutral-500">{f.label}</span>
          </div>
        ))}
      </div>

      {/* Help link */}
      <p className="mt-10 text-xs text-neutral-600">
        Need help?{" "}
        <a href="https://bizora-sigma.vercel.app/help" className="text-[#DC2626] hover:underline">
          Contact support
        </a>
      </p>
    </div>
  );
}
