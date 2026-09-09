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
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] mb-4">
              Billing is where Bizora{" "}
              <span className="text-[#DC2626]">starts.</span>
            </h2>
            <p className="text-neutral-500 text-lg mb-16 max-w-xl mx-auto">
              But it&apos;s not where you stop. One platform that takes you from
              transaction to transformation.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-0">
              {steps.map((step, i) => (
                <div key={step.label} className="flex items-center">
                  <div className="flex flex-col items-center px-4 sm:px-6 py-4">
                    <span className="text-xs font-bold text-[#DC2626] tracking-widest mb-1">
                      {step.label}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {step.desc}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-6 h-[1px] bg-neutral-200 hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 sm:px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-[#DC2626] text-sm font-semibold uppercase tracking-widest mb-3">
                Everything You Need
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0a0a0a]">
                Built for how you actually work.
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 100}>
                <div
                  onMouseEnter={() => setHoveredFeature(i)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className={`group bg-white border rounded-2xl p-8 transition-all duration-300 cursor-default h-full ${
                    hoveredFeature === i
                      ? "border-[#DC2626] shadow-lg shadow-[#DC2626]/5"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors ${
                      hoveredFeature === i
                        ? "bg-[#DC2626] text-white"
                        : "bg-neutral-100 text-[#0a0a0a]"
                    }`}
                  >
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-[#0a0a0a]">
                    {f.title}
                  </h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
