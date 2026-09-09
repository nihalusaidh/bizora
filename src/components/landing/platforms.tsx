"use client";

import { Smartphone, Globe, Monitor, ArrowRight } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import { GraphBackground } from "./graph-background";

const platforms = [
  {
    name: "Android",
    desc: "Billing, inventory, POS & more on your phone.",
    icon: Smartphone,
    cta: "Download App",
    href: "/download",
  },
  {
    name: "Web",
    desc: "Access Bizora from any browser, anywhere.",
    icon: Globe,
    cta: "Open Bizora",
    href: "/login",
  },
  {
    name: "Desktop",
    desc: "Full-featured app for Windows workstations.",
    icon: Monitor,
    cta: "Download for Windows",
    href: "/download",
  },
];

export function Platforms() {
  return (
    <section className="relative py-28 px-4 sm:px-6 bg-[#0a0a0a] overflow-hidden">
      {/* Animated graph background */}
      <GraphBackground />

      {/* Top accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-gradient-to-b from-transparent to-white/5" />

      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-20">
            <p className="text-[#DC2626] text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              Available Everywhere
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] text-white">
              Your business, on any device.
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-3 gap-6">
          {platforms.map((p, i) => (
            <ScrollReveal key={p.name} delay={i * 120} scale>
              <div className="group relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 text-center hover:border-[#DC2626]/30 transition-all duration-500 h-full flex flex-col overflow-hidden">
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#DC2626]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex flex-col items-center flex-1">
                  <div className="w-16 h-16 bg-[#DC2626]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#DC2626]/20 group-hover:scale-110 transition-all duration-500">
                    <p.icon className="w-8 h-8 text-[#DC2626]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {p.name}
                  </h3>
                  <p className="text-sm text-white/30 leading-relaxed mb-8 flex-1 font-light">
                    {p.desc}
                  </p>
                  <a
                    href={p.href}
                    className="inline-flex items-center justify-center gap-2 bg-[#DC2626] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#B91C1C] transition-all duration-300 group-hover:shadow-[0_0_30px_-5px_rgba(220,38,38,0.3)] w-full"
                  >
                    {p.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
