"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import { GraphBackground } from "./graph-background";

export function FinalCta() {
  return (
    <section className="relative py-32 px-4 sm:px-6 bg-[#0a0a0a] overflow-hidden">
      {/* Animated graph background */}
      <GraphBackground />

      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-gradient-to-b from-transparent to-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DC2626]/[0.03] rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <ScrollReveal>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.03em] text-white mb-6 leading-tight">
            Start running your business{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#DC2626]">smarter.</span>
              <span className="absolute bottom-1 left-0 right-0 h-[3px] bg-[#DC2626]/40 rounded-full" />
            </span>
          </h2>
          <p className="text-white/30 text-lg mb-12 max-w-lg mx-auto font-light">
            Join hundreds of businesses already using Bizora to take control of
            their operations.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <Link
            href="/signup"
            className="group relative inline-flex items-center gap-2.5 bg-[#DC2626] text-white px-12 py-5 text-base font-semibold rounded-xl hover:bg-[#B91C1C] transition-all duration-300 shadow-[0_0_50px_-12px_rgba(220,38,38,0.4)] hover:shadow-[0_0_70px_-12px_rgba(220,38,38,0.6)]"
          >
            Start Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
