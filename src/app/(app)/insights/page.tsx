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
    title: "P&L Statement",
    description: "Profit and loss breakdown and margins",
    icon: <Receipt className="h-5 w-5" />,
    href: "/insights/profit-loss",
  },
];

export default function InsightsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground">Things worth your attention</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {insightCards.map((card) => {
          const content = (
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                  {card.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold">{card.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {card.description}
                  </p>
                </div>
              </div>
            </CardContent>
          );

          if (card.href) {
            return (
              <Link key={card.title} href={card.href}>
                <Card className="hover:shadow-md transition-default cursor-pointer h-full">
                  {content}
                </Card>
              </Link>
            );
          }

          return (
            <Card key={card.title} className="hover:shadow-md transition-default h-full">
              {content}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
