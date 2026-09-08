"use client";

import Link from "next/link";
import { Receipt, Package, Users, IndianRupee, CreditCard } from "lucide-react";

const quickActions = [
  { label: "Create Bill", href: "/billing", icon: Receipt, color: "bg-primary/10 text-primary" },
  { label: "Add Product", href: "/inventory/new", icon: Package, color: "bg-success-soft text-success" },
  { label: "Add Customer", href: "/customers", icon: Users, color: "bg-intelligence-soft text-intelligence" },
  { label: "Record Expense", href: "/expenses", icon: IndianRupee, color: "bg-warning-soft text-warning" },
  { label: "Record Payment", href: "/customers", icon: CreditCard, color: "bg-danger-soft text-danger" },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="text-sm font-semibold mb-3">Quick actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-2 rounded-lg border p-2.5 text-sm font-medium transition-default hover:shadow-sm"
          >
            <div className={`h-7 w-7 rounded-md flex items-center justify-center ${action.color}`}>
              <action.icon className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
