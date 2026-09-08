"use client";

import { Smartphone, Globe, Monitor, ArrowRight } from "lucide-react";
import Link from "next/link";

const platforms = [
  {
    name: "Android",
    description: "Billing, inventory, POS & more on your phone.",
    icon: Smartphone,
    action: {
      label: "Download App",
      href: "#",
      disabled: true,
    },
  },
  {
    name: "Web",
    description: "Access Bizora from any browser, anywhere.",
    icon: Globe,
    action: {
      label: "Open Bizora",
      href: "/login",
      disabled: false,
    },
  },
  {
    name: "Desktop",
    description: "Full-featured app for Windows workstations.",
    icon: Monitor,
    action: {
      label: "Download for Windows",
      href: "#",
      disabled: true,
    },
  },
];

export default function DownloadPage() {
  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Download Bizora
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Your account, business data and subscription travel with you across
          devices.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <div
                key={platform.name}
                className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#DC2626]/10">
                  <Icon className="h-7 w-7 text-[#DC2626]" />
                </div>
                <h2 className="text-xl font-semibold">{platform.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {platform.description}
                </p>
                <div className="mt-6 w-full">
                  {platform.action.disabled ? (
                    <button
                      disabled
                      className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground cursor-not-allowed"
                    >
                      {platform.action.label}
                    </button>
                  ) : (
                    <Link
                      href={platform.action.href}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#b91c1c] transition-colors"
                    >
                      {platform.action.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-12 text-sm text-muted-foreground italic">
          Continue billing even when your internet connection disappears.
        </p>
      </div>
    </section>
  );
}
