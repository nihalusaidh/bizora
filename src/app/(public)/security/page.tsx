"use client";

import {
  ShieldCheck,
  Lock,
  Database,
  Users,
  KeyRound,
  Cloud,
  Laptop,
  BadgeCheck,
} from "lucide-react";

const features = [
  {
    title: "Secure Authentication",
    description: "Encrypted login with Supabase Auth",
    icon: ShieldCheck,
  },
  {
    title: "Encrypted Communication",
    description: "All data transmitted over TLS/SSL",
    icon: Lock,
  },
  {
    title: "Database Security",
    description: "Row-level security policies on all tables",
    icon: Database,
  },
  {
    title: "Role-Based Permissions",
    description: "Owner, Manager, Cashier, Staff, Accountant roles",
    icon: Users,
  },
  {
    title: "API Key Security",
    description: "Your AI keys are stored securely, never exposed publicly",
    icon: KeyRound,
  },
  {
    title: "Data Backup",
    description: "Automatic backups with Supabase infrastructure",
    icon: Cloud,
  },
  {
    title: "Offline Protection",
    description: "Local data encrypted with browser security",
    icon: Laptop,
  },
  {
    title: "Subscription Verification",
    description: "Server-side subscription validation",
    icon: BadgeCheck,
  },
];

export default function SecurityPage() {
  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Security &amp; Trust
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your business data is protected.
        </p>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-card p-6 text-left"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#DC2626]/10">
                  <Icon className="h-5 w-5 text-[#DC2626]" />
                </div>
                <h3 className="text-sm font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
