"use client";

import { useState, useEffect } from "react";

export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"counting" | "line" | "reveal" | "done">("counting");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setPhase("line"), 200);
          return 100;
        }
        const increment = prev < 60 ? Math.random() * 18 + 8 : Math.random() * 6 + 2;
        return Math.min(prev + increment, 100);
      });
    }, 60);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (phase === "line") {
      setTimeout(() => setPhase("reveal"), 600);
    }
    if (phase === "reveal") {
      setTimeout(() => setPhase("done"), 800);
    }
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ${
        phase === "reveal" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background subtle noise */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
      }} />

      {/* Logo */}
      <div className="relative mb-10">
        <span className="text-5xl sm:text-6xl font-bold tracking-tighter text-white">
          BIZO
          <span className="text-[#DC2626]">RA</span>
        </span>
      </div>

      {/* Percentage */}
      <div className="mb-6">
        <span className="text-white/20 text-8xl sm:text-9xl font-bold tracking-tighter tabular-nums">
          {Math.round(progress).toString().padStart(2, "0")}
        </span>
        <span className="text-[#DC2626] text-3xl font-bold">%</span>
      </div>

      {/* Expanding red line */}
      <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-[#DC2626] transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Bottom text */}
      <p className="absolute bottom-10 text-[10px] font-semibold tracking-[0.3em] text-white/15 uppercase">
        Business Operating System
      </p>
    </div>
  );
}
