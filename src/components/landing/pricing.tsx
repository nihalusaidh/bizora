"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

type BillingCycle = "monthly" | "yearly";

const plans = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    desc: "Perfect for small shops getting started",
    features: [
      "50 invoices/month",
      "Up to 50 products",
      "Basic billing & POS",
      "Basic inventory",
      "Basic expenses",
      "Basic reports",
    ],
    cta: "Start Free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Gold",
    price: { monthly: 399, yearly: 3990 },
    desc: "For growing businesses that need more",
    features: [
      "Unlimited invoices",
      "Unlimited products",
      "Advanced inventory",
      "Business Intelligence",
      "AI Copilot (50 queries)",
      "Customer Intelligence",
      "Smart Discount Advisor",
      "Priority support",
    ],
    cta: "Go Gold",
    href: "/signup?plan=gold",
    highlight: true,
  },
  {
    name: "Diamond",
    price: { monthly: 699, yearly: 6990 },
    desc: "Full power for serious businesses",
    features: [
      "Everything in Gold",
      "Unlimited AI queries",
      "Multi-branch support",
      "Business Simulator",
      "Advanced forecasting",
      "API access",
      "Dedicated support",
      "White-label option",
    ],
    cta: "Go Diamond",
    href: "/signup?plan=diamond",
    highlight: false,
  },
];

export function Pricing() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <section id="pricing" className="relative py-28 px-4 sm:px-6 bg-neutral-50 overflow-hidden">
      {/* Top accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-neutral-200" />

      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-[#DC2626] text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              Simple Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] text-[#0a0a0a] mb-4">
              Start free. Upgrade when ready.
            </h2>
            <p className="text-neutral-400 text-lg font-light">
              No hidden fees. No surprises. Cancel anytime.
            </p>
          </div>
        </ScrollReveal>

        {/* Toggle */}
        <ScrollReveal delay={100}>
          <div className="flex items-center justify-center mb-14">
            <div className="inline-flex items-center rounded-xl border border-neutral-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setCycle("monthly")}
                className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  cycle === "monthly"
                    ? "bg-[#0a0a0a] text-white shadow-md"
                    : "text-neutral-400 hover:text-[#0a0a0a]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setCycle("yearly")}
                className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  cycle === "yearly"
                    ? "bg-[#0a0a0a] text-white shadow-md"
                    : "text-neutral-400 hover:text-[#0a0a0a]"
                }`}
              >
                Yearly
                <span className="ml-1.5 text-xs text-[#DC2626] font-bold">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Cards */}
        <div className="grid sm:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => {
            const price =
              cycle === "monthly" ? plan.price.monthly : plan.price.yearly;
            const perMonth =
              cycle === "yearly" && plan.price.yearly > 0
                ? Math.round(plan.price.yearly / 12)
                : plan.price.monthly;

            return (
              <ScrollReveal key={plan.name} delay={200 + i * 100} scale>
                <div
                  className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-500 h-full ${
                    plan.highlight
                      ? "border-[#DC2626] bg-[#0a0a0a] text-white shadow-2xl shadow-[#DC2626]/10 scale-[1.03] z-10"
                      : "border-neutral-200 bg-white text-[#0a0a0a] hover:shadow-xl hover:-translate-y-1"
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#DC2626] px-5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white shadow-lg shadow-[#DC2626]/20">
                      Most Popular
                    </span>
                  )}

                  <p
                    className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${
                      plan.highlight ? "text-white/30" : "text-neutral-400"
                    }`}
                  >
                    {plan.name}
                  </p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-5xl font-bold tracking-[-0.03em]">
                      ₹{price === 0 ? "0" : perMonth.toLocaleString("en-IN")}
                    </span>
                    <span
                      className={`text-sm ${
                        plan.highlight ? "text-white/30" : "text-neutral-400"
                      }`}
                    >
                      {price === 0 ? "/forever" : "/month"}
                    </span>
                  </div>
                  {cycle === "yearly" && plan.price.yearly > 0 && (
                    <p
                      className={`text-xs mt-1 ${
                        plan.highlight ? "text-white/20" : "text-neutral-400"
                      }`}
                    >
                      ₹{plan.price.yearly.toLocaleString("en-IN")}/year
                    </p>
                  )}
                  <p
                    className={`mt-3 text-sm font-light ${
                      plan.highlight ? "text-white/40" : "text-neutral-400"
                    }`}
                  >
                    {plan.desc}
                  </p>

                  <hr
                    className={`my-7 ${
                      plan.highlight ? "border-white/10" : "border-neutral-100"
                    }`}
                  />

                  <ul className="flex flex-1 flex-col gap-3.5 mb-8">
                    {plan.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2.5 text-sm leading-snug"
                      >
                        <Check
                          size={16}
                          className={`mt-0.5 shrink-0 ${
                            plan.highlight ? "text-[#DC2626]" : "text-[#0a0a0a]"
                          }`}
                        />
                        <span
                          className={
                            plan.highlight ? "text-white/60 font-light" : "text-neutral-500"
                          }
                        >
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`block w-full rounded-xl py-3.5 text-center text-sm font-semibold transition-all duration-300 ${
                      plan.highlight
                        ? "bg-[#DC2626] text-white hover:bg-[#B91C1C] shadow-lg shadow-[#DC2626]/20 hover:shadow-xl hover:shadow-[#DC2626]/30"
                        : "border border-[#0a0a0a] bg-transparent text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
