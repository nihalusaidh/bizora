"use client";

/**
 * Progress-driven SVG growth visuals. `p` 0→1 draws the chart as you dive.
 * Pure SVG + opacity — no chart library on the landing bundle.
 */

const LINE = "M0,86 C30,80 45,72 60,60 C75,48 85,44 100,34 C115,24 125,22 140,16 C155,10 165,10 180,6";

export function SalesLine({ p }: { p: number }) {
  return (
    <svg viewBox="0 0 180 96" className="h-28 w-full sm:h-32" aria-hidden>
      <defs>
        <linearGradient id="dive-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#DC2626" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ff7a45" />
        </linearGradient>
        <linearGradient id="dive-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DC2626" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[24, 48, 72].map((y) => (
        <line key={y} x1="0" y1={y} x2="180" y2={y} stroke="#fff" strokeOpacity="0.08" strokeDasharray="3 4" />
      ))}
      <path d={`${LINE} L180,96 L0,96 Z`} fill="url(#dive-fill)" opacity={Math.min(p * 1.4, 1)} />
      <path
        d={LINE}
        fill="none"
        stroke="url(#dive-line)"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - Math.min(p * 1.15, 1)}
      />
      <circle cx={180 * Math.min(p, 1)} cy={6} r="4" fill="#ff7a45" opacity={p > 0.9 ? 1 : 0}>
        <animate attributeName="r" values="4;6;4" dur="1.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

const BARS = [34, 48, 42, 60, 55, 72, 88];

export function MonthBars({ p }: { p: number }) {
  return (
    <div className="flex h-24 items-end gap-1.5 sm:h-28" aria-hidden>
      {BARS.map((h, i) => {
        const on = p * (BARS.length + 1) > i + 0.5;
        return (
          <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-[#7f1d1d] to-[#ff7a45]"
            style={{
              height: `${on ? h : 8}%`,
              opacity: on ? 1 : 0.25,
              transition: "height 300ms ease-out, opacity 300ms",
            }}
          />
        );
      })}
    </div>
  );
}

export function ProfitDonut({ p }: { p: number }) {
  const C = 2 * Math.PI * 40;
  const segs = [
    { frac: 0.42, color: "#DC2626", label: "Profit" },
    { frac: 0.33, color: "#525252", label: "Stock" },
    { frac: 0.25, color: "#d4d4d4", label: "Tax+Exp" },
  ];
  let acc = 0;
  return (
    <div className="flex items-center gap-4" aria-hidden>
      <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#fff" strokeOpacity="0.08" strokeWidth="12" />
        {segs.map((s, i) => {
          const start = acc;
          acc += s.frac;
          const shown = Math.min(Math.max((p * 1.3 - i * 0.12) / s.frac, 0), 1);
          return (
            <circle
              key={s.label}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={s.color}
              strokeWidth="12"
              strokeDasharray={`${s.frac * C * shown} ${C}`}
              strokeDashoffset={-start * C}
              strokeLinecap="butt"
              style={{ transition: "stroke-dasharray 200ms linear" }}
            />
          );
        })}
      </svg>
      <div className="space-y-1.5">
        {segs.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs text-white/70">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
