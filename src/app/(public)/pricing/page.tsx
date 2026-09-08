"use client";

import Link from "next/link";
import { Check } from "lucide-react";

const FREE_FEATURES = [
  "Up to 50 products",
  "Up to 100 customers",
  "Limited invoices/month",
  "Basic billing & POS",
  "Basic GST/non-GST invoices",
  "Cash/UPI/card/credit payments",
  "Basic PDF invoices",
  "Basic inventory",
  "Basic stock alerts",
  "Basic expenses",
  "Basic reports",
];

const GOLD_FEATURES = [
  "Everything in Free",
  "Unlimited products",
  "Unlimited customers",
  "Unlimited invoices",
  "Advanced inventory",
  "Advanced reports",
  "Business Health score",
  "Bizora Brief",
  "AI Copilot",
  "Profit Leak Detector",
  "Dead Capital Detector",
  "Stock Forecasting",
  "Customer Intelligence",
  "Smart Discount Advisor",
  "Cash-flow forecasting",
];

const DIAMOND_FEATURES = [
  "Everything in Gold",
  "Business Simulator",
  "Business Twin",
  "Opportunity Radar",
  "Advanced forecasting",
  "Multi-branch support",
  "Advanced staff permissions",
  "Approval workflows",
  "Advanced audit logs",
  "Automated recommendations",
];

const FAQ = [
  {
    q: "Can I switch plans anytime?",
    a: "Yes. Upgrade instantly from your dashboard. Downgrade at the end of your billing cycle with no penalty.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "Yes. Every paid plan starts with a 7-day free trial so you can explore the full feature set before committing.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI, credit/debit cards, net banking, and popular wallets through our secure payment gateway.",
  },
  {
    q: "Will I lose my data if I downgrade?",
    a: "Never. All your data is preserved. Features beyond your plan are simply hidden until you upgrade again.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a full refund within 7 days of any new charge if you're not satisfied. No questions asked.",
  },
];

function PricingCard({
  name,
  price,
  period,
  subtitle,
  features,
  cta,
  href,
  variant,
}: {
  name: string;
  price: string;
  period: string;
  subtitle: string;
  features: string[];
  cta: string;
  href: string;
  variant: "free" | "gold" | "diamond";
}) {
  const isGold = variant === "gold";
  const isDiamond = variant === "diamond";

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 ${
        isGold
          ? "border-[#DC2626] bg-[#0a0a0a] text-white scale-[1.03] z-10"
          : isDiamond
            ? "border-neutral-800 bg-[#0a0a0a] text-white"
            : "border-neutral-200 bg-white text-[#0a0a0a]"
      }`}
    >
      {isGold && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#DC2626] px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
          Most Popular
        </span>
      )}

      <p className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
        {name}
      </p>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-5xl font-bold tracking-tight">{price}</span>
        <span className="text-sm text-neutral-500">{period}</span>
      </div>
      <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>

      <hr
        className={`my-6 ${isGold ? "border-neutral-800" : isDiamond ? "border-neutral-800" : "border-neutral-200"}`}
      />

      <ul className="flex flex-1 flex-col gap-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm leading-snug">
            <Check
              size={16}
              className={`mt-0.5 shrink-0 ${
                isGold
                  ? "text-[#DC2626]"
                  : isDiamond
                    ? "text-neutral-300"
                    : "text-[#0a0a0a]"
              }`}
            />
            <span className={isGold || isDiamond ? "text-neutral-300" : "text-neutral-600"}>
              {f}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors ${
          isGold
            ? "bg-[#DC2626] text-white hover:bg-red-700"
            : isDiamond
              ? "bg-white text-[#0a0a0a] hover:bg-neutral-200"
              : "border border-[#0a0a0a] bg-transparent text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="px-6 pt-24 pb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[#0a0a0a] sm:text-5xl">
          Choose your Bizora
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-neutral-500">
          Start free. Upgrade when you&apos;re ready.
        </p>
      </section>

      {/* Cards */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-8 px-6 pb-24 md:grid-cols-3">
        <PricingCard
          name="Free"
          price="₹0"
          period="/month"
          subtitle="Try Bizora"
          features={FREE_FEATURES}
          cta="Start Free"
          href="/signup"
          variant="free"
        />
        <PricingCard
          name="Gold"
          price="₹399"
          period="/month"
          subtitle="Understand Your Business"
          features={GOLD_FEATURES}
          cta="Get Gold"
          href="/signup?plan=gold"
          variant="gold"
        />
        <PricingCard
          name="Diamond"
          price="₹699"
          period="/month"
          subtitle="Grow & Automate"
          features={DIAMOND_FEATURES}
          cta="Get Diamond"
          href="/signup?plan=diamond"
          variant="diamond"
        />
      </section>

      {/* FAQ */}
      <section className="border-t border-neutral-200 bg-neutral-50 px-6 py-24">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-[#0a0a0a]">
            Frequently Asked Questions
          </h2>

          <div className="mt-12 space-y-0 divide-y divide-neutral-200">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-left text-base font-semibold text-[#0a0a0a]">
                  {item.q}
                  <span className="ml-4 shrink-0 text-neutral-400 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
