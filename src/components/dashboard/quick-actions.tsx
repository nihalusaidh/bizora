"use client";

import Link from "next/link";
import { Receipt, Package, Users, IndianRupee, CreditCard } from "lucide-react";

const quickActions = [
  { label: "Create Bill", href: "/billing", icon: Receipt },
  { label: "Add Product", href: "/inventory/new", icon: Package },
  { label: "Add Customer", href: "/customers", icon: Users },
  { label: "Record Expense", href: "/expenses", icon: IndianRupee },
  { label: "Record Payment", href: "/customers", icon: CreditCard },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold mb-3">Quick actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-2.5 rounded-lg border border-border p-2.5 text-sm font-medium transition-default hover:bg-muted"
          >
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-foreground">
              <action.icon className="h-4 w-4" />
            </div>
            <span className="text-xs">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
