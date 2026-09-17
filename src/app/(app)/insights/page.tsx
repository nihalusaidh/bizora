"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  HeartPulse,
  BarChart3,
  Package,
  Users,
  AlertTriangle,
  CircleDollarSign,
  TrendingDown,
  Layers,
  Percent,
  FileText,
  Calendar,
  TrendingUp,
  Receipt,
  Scale,
  BookOpen,
} from "lucide-react";

interface InsightCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  inline?: boolean;
}

const insightCards: InsightCard[] = [
  {
    title: "Business Health",
    description: "Overall health score and recommendations",
    icon: <HeartPulse className="h-5 w-5" />,
    href: "/insights/health",
  },
  {
    title: "Financial Dashboard",
    description: "Revenue, expenses, and cash flow at a glance",
    icon: <BarChart3 className="h-5 w-5" />,
    href: "/insights/financial",
  },
  {
    title: "Inventory Intelligence",
    description: "Stock levels, turnover, and reorder alerts",
    icon: <Package className="h-5 w-5" />,
    href: "/insights/inventory",
  },
  {
    title: "Customer Intelligence",
    description: "Buying patterns, segments, and retention",
    icon: <Users className="h-5 w-5" />,
    inline: true,
  },
  {
    title: "Profit Leak Detector",
    description: "Find where your margins are being eroded",
    icon: <AlertTriangle className="h-5 w-5" />,
    inline: true,
  },
  {
    title: "Dead Capital Detector",
    description: "Identify unsold inventory tying up cash",
    icon: <CircleDollarSign className="h-5 w-5" />,
    inline: true,
  },
  {
    title: "Missed Revenue",
    description: "Opportunities you may be leaving on the table",
    icon: <TrendingDown className="h-5 w-5" />,
    inline: true,
  },
  {
    title: "Smart Bundles",
    description: "Product combinations that increase basket size",
    icon: <Layers className="h-5 w-5" />,
    inline: true,
  },
  {
    title: "Smart Discount Advisor",
    description: "Optimal discount strategies without hurting margin",
    icon: <Percent className="h-5 w-5" />,
    inline: true,
  },
  {
    title: "GSTR-1 Report",
    description: "Outward supplies summary for GST filing",
    icon: <FileText className="h-5 w-5" />,
    href: "/insights/gstr",
  },
  {
    title: "Daily Closing",
    description: "End-of-day summary and reconciliation",
    icon: <Calendar className="h-5 w-5" />,
    href: "/insights/daily-closing",
  },
  {
    title: "Revenue Report",
    description: "Daily and monthly sales trends",
    icon: <TrendingUp className="h-5 w-5" />,
    href: "/insights/revenue",
  },
  {
    title: "Expense Report",
    description: "Track where your money goes",
    icon: <Receipt className="h-5 w-5" />,
    href: "/insights/expenses",
  },
  {
    title: "P&L Statement",
    description: "Profit and loss breakdown and margins",
    icon: <Receipt className="h-5 w-5" />,
    href: "/insights/profit-loss",
  },
  {
    title: "Balance Sheet",
    description: "Assets, liabilities, and equity overview",
    icon: <Scale className="h-5 w-5" />,
    href: "/insights/balance-sheet",
  },
  {
    title: "Journal Entries",
    description: "Double-entry bookkeeping ledger",
    icon: <BookOpen className="h-5 w-5" />,
    href: "/insights/journal",
  },
];

export default function InsightsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground">Things worth your attention</p>
      </div>

      <div className="rounded-2xl bg-[#DC2626] text-white p-4 shadow-sm">
        <p className="text-[11px] uppercase tracking-wider text-white/70 font-bold">Insights</p>
        <p className="text-xl font-extrabold">Earn more, plug leaks</p>
        <p className="text-xs text-white/75 mt-0.5">Reports grouped like top deals — tap to open</p>
      </div>

      <div className="space-y-2">
        {insightCards.map((card) => {
          const content = (
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-[#FEF2F2] border border-red-100 flex items-center justify-center shrink-0 text-[#DC2626]">
                  {card.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold">{card.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {card.description}
                  </p>
                </div>
                <span className="text-xs font-extrabold text-[#DC2626] shrink-0">Open →</span>
              </div>
            </CardContent>
          );

          if (card.href) {
            return (
              <Link key={card.title} href={card.href}>
                <Card className="border-red-100 bg-white hover:border-[#DC2626] hover:shadow-sm transition-default cursor-pointer h-full">
                  {content}
                </Card>
              </Link>
            );
          }

          return (
            <Card key={card.title} className="border-red-100 bg-white h-full">
              {content}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
