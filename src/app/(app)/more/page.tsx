"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  Settings, CreditCard, Users, HelpCircle, IndianRupee, Bell,
  BarChart3, Package, Receipt, Building2, ChevronRight, Calendar,
  ShoppingCart, Truck, Store, Megaphone
} from "lucide-react";

const moreSections = [
  {
    label: "Business",
    items: [
      { label: "Expenses", href: "/expenses", icon: IndianRupee, description: "Track and manage expenses" },
      { label: "Purchases", href: "/purchases", icon: Package, description: "Purchase orders and suppliers" },
      { label: "Sales Orders", href: "/sales-orders", icon: ShoppingCart, description: "Pre-sale commitments" },
      { label: "Delivery Challans", href: "/billing/challans", icon: Truck, description: "Goods dispatch tracking" },
      { label: "Suppliers", href: "/suppliers", icon: Building2, description: "Manage your suppliers" },
      { label: "Online Store", href: "/catalogue", icon: Store, description: "Share products with customers" },
      { label: "Notify Customers", href: "/customers/notify", icon: Megaphone, description: "Send stock & offer broadcasts" },
      { label: "Daily Closing", href: "/insights/daily-closing", icon: Calendar, description: "End-of-day summary report" },
    ],
  },
  {
    label: "Reports",
    items: [
      { label: "Insights", href: "/insights", icon: BarChart3, description: "Business intelligence and analytics" },
      { label: "Notifications", href: "/notifications", icon: Bell, description: "Alerts and reminders" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Settings", href: "/settings", icon: Settings, description: "Business configuration" },
      { label: "Team", href: "/settings/team", icon: Users, description: "Manage team members" },
      { label: "Subscription", href: "/settings/subscription", icon: CreditCard, description: "Plan and billing" },
      { label: "Help & Support", href: "/help", icon: HelpCircle, description: "Get help with Bizora" },
    ],
  },
];

export default function MorePage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">More</h1>
        <p className="text-muted-foreground">Everything else</p>
      </div>

      {moreSections.map((section) => (
        <div key={section.label}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {section.label}
          </h2>
          <div className="rounded-xl border divide-y">
            {section.items.map((item) => (
              <Link key={item.label} href={item.href}>
                <div className="flex items-center gap-3 p-4 transition-default hover:bg-muted/50 cursor-pointer">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium">{item.label}</h3>
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
