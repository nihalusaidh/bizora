"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is Bizora?",
    a: "Bizora is an AI-powered Business Operating System for small businesses, retailers, wholesalers, and growing MSMEs in India. It combines billing, inventory, customers, expenses, reports, and business intelligence into one simple system.",
  },
  {
    q: "Is Bizora free?",
    a: "Yes. Bizora offers a free plan that includes basic billing, inventory, customers, expenses, and reports. You can upgrade to Gold or Diamond for advanced features.",
  },
  {
    q: "What does Gold cost?",
    a: "Gold costs ₹399/month. It includes unlimited core usage, AI Copilot, business health, forecasting, and advanced intelligence features.",
  },
  {
    q: "What does Diamond cost?",
    a: "Diamond costs ₹699/month. It includes everything in Gold plus business simulator, multi-branch, advanced automation, and growth tools.",
  },
  {
    q: "Can I use Bizora offline?",
    a: "Yes. Bizora works offline for billing, POS, product search, customer lookup, inventory updates, expenses, payments, and invoice generation. Your changes sync automatically when you're back online.",
  },
  {
    q: "Does Bizora provide AI?",
    a: "Bizora provides the AI-powered business intelligence interface. You connect your own Gemini API key. Bizora does not charge for AI API usage.",
  },
  {
    q: "Do I need an AI API key?",
    a: "No. Core business functions work without AI. AI-powered features like the Copilot, forecasting, and intelligence require a connected Gemini API key.",
  },
  {
    q: "Can I print invoices?",
    a: "Yes. Bizora supports 58mm and 80mm thermal printing, A4 printing, and PDF generation.",
  },
  {
    q: "Can I send invoices on WhatsApp?",
    a: "Yes. You can send invoices via WhatsApp to customers.",
  },
  {
    q: "What happens if I cancel?",
    a: "Your data is retained. You can export it anytime. After cancellation, you'll be moved to the Free plan.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left bg-card hover:bg-muted/50 transition-colors"
      >
        <span className="text-base font-medium">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed bg-card border-t border-border">
          <p className="pt-4">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-center sm:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 text-lg text-muted-foreground text-center">
          Everything you need to know about Bizora.
        </p>

        <div className="mt-14 space-y-4">
          {faqs.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
