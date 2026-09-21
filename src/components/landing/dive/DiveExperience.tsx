"use client";

import { useRef } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { STATIONS } from "./stations";
import { useDive, stationProgress, cardFlight } from "./use-dive";
import { Starfield } from "./Starfield";
import { Jet } from "./Jet";
import { Hud } from "./Hud";
import { StationCard } from "./StationCard";
import { Footer } from "@/components/landing/footer";

const VH_PER_STATION = 170;

/** Deep-space dive: scrolling flies you FORWARD through feature stations. */
export function DiveExperience() {
  const trackRef = useRef<HTMLDivElement>(null);
  const n = STATIONS.length;
  const { progress, velocity, station, mounted, reduceMotion } = useDive(trackRef, n);

  // Reduced motion / no-JS-first-paint: calm stacked story, same content.
  if (reduceMotion) {
    return (
      <div className="bg-[#0a0a0a] px-5 py-16 text-white">
        <div className="mx-auto max-w-3xl space-y-10">
          {STATIONS.map((s) => (
            <div key={s.kicker} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <p className="font-mono text-[11px] font-bold tracking-[0.3em] text-[#ff9d6b]">{s.kicker}</p>
              <h2 className="mt-2 text-2xl font-extrabold">{s.title}</h2>
              <p className="mt-1 text-sm text-white/65">{s.accent}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-white/85">
                {s.bullets.map((b) => (
                  <li key={b}>• {b}</li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-col gap-2.5">
            <Link href="/download" className="rounded-xl bg-[#DC2626] px-6 py-3 text-center text-sm font-extrabold text-white">
              Download the App
            </Link>
            <Link href="/signup?plan=gold" className="rounded-xl border border-white/25 px-6 py-3 text-center text-sm font-bold text-white">
              Go Pro ₹399/mo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={trackRef} className="relative bg-[#0a0a0a]" style={{ height: `${n * VH_PER_STATION}vh` }}>
      <div className="sticky top-0 h-dvh overflow-hidden">
        {mounted && <Starfield velocity={velocity} station={station} stations={n} />}
        <Hud progress={progress} velocity={velocity} station={station} stations={n} current={STATIONS[station]?.kicker ?? ""} />

        {STATIONS.map((s, i) => {
          const q = stationProgress(progress, i, n);
          if (q <= 0 || q >= 1) return null;
          const flight = cardFlight(q);
          const active = q > 0.15 && q < 0.75;
          return (
            <div key={s.kicker} className="absolute inset-0 z-10 flex items-center pb-[6%] pt-[8%]">
              <StationCard station={s} flight={flight} active={active} progress={q} />
            </div>
          );
        })}

        <Jet velocity={velocity} />

        {/* Docking hint near the end */}
        {progress > 0.965 && (
          <div className="absolute inset-x-0 bottom-[16%] z-20 text-center animate-fade-in">
            <Link href="/download" className="inline-flex items-center gap-2 rounded-full bg-[#DC2626] px-6 py-3 text-sm font-extrabold text-white shadow-[0_0_30px_-6px_rgba(220,38,38,0.9)]">
              <Download className="h-4 w-4" /> Dock & Download
            </Link>
          </div>
        )}
      </div>

      {/* Below the dive: finale + footer scroll normally */}
      <div className="relative z-10 border-t border-white/10 bg-[#0a0a0a] px-5 py-14 text-center text-white">
        <p className="font-mono text-[11px] font-bold tracking-[0.35em] text-[#ff9d6b]">MISSION COMPLETE</p>
        <h2 className="mx-auto mt-2 max-w-xl text-3xl font-extrabold sm:text-4xl">Your shop, at warp speed.</h2>
        <div className="mx-auto mt-6 flex max-w-md flex-col gap-2.5">
          <Link href="/download" className="rounded-xl bg-[#DC2626] px-6 py-3 text-sm font-extrabold text-white">
            Download the App
          </Link>
          <Link href="/signup?plan=gold" className="rounded-xl border border-white/25 px-6 py-3 text-sm font-bold text-white">
            Start Free — Go Pro ₹399/mo
          </Link>
        </div>
      </div>
      <div className="relative z-10 bg-[#0a0a0a]">
        <Footer />
      </div>
    </div>
  );
}
