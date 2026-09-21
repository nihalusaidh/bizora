"use client";

/** Red comet-jet riding bottom-center. Tilts + burns harder with velocity. */
export function Jet({ velocity }: { velocity: number }) {
  const v = Math.min(velocity, 1.5);
  const tilt = Math.max(-14, Math.min(14, (v - 0.15) * 18));
  const flame = 1 + v * 1.6;
  const glow = 0.35 + Math.min(v, 1) * 0.65;

  return (
    <div
      className="pointer-events-none absolute bottom-[7%] left-1/2 z-20"
      style={{ transform: `translateX(-50%) rotate(${tilt}deg)`, transition: "transform 120ms linear" }}
      aria-hidden
    >
      {/* Engine glow */}
      <div
        className="absolute left-1/2 top-full -translate-x-1/2 rounded-full bg-[#DC2626] blur-xl"
        style={{ width: 90 * flame, height: 90 * flame, opacity: glow * 0.5 }}
      />
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        {/* Trail */}
        <path d="M60 108 C 52 84, 52 66, 60 44 C 68 66, 68 84, 60 108" fill="#DC2626" opacity={0.35 + glow * 0.4} />
        <path
          d="M60 100 C 56 84, 56 70, 60 54 C 64 70, 64 84, 60 100"
          fill="#fff"
          opacity={0.5 + glow * 0.4}
          style={{ transform: `scaleY(${flame})`, transformOrigin: "60px 100px" }}
        />
        {/* Hull */}
        <path d="M60 8 C 70 28, 74 48, 60 66 C 46 48, 50 28, 60 8" fill="#f5f5f5" />
        <path d="M60 8 C 66 28, 68 44, 60 60 C 52 44, 54 28, 60 8" fill="#DC2626" />
        {/* Cockpit */}
        <ellipse cx="60" cy="34" rx="5" ry="9" fill="#0a0a0a" />
        {/* Wings */}
        <path d="M52 52 L 30 78 L 50 70 Z" fill="#DC2626" />
        <path d="M68 52 L 90 78 L 70 70 Z" fill="#DC2626" />
        <path d="M52 52 L 38 70 L 50 66 Z" fill="#fff" opacity="0.7" />
        <path d="M68 52 L 82 70 L 70 66 Z" fill="#fff" opacity="0.7" />
      </svg>
    </div>
  );
}
