"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MetricCard } from "@/components/ui/metric-card";
import { MetricCardSkeleton } from "@/components/ui/skeleton-cards";
import { Receipt, IndianRupee, TrendingUp, Users } from "lucide-react";

interface DashboardMetricsProps {
  businessId: string;
}

export function DashboardMetrics({ businessId }: DashboardMetricsProps) {
  const [metrics, setMetrics] = useState<{
    todaySales: number;
    todayBills: number;
    monthProfit: number;
    outstanding: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMetrics = useCallback(async () => {
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    // All four queries in parallel — one round-trip wave, not four waterfalls.
    const [todayRes, monthRes, productsRes, customersRes] = await Promise.all([
      supabase
        .from("invoices")
        .select("total, amount_paid, status")
        .eq("business_id", businessId)
        .gte("created_at", today),
      supabase
        .from("invoices")
        .select("total, subtotal, tax_amount, discount_amount")
        .eq("business_id", businessId)
        .gte("created_at", monthStart),
      supabase
        .from("products")
        .select("id, cost_price, selling_price")
        .eq("business_id", businessId),
      supabase
        .from("customers")
        .select("outstanding_balance")
        .eq("business_id", businessId),
    ]);

    const todayInvoices = todayRes.data;
    const monthInvoices = monthRes.data;
    const products = productsRes.data;
    const customers = customersRes.data;

    const todaySales = todayInvoices?.reduce((sum, i) => sum + Number(i.total), 0) || 0;
    const todayBills = todayInvoices?.length || 0;
    const monthRevenue = monthInvoices?.reduce((sum, i) => sum + Number(i.total), 0) || 0;
    const monthTax = monthInvoices?.reduce((sum, i) => sum + Number(i.tax_amount), 0) || 0;
    const monthDiscount = monthInvoices?.reduce((sum, i) => sum + Number(i.discount_amount), 0) || 0;

    // Estimate profit (revenue - estimated costs)
    const avgMargin = products && products.length > 0
      ? products.reduce((sum, p) => {
          const margin = p.selling_price > 0 ? (p.selling_price - (p.cost_price || 0)) / p.selling_price : 0;
          return sum + margin;
        }, 0) / products.length
      : 0.25;

    const monthProfit = Math.round((monthRevenue - monthTax - monthDiscount) * avgMargin);
    const outstanding = customers?.reduce((sum, c) => sum + Number(c.outstanding_balance || 0), 0) || 0;

    setMetrics({
      todaySales,
      todayBills,
      monthProfit,
      outstanding,
    });
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-[#DC2626] text-white p-4 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/70 font-bold">Today&apos;s sales</p>
          <p className="text-3xl font-extrabold financial-number">{formatCurrency(metrics?.todaySales || 0)}</p>
          <p className="text-xs text-white/75 mt-0.5">{metrics?.todayBills || 0} bills • {formatCurrency(metrics?.monthProfit || 0)} profit this month</p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
          <IndianRupee className="h-6 w-6" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <MetricCard
          title="Bills"
          value={String(metrics?.todayBills || 0)}
          icon={<Receipt className="h-4 w-4" />}
          index={1}
          className="border-red-100 !p-3"
        />
        <MetricCard
          title="Profit"
          value={formatCurrency(metrics?.monthProfit || 0)}
          icon={<TrendingUp className="h-4 w-4" />}
          index={2}
          className="border-red-100 !p-3"
        />
        <MetricCard
          title="Due"
          value={formatCurrency(metrics?.outstanding || 0)}
          icon={<Users className="h-4 w-4" />}
          index={3}
          className="border-red-100 !p-3"
        />
      </div>
    </div>
  );
}
