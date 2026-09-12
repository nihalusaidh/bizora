"use client";

import Link from "next/link";
import {
  Building2, Receipt, Package, Users, Bell, CreditCard, Shield,
  ChevronRight, Palette, Printer, FileText, Settings2, Gift, HelpCircle, FileDown
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const settingsGroups = [
  {
    label: "Business",
    items: [
      { name: "Business Profile", description: "Name, address, GST details", href: "/onboarding", icon: Building2 },
      { name: "Invoice Settings", description: "Templates, numbering, terms", href: "/settings", icon: FileText },
    ],
  },
  {
    label: "Billing",
    items: [
      { name: "Payment Methods", description: "Cash, UPI, card settings", href: "/settings", icon: CreditCard },
      { name: "Printer Setup", description: "Thermal printer configuration", href: "/settings", icon: Printer },
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

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your business configuration</p>
      </div>

      {settingsGroups.map((group) => (
        <div key={group.label}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {group.label}
          </h2>
          <div className="rounded-xl border divide-y">
            {group.items.map((item) => (
              <Link key={item.name} href={item.href}>
                <div className="flex items-center gap-3 p-4 transition-default hover:bg-muted/50 cursor-pointer">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
