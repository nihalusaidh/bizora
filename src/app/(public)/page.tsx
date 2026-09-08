"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Package,
  Users,
  Receipt,
  BarChart3,
  Bot,
  ArrowRight,
  Wifi,
  WifiOff,
  Check,
  IndianRupee,
  TrendingUp,
  FileText,
  AlertCircle,
  Smartphone,
  Monitor,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Fast Billing",
    desc: "Generate bills in seconds. GST-compliant. Multi-format. Zero friction.",
  },
  {
    icon: <Package className="w-6 h-6" />,
    title: "Inventory Management",
    desc: "Real-time stock tracking. Low-stock alerts. Barcode support.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Customer Management",
    desc: "Complete customer profiles. Purchase history. Payment tracking.",
  },
  {
    icon: <Receipt className="w-6 h-6" />,
    title: "Expense Tracking",
    desc: "Log every rupee. Categorize expenses. See where money goes.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Business Intelligence",
    desc: "Dashboards that tell you what happened and what to do next.",
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: "AI Copilot",
    desc: "Ask questions in plain language. Get answers in seconds.",
  },
];

const steps = [
  { label: "BILL", desc: "Create invoices instantly" },
  { label: "TRACK", desc: "Monitor every transaction" },
  { label: "UNDERSTAND", desc: "See patterns in your data" },
  { label: "PREDICT", desc: "Forecast trends with AI" },
  { label: "ACT", desc: "Make data-driven decisions" },
  { label: "GROW", desc: "Scale with confidence" },
];

const aiQuestions = [
  "What was my best-selling product last month?",
  "Who are my top 5 customers by revenue?",
  "How much profit did I make this week?",
  "Which expenses can I cut?",
  "What's my outstanding payment situation?",
];

const offlineFeatures = [
  "Create and save bills",
  "View customer history",
  "Check inventory levels",
  "Log expenses",
  "Access recent analytics",
  "Queue transactions for sync",
];

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Perfect for small shops getting started",
    features: [
      "100 bills/month",
      "Basic inventory",
      "Customer database",
      "Expense tracking",
      "Basic reports",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Gold",
    price: "₹399",
    period: "/month",
    desc: "For growing businesses that need more",
    features: [
      "Unlimited bills",
      "Advanced inventory",
      "Business intelligence",
      "AI Copilot (50 queries)",
      "Priority support",
      "Data export",
    ],
    cta: "Go Gold",
    highlight: true,
  },
  {
    name: "Diamond",
    price: "₹699",
    period: "/month",
    desc: "Full power for serious businesses",
    features: [
      "Everything in Gold",
      "Unlimited AI queries",
      "Multi-user access",
      "API access",
      "Custom reports",
      "Dedicated support",
      "White-label option",
    ],
    cta: "Go Diamond",
    highlight: false,
  },
];

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            BIZO<span className="text-red-600">RA</span>
          </Link>
          <div className="hidden sm:flex items-center gap-8 text-sm font-medium text-neutral-600">
            <Link href="/#features" className="hover:text-black transition-colors">
              Features
            </Link>
            <Link href="/#pricing" className="hover:text-black transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-black transition-colors">
              Login
            </Link>
          </div>
          <Link
            href="/signup"
            className="bg-black text-white px-5 py-2 text-sm font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Start Free
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            Business Operating System
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Know what happened.
            <br />
            Know what to <span className="text-red-600">do next.</span>
          </h1>
          <p className="text-lg sm:text-xl text-neutral-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Billing, inventory, customers, expenses, analytics and business
            intelligence — in one simple Business Operating System.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-black text-white px-8 py-4 text-base font-semibold rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
            >
              Start Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/#features"
              className="w-full sm:w-auto border-2 border-black text-black px-8 py-4 text-base font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
            >
              See Features
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs font-medium text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Web
            </span>
            <span className="w-1 h-1 bg-neutral-300 rounded-full" />
            <span className="flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5" /> Desktop
            </span>
            <span className="w-1 h-1 bg-neutral-300 rounded-full" />
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" /> Android
            </span>
          </div>
        </div>
      </section>

      {/* METRICS SHOWCASE */}
      <section className="py-20 px-4 sm:px-6 bg-black text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-neutral-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Live Dashboard Preview
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Your business at a glance.
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center">
              <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <IndianRupee className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Today&apos;s Sales
              </p>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">
                ₹43,280
              </p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center">
              <div className="w-10 h-10 bg-green-600/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Estimated Profit
              </p>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">
                ₹11,240
              </p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Bills
              </p>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">87</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center">
              <div className="w-10 h-10 bg-yellow-600/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Outstanding
              </p>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">
                ₹67,300
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NOT JUST BILLING */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Billing is where Bizora <span className="text-red-600">starts.</span>
          </h2>
          <p className="text-neutral-500 text-lg mb-16 max-w-xl mx-auto">
            But it&apos;s not where you stop. One platform that takes you from
            transaction to transformation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-0">
            {steps.map((step, i) => (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center px-4 sm:px-6 py-4">
                  <span className="text-xs font-bold text-red-600 tracking-widest mb-1">
                    {step.label}
                  </span>
                  <span className="text-xs text-neutral-400">{step.desc}</span>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-neutral-300 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-24 px-4 sm:px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-red-600 text-sm font-semibold uppercase tracking-widest mb-3">
              Everything You Need
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Built for how you actually work.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={f.title}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`group bg-white border rounded-2xl p-8 transition-all duration-300 cursor-default ${
                  hoveredFeature === i
                    ? "border-red-600 shadow-lg shadow-red-600/5"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors ${
                    hoveredFeature === i
                      ? "bg-red-600 text-white"
                      : "bg-neutral-100 text-black"
                  }`}
                >
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI SECTION */}
      <section className="py-24 px-4 sm:px-6 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/70 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
            <Bot className="w-3.5 h-3.5" />
            AI-Powered
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Ask your business <span className="text-red-500">anything.</span>
          </h2>
          <p className="text-neutral-400 text-lg mb-12 max-w-xl mx-auto">
            Your data, decoded. Ask questions in plain language and get instant
            answers powered by AI.
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 text-left max-w-2xl mx-auto">
            <div className="space-y-3">
              {aiQuestions.map((q, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-neutral-800/50 rounded-xl px-4 py-3"
                >
                  <Bot className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-neutral-300">{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* OFFLINE SECTION */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
                <WifiOff className="w-3.5 h-3.5" />
                Offline First
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Works offline.
                <br />
                <span className="text-red-600">Syncs when you&apos;re back.</span>
              </h2>
              <p className="text-neutral-500 text-lg leading-relaxed mb-6">
                No internet? No problem. Keep running your business without
                interruption. Everything syncs automatically when you reconnect.
              </p>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <Wifi className="w-4 h-4 text-green-600" />
                Automatic background sync
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-5">
                Available Offline
              </p>
              <div className="space-y-3">
                {offlineFeatures.map((feat) => (
                  <div key={feat} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-4 sm:px-6 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-red-600 text-sm font-semibold uppercase tracking-widest mb-3">
              Simple Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Start free. Upgrade when ready.
            </h2>
            <p className="text-neutral-500 text-lg">
              No hidden fees. No surprises. Cancel anytime.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl p-8 flex flex-col ${
                  plan.highlight
                    ? "border-2 border-red-600 shadow-xl shadow-red-600/10 relative"
                    : "border border-neutral-200"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <p className="text-sm font-semibold text-neutral-500 mb-2">
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-neutral-400">{plan.period}</span>
                </div>
                <p className="text-sm text-neutral-500 mb-6">{plan.desc}</p>
                <div className="border-t border-neutral-100 pt-6 mb-8 flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-neutral-600">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/signup"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                    plan.highlight
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-black text-white hover:bg-neutral-800"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-4 sm:px-6 bg-black text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Start running your business{" "}
            <span className="text-red-500">smarter.</span>
          </h2>
          <p className="text-neutral-400 text-lg mb-10 max-w-lg mx-auto">
            Join thousands of businesses already using Bizora to take control of
            their operations.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-red-600 text-white px-10 py-4 text-base font-semibold rounded-xl hover:bg-red-700 transition-colors"
          >
            Start Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-200 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-400">
            &copy; {new Date().getFullYear()} Bizora. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-neutral-400">
            <Link href="/privacy" className="hover:text-black transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-black transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
