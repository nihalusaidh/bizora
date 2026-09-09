"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

export function FinalCta() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto text-center">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Start running your business{" "}
            <span className="text-[#DC2626]">smarter.</span>
          </h2>
          <p className="text-white/40 text-lg mb-10 max-w-lg mx-auto">
            Join hundreds of businesses already using Bizora to take control of
            their operations.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-[#DC2626] text-white px-10 py-4 text-base font-semibold rounded-xl hover:bg-[#B91C1C] transition-all duration-300 shadow-lg shadow-[#DC2626]/20"
          >
            Start Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
