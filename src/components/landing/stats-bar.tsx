"use client";

import { AnimatedCounter } from "./animated-counter";
import { ScrollReveal } from "./scroll-reveal";

const stats = [
  { label: "Bills Generated", target: 5000, prefix: "", suffix: "+" },
  { label: "Businesses Trust Us", target: 500, prefix: "", suffix: "+" },
  { label: "Transactions Tracked", target: 2, prefix: "₹", suffix: "Cr+" },
  { label: "Uptime", target: 99, prefix: "", suffix: ".9%" },
];

export function StatsBar() {
  return (
    <section className="relative py-24 px-4 sm:px-6 bg-[#0a0a0a] border-y border-white/5 overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#DC2626]/[0.02] to-transparent" />

      <div className="relative max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center relative">
                {/* Red accent dot */}
                <div className="w-1 h-1 bg-[#DC2626] rounded-full mx-auto mb-4" />

                <p className="text-5xl sm:text-6xl font-bold tracking-[-0.03em] text-white mb-3 tabular-nums">
                  <AnimatedCounter
                    target={stat.target}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </p>
                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.2em]">
                  {stat.label}
                </p>

                {/* Divider between items (except last) */}
                {i < stats.length - 1 && (
                  <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-white/5" />
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
