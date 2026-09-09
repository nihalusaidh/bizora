"use client";

import Link from "next/link";
import { ArrowRight, Smartphone, Monitor, Globe } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-[#0a0a0a] text-white overflow-hidden">
      {/* Layered background effects */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />

        {/* Film grain */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }} />

        {/* Main red glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#DC2626]/[0.04] rounded-full blur-[150px] animate-pulse" />

        {/* Floating orbs */}
        <div className="absolute top-[20%] left-[15%] w-2 h-2 bg-[#DC2626]/30 rounded-full animate-[float_6s_ease-in-out_infinite]" />
        <div className="absolute top-[40%] right-[10%] w-1.5 h-1.5 bg-white/10 rounded-full animate-[float_8s_ease-in-out_infinite_1s]" />
        <div className="absolute bottom-[30%] left-[25%] w-1 h-1 bg-[#DC2626]/20 rounded-full animate-[float_7s_ease-in-out_infinite_2s]" />
        <div className="absolute top-[60%] right-[20%] w-2.5 h-2.5 bg-white/5 rounded-full animate-[float_9s_ease-in-out_infinite_0.5s]" />
        <div className="absolute top-[15%] right-[30%] w-1 h-1 bg-[#DC2626]/15 rounded-full animate-[float_5s_ease-in-out_infinite_3s]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center pt-28 pb-16">
        {/* Badge */}
        <ScrollReveal delay={300}>
          <div className="inline-flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.08] text-white/40 text-[11px] font-semibold px-5 py-2 rounded-full mb-12 backdrop-blur-sm tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DC2626] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DC2626]" />
            </span>
            BUSINESS OPERATING SYSTEM FOR INDIA
          </div>
        </ScrollReveal>

        {/* Main heading - massive staggered */}
        <div className="mb-8">
          <ScrollReveal delay={500}>
            <h1 className="text-[3.5rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[7rem] font-bold tracking-[-0.04em] leading-[0.95]">
              Know what happened.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={700}>
            <h1 className="text-[3.5rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[7rem] font-bold tracking-[-0.04em] leading-[0.95] mt-2">
              Know what to{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-[#DC2626]">do next.</span>
                <span className="absolute bottom-1 left-0 right-0 h-[3px] bg-[#DC2626]/40 rounded-full" />
              </span>
            </h1>
          </ScrollReveal>
        </div>

        {/* Subtitle */}
        <ScrollReveal delay={900}>
          <p className="text-base sm:text-lg md:text-xl text-white/30 max-w-2xl mx-auto mb-14 leading-relaxed font-light">
            Billing, inventory, customers, expenses, analytics and AI — in one
            simple platform built for Indian businesses.
          </p>
        </ScrollReveal>

        {/* CTAs */}
        <ScrollReveal delay={1100}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              href="/signup"
              className="group relative w-full sm:w-auto bg-[#DC2626] text-white px-9 py-4.5 text-base font-semibold rounded-xl hover:bg-[#B91C1C] transition-all duration-300 flex items-center justify-center gap-2.5 overflow-hidden shadow-[0_0_40px_-10px_rgba(220,38,38,0.3)] hover:shadow-[0_0_60px_-10px_rgba(220,38,38,0.5)]"
            >
              <span className="relative z-10">Start Free</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/#features"
              className="w-full sm:w-auto border border-white/15 text-white/70 px-9 py-4.5 text-base font-semibold rounded-xl hover:bg-white/[0.04] hover:border-white/25 hover:text-white transition-all duration-300"
            >
              See Features
            </Link>
          </div>
        </ScrollReveal>

        {/* Platform badges */}
        <ScrollReveal delay={1300}>
          <div className="flex items-center justify-center gap-7 text-[11px] font-medium text-white/20 tracking-wider">
            <span className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" /> WEB
            </span>
            <span className="w-1 h-1 bg-white/10 rounded-full" />
            <span className="flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5" /> DESKTOP
            </span>
            <span className="w-1 h-1 bg-white/10 rounded-full" />
            <span className="flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5" /> ANDROID
            </span>
          </div>
        </ScrollReveal>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/15">
        <span className="text-[9px] font-semibold tracking-[0.25em] uppercase">
          Scroll to explore
        </span>
        <div className="w-[1px] h-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent animate-[scrollLine_2s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  );
}
