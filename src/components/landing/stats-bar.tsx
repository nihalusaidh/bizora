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
    <section className="py-20 px-4 sm:px-6 bg-[#0a0a0a] border-y border-white/5">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-2">
                  <AnimatedCounter
                    target={stat.target}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </p>
                <p className="text-xs font-semibold text-white/30 uppercase tracking-[0.15em]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
