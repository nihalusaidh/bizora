"use client";

import { useState, useEffect } from "react";

export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setVisible(false), 400);
          return 100;
        }
        const increment = prev < 70 ? Math.random() * 15 + 5 : Math.random() * 5 + 1;
        return Math.min(prev + increment, 100);
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col items-center justify-center transition-opacity duration-500 ${
        progress >= 100 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="mb-8">
        <span className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
          BIZO<span className="text-[#DC2626]">RA</span>
        </span>
      </div>

      <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-[#DC2626] rounded-full transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-white/40 text-xs font-mono tracking-widest">
        {Math.round(progress)}%
      </p>
    </div>
  );
}
