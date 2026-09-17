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
    <div className="rounded-2xl border border-red-100 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#DC2626]">Quick actions</h3>
        <span className="text-[11px] font-bold text-[#DC2626]">Earn more →</span>
      </div>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 md:grid md:grid-cols-2 md:overflow-visible">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex min-w-[92px] flex-col items-center gap-1.5 rounded-xl border border-red-100 bg-white p-3 text-center tap-effect md:flex-row md:text-left md:p-2.5"
          >
            <div className="h-11 w-11 rounded-full bg-[#FEF2F2] border border-red-100 flex items-center justify-center text-[#DC2626] md:h-8 md:w-8 md:rounded-lg">
              <action.icon className="h-5 w-5 md:h-4 md:w-4" />
            </div>
            <span className="text-[11px] font-bold leading-tight md:text-xs">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
