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
    <section id="pricing" className="py-24 px-4 sm:px-6 bg-neutral-50">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="text-[#DC2626] text-sm font-semibold uppercase tracking-widest mb-3">
              Simple Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0a0a0a] mb-4">
              Start free. Upgrade when ready.
            </h2>
            <p className="text-neutral-500 text-lg">
              No hidden fees. No surprises. Cancel anytime.
            </p>
          </div>
        </ScrollReveal>

        {/* Toggle */}
        <ScrollReveal delay={100}>
          <div className="flex items-center justify-center mb-12">
            <div className="inline-flex items-center rounded-lg border border-neutral-200 bg-white p-1">
              <button
                onClick={() => setCycle("monthly")}
                className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${
                  cycle === "monthly"
                    ? "bg-[#0a0a0a] text-white shadow-sm"
                    : "text-neutral-500 hover:text-[#0a0a0a]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setCycle("yearly")}
                className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${
                  cycle === "yearly"
                    ? "bg-[#0a0a0a] text-white shadow-sm"
                    : "text-neutral-500 hover:text-[#0a0a0a]"
                }`}
              >
                Yearly
                <span className="ml-1.5 text-xs text-[#DC2626] font-semibold">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Cards */}
        <div className="grid sm:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const price =
              cycle === "monthly" ? plan.price.monthly : plan.price.yearly;
            const perMonth =
              cycle === "yearly" && plan.price.yearly > 0
                ? Math.round(plan.price.yearly / 12)
                : plan.price.monthly;

            return (
              <ScrollReveal key={plan.name} delay={200 + i * 100}>
                <div
                  className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 h-full ${
                    plan.highlight
                      ? "border-[#DC2626] bg-[#0a0a0a] text-white shadow-xl shadow-[#DC2626]/10 scale-[1.02]"
                      : "border-neutral-200 bg-white text-[#0a0a0a] hover:border-neutral-300"
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#DC2626] px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                      Most Popular
                    </span>
                  )}

                  <p
                    className={`text-sm font-semibold uppercase tracking-wider ${
                      plan.highlight ? "text-white/40" : "text-neutral-400"
                    }`}
                  >
                    {plan.name}
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-5xl font-bold tracking-tight">
                      ₹{price === 0 ? "0" : perMonth.toLocaleString("en-IN")}
                    </span>
                    <span
                      className={`text-sm ${
                        plan.highlight ? "text-white/40" : "text-neutral-400"
                      }`}
                    >
                      {price === 0 ? "/forever" : "/month"}
                    </span>
                  </div>
                  {cycle === "yearly" && plan.price.yearly > 0 && (
                    <p
                      className={`text-xs mt-1 ${
                        plan.highlight ? "text-white/30" : "text-neutral-400"
                      }`}
                    >
                      ₹{plan.price.yearly.toLocaleString("en-IN")}/year
                    </p>
                  )}
                  <p
                    className={`mt-2 text-sm ${
                      plan.highlight ? "text-white/50" : "text-neutral-500"
                    }`}
                  >
                    {plan.desc}
                  </p>

                  <hr
                    className={`my-6 ${
                      plan.highlight ? "border-white/10" : "border-neutral-100"
                    }`}
                  />

                  <ul className="flex flex-1 flex-col gap-3 mb-8">
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
                            plan.highlight ? "text-white/70" : "text-neutral-600"
                          }
                        >
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors ${
                      plan.highlight
                        ? "bg-[#DC2626] text-white hover:bg-[#B91C1C]"
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
