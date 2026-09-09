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
    <section className="py-24 px-4 sm:px-6 bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto text-center">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/50 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
            <Bot className="w-3.5 h-3.5" />
            AI-Powered
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Ask your business{" "}
            <span className="text-[#DC2626]">anything.</span>
          </h2>
          <p className="text-white/40 text-lg mb-12 max-w-xl mx-auto">
            Your data, decoded. Ask questions in plain language and get instant
            answers powered by AI.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 text-left max-w-2xl mx-auto backdrop-blur-sm">
            <div className="space-y-3">
              {aiQuestions.map((q, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-white/[0.03] rounded-xl px-4 py-3 border border-white/5"
                >
                  <Bot className="w-4 h-4 text-[#DC2626] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-white/60">{q}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
