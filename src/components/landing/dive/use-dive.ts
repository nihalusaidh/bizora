"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface DiveState {
  /** 0 → 1 across the whole track */
  progress: number;
  /** Smoothed scroll velocity, 0 (still) → ~1+ (fast flick) */
  velocity: number;
  /** Index of the station currently in view */
  station: number;
  mounted: boolean;
  reduceMotion: boolean;
}

/** Scroll progress across a tall track ref, with smoothed velocity. */
export function useDive(trackRef: React.RefObject<HTMLDivElement | null>, stations: number): DiveState {
  const [progress, setProgress] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const last = useRef({ p: 0, t: 0, v: 0 });
  const raf = useRef(0);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const y = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
    const p = total > 0 ? y / total : 0;
    const now = performance.now();
    const dt = Math.max(now - last.current.t, 1);
    const inst = Math.min(Math.abs(p - last.current.p) / (dt / 1000), 3);
    // Ease velocity toward instant value (fast attack, slow release).
    const v = last.current.v + ((inst > last.current.v ? 0.25 : 0.06) * (inst - last.current.v));
    last.current = { p, t: now, v };
    setProgress((prev) => (Math.abs(prev - p) > 0.0005 ? p : prev));
    setVelocity((prev) => (Math.abs(prev - v) > 0.004 ? v : prev));
  }, [trackRef]);

  useEffect(() => {
    setMounted(true);
    setReduceMotion(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
    last.current = { p: -1, t: performance.now(), v: 0 };
    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [measure]);

  const station = Math.min(stations - 1, Math.floor(progress * stations));
  return { progress, velocity, station, mounted, reduceMotion };
}

/** Local 0→1 progress of station i given global progress. */
export function stationProgress(p: number, i: number, n: number): number {
  const start = i / n;
  const q = (p - start) * n;
  return Math.min(Math.max(q, 0), 1);
}

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);

/** Card flight: enter → hold → fly-past-camera (the "deeper" feel). */
export function cardFlight(q: number): { opacity: number; y: number; scale: number } {
  const enter = clamp01(q / 0.28);
  const exit = clamp01((q - 0.62) / 0.38);
  const easeOut = 1 - Math.pow(1 - enter, 3);
  const easeIn = exit * exit;
  return {
    opacity: Math.min(easeOut, 1 - easeIn),
    y: (1 - easeOut) * 70 - easeIn * 140,
    scale: 0.92 + easeOut * 0.08 + easeIn * 0.55,
  };
}
