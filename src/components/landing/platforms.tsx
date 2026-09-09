"use client";

import { Smartphone, Globe, Monitor, ArrowRight } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

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
    <section className="py-24 px-4 sm:px-6 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-[#DC2626] text-sm font-semibold uppercase tracking-widest mb-3">
              Available Everywhere
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Your business, on any device.
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-3 gap-6">
          {platforms.map((p, i) => (
            <ScrollReveal key={p.name} delay={i * 100}>
              <div className="group bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center hover:border-[#DC2626]/30 transition-all duration-300 h-full flex flex-col">
                <div className="w-14 h-14 bg-[#DC2626]/10 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#DC2626]/20 transition-colors">
                  <p.icon className="w-7 h-7 text-[#DC2626]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {p.name}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed mb-6 flex-1">
                  {p.desc}
                </p>
                <a
                  href={p.href}
                  className="inline-flex items-center justify-center gap-2 bg-[#DC2626] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#B91C1C] transition-colors"
                >
                  {p.cta}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
