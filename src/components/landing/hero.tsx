"use client";

import Link from "next/link";
import { ArrowRight, Smartphone, Monitor, Globe } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-[#0a0a0a] text-white overflow-hidden">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Red glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#DC2626]/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto text-center pt-24 pb-16">
        <ScrollReveal delay={200}>
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/50 text-xs font-semibold px-4 py-2 rounded-full mb-10 backdrop-blur-sm">
            <span className="w-2 h-2 bg-[#DC2626] rounded-full animate-pulse" />
            Business Operating System for India
          </div>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6">
            Know what happened.
            <br />
            <span className="text-[#DC2626]">Know what to do next.</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={600}>
          <p className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed">
            Billing, inventory, customers, expenses, analytics and AI — in one
            simple Business Operating System built for Indian businesses.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={800}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-[#DC2626] text-white px-8 py-4 text-base font-semibold rounded-xl hover:bg-[#B91C1C] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#DC2626]/20"
            >
              Start Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/#features"
              className="w-full sm:w-auto border border-white/20 text-white px-8 py-4 text-base font-semibold rounded-xl hover:bg-white/5 transition-all duration-300"
            >
              See Features
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={1000}>
          <div className="flex items-center justify-center gap-6 text-xs font-medium text-white/30">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Web
            </span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5" /> Desktop
            </span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" /> Android
            </span>
          </div>
        </ScrollReveal>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">
          Scroll down
        </span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-white/20 to-transparent" />
      </div>
    </section>
  );
}
