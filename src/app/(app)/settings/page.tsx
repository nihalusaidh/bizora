"use client";

import Link from "next/link";
import { DeviceLinkCard } from "@/components/settings/device-link-card";
import {
  Building2, Package, Users, Bell, CreditCard, Shield,
  ChevronRight, Printer, FileText, Gift, HelpCircle, FileDown
} from "lucide-react";

const settingsGroups = [
  {
    label: "Business",
    items: [
      { name: "Business Profile", description: "Name, address, GST details", href: "/onboarding", icon: Building2 },
      { name: "Invoice Settings", description: "Templates, numbering, terms", href: "/settings/invoice-footer", icon: FileText },
    ],
  },
  {
    label: "Billing",
    items: [
      { name: "Payment Methods", description: "Cash, UPI, card settings", href: "/billing", icon: CreditCard },
      { name: "Printer Setup", description: "Thermal printer configuration", href: "/settings/invoice-footer", icon: Printer },
      { name: "Invoice Footer", description: "Bank details, terms & conditions on invoices", href: "/settings/invoice-footer", icon: FileText },
    ],
  },
  {
    label: "Inventory",
    items: [
      { name: "Stock Settings", description: "Low stock alerts, units", href: "/inventory/categories", icon: Package },
    ],
  },
  {
    label: "Team",
    items: [
      { name: "Team Management", description: "Roles and permissions", href: "/settings/team", icon: Users },
    ],
  },
  {
    label: "Loyalty",
    items: [
      { name: "Loyalty Program", description: "Enable and configure customer points", href: "/settings/loyalty", icon: Gift },
    ],
  },
  {
    label: "Subscription",
    items: [
      { name: "Plans & Billing", description: "Upgrade your plan", href: "/settings/subscription", icon: CreditCard },
    ],
  },
  {
    label: "Data",
    items: [
      { name: "Data Export", description: "Export your business data as CSV", href: "/settings/data-export", icon: FileDown },
    ],
  },
  {
    label: "Notifications",
    items: [
      { name: "Alert Preferences", description: "Configure notification types", href: "/notifications", icon: Bell },
    ],
  },
  {
    label: "Security",
    items: [
      { name: "App Passcode", description: "Lock app with passcode or biometrics", href: "/settings/security", icon: Shield },
    ],
  },
  {
    label: "Support",
    items: [
      { name: "Help & Support", description: "Get help with Bizora", href: "/help", icon: HelpCircle },
    ],
  },
];

async function handleSignOut() {
  // Best-effort server sign-out; local sign-out always runs so the user
  // is never trapped logged-in by a network hiccup or server error.
  try {
    await fetch("/auth/signout", { method: "POST" });
  } catch {
    // Fall through to local sign-out.
  }
  try {
    const { createClient } = await import("@/lib/supabase/client");
    await createClient().auth.signOut();
  } catch {
    // Storage may already be clear.
  }
  try {
    const { useAppStore } = await import("@/lib/store");
    useAppStore.getState().setBusiness(null);
    useAppStore.getState().setPlan("free");
    localStorage.removeItem("bizora-demo");
    localStorage.removeItem("bizora-demo-data");
  } catch {
    // Non-fatal.
  }
  window.location.href = "/login";
}

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your business configuration</p>
      </div>

      {settingsGroups.map((group) => (
        <div key={group.label}>
          <h2 className="text-[13px] font-bold text-[#DC2626] uppercase tracking-wider mb-2">
            {group.label}
          </h2>
          <div className="rounded-xl border border-red-100 bg-white divide-y divide-red-50 overflow-hidden">
            {group.items.map((item) => (
              <Link key={item.name} href={item.href}>
                <div className="flex items-center gap-3 p-3 transition-default hover:bg-[#FEF2F2] cursor-pointer tap-effect">
                  <div className="h-10 w-10 rounded-lg bg-[#FEF2F2] border border-red-100 flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-[#DC2626]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-red-300 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <DeviceLinkCard />

      <button
        onClick={handleSignOut}
        className="w-full rounded-xl border border-red-200 bg-red-50 p-4 text-left transition-default hover:bg-red-100"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-red-700">Sign Out</h3>
            <p className="text-xs text-red-500">Log out of your account</p>
          </div>
        </div>
      </button>
    </div>
  );
}
