"use client";

import Link from "next/link";
import { Check, Download, Rocket } from "lucide-react";
import type { Station } from "./stations";
import { SalesLine, MonthBars, ProfitDonut } from "./GrowthChart";
import { Counter } from "./Counter";

/** Small floating mock visuals per station — pure divs/SVG, no images. */
function Visual({ kind, p, active }: { kind: Station["visual"]; p: number; active: boolean }) {
  if (kind === "bars") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
        <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.2em] text-white/50">STOCK HEALTH</p>
        <MonthBars p={p} />
      </div>
    );
  }
  if (kind === "donut") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
        <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.2em] text-white/50">WHERE ₹ GOES</p>
        <ProfitDonut p={p} />
      </div>
    );
  }
  if (kind === "growth") {
    return (
      <div className="rounded-2xl border border-[#DC2626]/30 bg-white/[0.04] p-4 backdrop-blur-sm">
        <div className="mb-1 flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-white/50">YOUR SALES</p>
            <p className="text-2xl font-extrabold text-white">
              ₹<Counter to={4.2} decimals={1} suffix="L" active={active} />
            </p>
          </div>
          <p className="rounded-full bg-[#DC2626] px-2.5 py-1 text-xs font-extrabold text-white">
            +<Counter to={38} suffix="%" active={active} />
          </p>
        </div>
        <SalesLine p={p} />
        <p className="mt-2 text-center text-xs font-bold text-[#ff9d6b]">
          Unlock this graph for YOUR shop → Go Pro
        </p>
      </div>
    );
  }
  if (kind === "proof") {
    const stats = [
      { v: 10, suffix: "s", label: "per bill" },
      { v: 100, suffix: "%", label: "offline-ready" },
      { v: 24, suffix: "/7", label: "your data backed up" },
    ];
    return (
      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center backdrop-blur-sm">
            <p className="text-xl font-extrabold text-white">
              <Counter to={s.v} suffix={s.suffix} active={active} />
            </p>
            <p className="mt-0.5 text-[10px] leading-tight text-white/55">{s.label}</p>
          </div>
        ))}
      </div>
    );
  }
  if (kind === "bill") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.97] p-4 text-[#0a0a0a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-dashed border-neutral-300 pb-2">
          <p className="text-xs font-extrabold">SHARMA ELECTRONICS</p>
          <p className="font-mono text-[10px] text-neutral-500">INV-2041</p>
        </div>
        {[["boAt Rockerz 450 × 2", "₹3,598"], ["Noise ColorFit × 1", "₹4,999"], ["GST (18%)", "₹1,547"]].map(([n, a]) => (
          <div key={n} className="flex justify-between py-1.5 text-xs font-medium">
            <span>{n}</span>
            <span className="font-bold tabular-nums">{a}</span>
          </div>
        ))}
        <div className="mt-1 flex justify-between rounded-lg bg-[#DC2626] px-3 py-2 text-sm font-extrabold text-white">
          <span>Total</span>
          <span>₹10,144 • UPI ✓</span>
        </div>
      </div>
    );
  }
  if (kind === "ledger") {
    return (
      <div className="space-y-2">
        {[
          ["Rahul Sharma", "+₹2,400 collected", true],
          ["Priya Patel", "₹5,200 due • reminded", false],
          ["Amit Kumar", "+₹18,500 collected", true],
        ].map(([n, d, good]) => (
          <div key={n as string} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DC2626]/15 font-extrabold text-[#ff9d6b]">
              {(n as string).slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{n}</p>
              <p className={`text-xs ${good ? "text-emerald-300" : "text-amber-300"}`}>{d}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (kind === "plans") {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4 text-center backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-white/60">Free</p>
          <p className="mt-1 text-3xl font-extrabold text-white">₹0</p>
          <p className="mt-1 text-[11px] text-white/55">Billing • Stock • Khata</p>
          <Link href="/signup" className="mt-3 block rounded-lg border border-white/25 py-2 text-xs font-bold text-white">
            Start Free
          </Link>
        </div>
        <div className="rounded-2xl border-2 border-[#DC2626] bg-[#DC2626]/10 p-4 text-center shadow-[0_0_40px_-8px_rgba(220,38,38,0.7)] backdrop-blur-sm">
          <p className="mx-auto -mt-7 mb-1 w-fit rounded-full bg-[#DC2626] px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
            Pro • Most thrust
          </p>
          <p className="text-3xl font-extrabold text-white">₹399<span className="text-xs font-medium text-white/60">/mo</span></p>
          <p className="mt-1 text-[11px] text-white/70">AI • Growth graphs • Everything unlimited</p>
          <Link href="/signup?plan=gold" className="mt-3 block rounded-lg bg-[#DC2626] py-2 text-xs font-extrabold text-white">
            Go Pro
          </Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center opacity-70 backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-white/50">Diamond</p>
          <p className="mt-1 text-3xl font-extrabold text-white/70">₹699</p>
          <p className="mt-1 text-[11px] text-white/45">Multi-branch • API</p>
          <span className="mt-3 block rounded-lg bg-white/10 py-2 text-xs font-bold text-white/50">Coming soon</span>
        </div>
      </div>
    );
  }
  return null;
}

export function StationCard({
  station,
  flight,
  active,
  progress,
}: {
  station: Station;
  flight: { opacity: number; y: number; scale: number };
  active: boolean;
  progress: number;
}) {
  if (station.visual === "hero") {
    return (
      <div className="mx-auto max-w-2xl px-5 text-center" style={{ opacity: flight.opacity, transform: `translateY(${flight.y}px) scale(${flight.scale})` }}>
        <p className="font-mono text-[11px] font-bold tracking-[0.4em] text-[#ff9d6b]">▲ {station.kicker} ▲</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
          Fly deeper into<br />your <span className="text-[#DC2626]">business</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-white/65 sm:text-base">{station.accent}</p>
        <p className="mt-2 font-mono text-[11px] tracking-[0.25em] text-white/40">SCROLL TO DIVE ↓</p>
        {station.cta && (
          <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
            <Link href={station.cta.href} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-6 py-3 text-sm font-extrabold text-white shadow-[0_0_30px_-6px_rgba(220,38,38,0.9)]">
              <Download className="h-4 w-4" /> {station.cta.label}
            </Link>
            {station.cta.secondary && (
              <Link href={station.cta.secondary.href} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-6 py-3 text-sm font-bold text-white">
                <Rocket className="h-4 w-4" /> {station.cta.secondary.label}
              </Link>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5" style={{ opacity: flight.opacity, transform: `translateY(${flight.y}px) scale(${flight.scale})` }}>
      <p className="font-mono text-[11px] font-bold tracking-[0.35em] text-[#ff9d6b]">{station.kicker}</p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">{station.title}</h2>
      <p className="mt-2 max-w-xl text-sm text-white/65 sm:text-base">{station.accent}</p>
      <div className="mt-5 grid items-start gap-4 md:grid-cols-2">
        <ul className="space-y-2.5">
          {station.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm font-medium text-white/90 backdrop-blur-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ff7a45]" />
              {b}
            </li>
          ))}
        </ul>
        <Visual kind={station.visual} p={progress} active={active} />
      </div>
    </div>
  );
}
