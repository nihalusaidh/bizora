"use client";

import {
  Zap,
  Package,
  Users,
  Receipt,
  BarChart3,
  Bot,
} from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import { useState } from "react";

const steps = [
  { label: "BILL", desc: "Create invoices instantly" },
  { label: "TRACK", desc: "Monitor every transaction" },
  { label: "UNDERSTAND", desc: "See patterns in your data" },
  { label: "PREDICT", desc: "Forecast trends with AI" },
  { label: "ACT", desc: "Make data-driven decisions" },
  { label: "GROW", desc: "Scale with confidence" },
];

const features = [
  {
    icon: Zap,
    title: "Fast Billing",
    desc: "Generate bills in seconds. GST-compliant. Multi-format. Zero friction.",
  },
  {
    icon: Package,
    title: "Inventory Management",
    desc: "Real-time stock tracking. Low-stock alerts. Barcode support.",
  },
  {
    icon: Users,
    title: "Customer Management",
    desc: "Complete customer profiles. Purchase history. Payment tracking.",
  },
  {
    icon: Receipt,
    title: "Expense Tracking",
    desc: "Log every rupee. Categorize expenses. See where money goes.",
  },
  {
    icon: BarChart3,
    title: "Business Intelligence",
    desc: "Dashboards that tell you what happened and what to do next.",
  },
  {
    icon: Bot,
    title: "AI Copilot",
    desc: "Ask questions in plain language. Get answers in seconds.",
  },
];

export function Features() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <>
      {/* Problem → Solution Flow */}
      <section className="relative py-28 px-4 sm:px-6 bg-white overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-gradient-to-b from-transparent to-neutral-200" />

        <div className="max-w-5xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-[#DC2626] text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              From Transaction to Transformation
            </p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.03em] text-[#0a0a0a] mb-5">
              Billing is where Bizora{" "}
              <span className="relative inline-block">
                <span className="relative z-10">starts.</span>
                <span className="absolute bottom-1 left-0 right-0 h-[3px] bg-[#DC2626]/20 rounded-full" />
              </span>
            </h2>
            <p className="text-neutral-400 text-lg mb-20 max-w-xl mx-auto font-light">
              But it&apos;s not where you stop. One platform that takes you from
              transaction to transformation.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-0 relative">
              {steps.map((step, i) => (
                <div key={step.label} className="flex items-center">
                  <div className="flex flex-col items-center px-4 sm:px-6 py-4 group">
                    <span className="text-[11px] font-bold text-[#DC2626] tracking-[0.15em] mb-1.5 group-hover:tracking-[0.2em] transition-all duration-300">
                      {step.label}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-medium">
                      {step.desc}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-8 h-[1px] bg-neutral-200 hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative py-28 px-4 sm:px-6 bg-neutral-50 overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-[#DC2626]" />

        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-20">
              <p className="text-[#DC2626] text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                Everything You Need
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] text-[#0a0a0a]">
                Built for how you actually work.
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 80} scale>
                <div
                  onMouseEnter={() => setHoveredFeature(i)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className={`group relative bg-white border rounded-2xl p-8 transition-all duration-500 cursor-default h-full overflow-hidden ${
                    hoveredFeature === i
                      ? "border-[#DC2626] shadow-xl shadow-[#DC2626]/[0.06] -translate-y-1"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  {/* Hover glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-[#DC2626]/[0.02] to-transparent transition-opacity duration-500 ${
                    hoveredFeature === i ? "opacity-100" : "opacity-0"
                  }`} />

                  <div className="relative z-10">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-500 ${
                        hoveredFeature === i
                          ? "bg-[#DC2626] text-white scale-110"
                          : "bg-neutral-100 text-[#0a0a0a]"
                      }`}
                    >
                      <f.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-[#0a0a0a]">
                      {f.title}
                    </h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
