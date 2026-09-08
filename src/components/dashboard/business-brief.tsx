"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton-cards";
import { TrendingUp, TrendingDown, AlertTriangle, Package, CreditCard } from "lucide-react";
import Link from "next/link";

interface BusinessBriefProps {
  businessId: string;
}

interface BriefInsight {
  icon: React.ReactNode;
  text: string;
  highlight?: boolean;
}

export function BusinessBrief({ businessId }: BusinessBriefProps) {
  const [insights, setInsights] = useState<BriefInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBrief = useCallback(async () => {
    const supabase = createClient();
    const items: BriefInsight[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [todayInvoices, weekInvoices, products, customers] = await Promise.all([
      supabase
        .from("invoices")
        .select("id, total, created_at")
        .eq("business_id", businessId)
        .gte("created_at", todayStr),
      supabase
        .from("invoices")
        .select("id, total, created_at")
        .eq("business_id", businessId)
        .gte("created_at", sevenDaysAgo),
      supabase
        .from("products")
        .select("id, name, stock_quantity, min_stock, category")
        .eq("business_id", businessId),
      supabase
        .from("customers")
        .select("id, name, outstanding_balance, last_purchase_at")
        .eq("business_id", businessId)
        .gt("outstanding_balance", 0),
    ]);

    const todaySales = todayInvoices?.data?.reduce((sum, i) => sum + Number(i.total), 0) || 0;
    const weekInvoicesList = weekInvoices?.data || [];
    const dailyAvg = weekInvoicesList.length > 0
      ? weekInvoicesList.reduce((sum, i) => sum + Number(i.total), 0) / 7
      : 0;

    if (dailyAvg > 0) {
      const pctDiff = ((todaySales - dailyAvg) / dailyAvg) * 100;
      if (todaySales > dailyAvg * 1.1) {
        items.push({
          icon: <TrendingUp className="h-4 w-4" />,
          text: `Sales are ${pctDiff.toFixed(0)}% above your 7-day average — strong start today.`,
        });
      } else if (todaySales < dailyAvg * 0.9) {
        items.push({
          icon: <TrendingDown className="h-4 w-4" />,
          text: `Sales are ${Math.abs(pctDiff).toFixed(0)}% below your 7-day average.`,
          highlight: true,
        });
      } else {
        items.push({
          icon: <TrendingUp className="h-4 w-4" />,
          text: `Sales are on track with your 7-day average of ₹${Math.round(dailyAvg).toLocaleString("en-IN")}/day.`,
        });
      }
    } else if (todaySales > 0) {
      items.push({
        icon: <TrendingUp className="h-4 w-4" />,
        text: `₹${todaySales.toLocaleString("en-IN")} in sales so far today.`,
      });
    }

    const productList = products?.data || [];
    if (productList.length > 0) {
      const categoryRevenue: Record<string, number> = {};
      const { data: invoiceItems } = await supabase
        .from("invoice_items")
        .select("name, total")
        .eq("business_id", businessId)
        .gte("created_at", thirtyDaysAgo);

      invoiceItems?.forEach((item) => {
        const name = item.name;
        categoryRevenue[name] = (categoryRevenue[name] || 0) + Number(item.total);
      });

      const topEntry = Object.entries(categoryRevenue).sort((a, b) => b[1] - a[1])[0];
      if (topEntry) {
        items.push({
          icon: <Package className="h-4 w-4" />,
          text: `Top seller this month: ${topEntry[0]} — ₹${topEntry[1].toLocaleString("en-IN")} revenue.`,
        });
      }

      const lowStock = productList.filter(
        (p) => p.stock_quantity <= (p.min_stock || 5)
      );
      if (lowStock.length > 0) {
        items.push({
          icon: <AlertTriangle className="h-4 w-4" />,
          text: `${lowStock.length} product${lowStock.length > 1 ? "s" : ""} low on stock: ${lowStock.slice(0, 2).map((p) => p.name).join(", ")}${lowStock.length > 2 ? "..." : ""}`,
          highlight: true,
        });
      }
    }

    const customersList = customers?.data || [];
    if (customersList.length > 0) {
      const totalDues = customersList.reduce(
        (sum, c) => sum + Number(c.outstanding_balance),
        0
      );
      items.push({
        icon: <CreditCard className="h-4 w-4" />,
        text: `₹${totalDues.toLocaleString("en-IN")} outstanding from ${customersList.length} customer${customersList.length > 1 ? "s" : ""}.`,
        highlight: totalDues > 10000,
      });
    }

    if (items.length === 0) {
      items.push({
        icon: <TrendingUp className="h-4 w-4" />,
        text: "Start creating bills and adding products to see your business brief here.",
      });
    }

    setInsights(items.slice(0, 4));
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    loadBrief();
  }, [loadBrief]);

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold tracking-widest uppercase">
          Bizora Brief
        </CardTitle>
        <div className="h-0.5 w-8 bg-[#DC2626] mt-1 rounded-full" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 text-muted-foreground">{insight.icon}</div>
              <p
                className={
                  insight.highlight
                    ? "text-sm font-medium text-[#DC2626]"
                    : "text-sm text-muted-foreground"
                }
              >
                {insight.text}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-border">
          <Link
            href="/insights"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View all insights →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
