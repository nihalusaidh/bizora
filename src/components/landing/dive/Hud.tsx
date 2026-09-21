"use client";

import { cn } from "@/lib/utils";

/** Cockpit HUD: depth bar, station dots, velocity readout. */
export function Hud({
  progress,
  velocity,
  station,
  stations,
  current,
}: {
  progress: number;
  velocity: number;
  station: number;
  stations: number;
  current: string;
}) {
  const depth = Math.round(progress * 100);
  const fast = velocity > 0.35;

  return (
    <>
      {/* Top depth bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 px-4 pt-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-white/60">DEPTH</span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#DC2626] to-[#ff7a45]"
              style={{ width: `${depth}%`, transition: "width 120ms linear" }}
            />
          </div>
          <span className="font-mono text-[10px] font-bold text-white/80 tabular-nums">{depth}%</span>
          <span
            className={cn(
              "hidden font-mono text-[10px] font-bold tracking-[0.2em] sm:inline",
              fast ? "text-[#ff7a45]" : "text-white/40"
            )}
          >
            {fast ? "▲ WARP" : "CRUISE"}
          </span>
        </div>
      </div>

      {/* Side station dots */}
      <div className="pointer-events-none absolute left-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2.5 sm:flex">
        {Array.from({ length: stations }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "rounded-full transition-all duration-200",
              i < station && "h-1.5 w-1.5 bg-[#DC2626]/50",
              i === station && "h-2.5 w-2.5 bg-[#DC2626] shadow-[0_0_12px_2px_rgba(220,38,38,0.8)]",
              i > station && "h-1.5 w-1.5 bg-white/20"
            )}
          />
        ))}
      </div>

      {/* Current sector label */}
      <div className="pointer-events-none absolute bottom-[24%] left-0 right-0 z-10 text-center">
        <p key={current} className="animate-fade-in font-mono text-[11px] font-bold tracking-[0.35em] text-white/45">
          ▸ {current} ◂
        </p>
      </div>
    </>
  );
}
