"use client";

import { Bot } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const aiQuestions = [
  "What was my best-selling product last month?",
  "Who are my top 5 customers by revenue?",
  "How much profit did I make this week?",
  "Which expenses can I cut?",
  "What's my outstanding payment situation?",
];

export function AiSection() {
  return (
    <section className="relative py-28 px-4 sm:px-6 bg-[#0a0a0a] text-white overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-gradient-to-b from-transparent to-white/5" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-gradient-to-t from-transparent to-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DC2626]/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.08] text-white/40 text-[11px] font-semibold px-5 py-2 rounded-full mb-10 backdrop-blur-sm tracking-wide">
            <Bot className="w-3.5 h-3.5" />
            AI-POWERED
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.03em] mb-5">
            Ask your business{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#DC2626]">anything.</span>
              <span className="absolute bottom-1 left-0 right-0 h-[3px] bg-[#DC2626]/40 rounded-full" />
            </span>
          </h2>
          <p className="text-white/30 text-lg mb-14 max-w-xl mx-auto font-light">
            Your data, decoded. Ask questions in plain language and get instant
            answers powered by AI.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 sm:p-8 text-left max-w-2xl mx-auto backdrop-blur-sm relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#DC2626]/[0.05] rounded-full blur-[60px]" />

            <div className="relative space-y-3">
              {aiQuestions.map((q, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-white/[0.02] rounded-xl px-5 py-4 border border-white/[0.04] hover:border-[#DC2626]/20 transition-colors duration-300"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#DC2626]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-[#DC2626]" />
                  </div>
                  <span className="text-sm text-white/50 font-light">{q}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
