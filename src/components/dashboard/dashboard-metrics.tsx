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

    // Today's invoices
    const { data: todayInvoices } = await supabase
      .from("invoices")
      .select("total, amount_paid, status")
      .eq("business_id", businessId)
      .gte("created_at", today);

    // Month's data for profit estimate
    const { data: monthInvoices } = await supabase
      .from("invoices")
      .select("total, subtotal, tax_amount, discount_amount")
      .eq("business_id", businessId)
      .gte("created_at", monthStart);

    // Products for cost calculation
    const { data: products } = await supabase
      .from("products")
      .select("id, cost_price, selling_price")
      .eq("business_id", businessId);

    // Outstanding from customers
    const { data: customers } = await supabase
      .from("customers")
      .select("outstanding_balance")
      .eq("business_id", businessId);

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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Today's Sales"
        value={formatCurrency(metrics?.todaySales || 0)}
        icon={<IndianRupee className="h-4 w-4" />}
        index={0}
      />
      <MetricCard
        title="Bills"
        value={String(metrics?.todayBills || 0)}
        icon={<Receipt className="h-4 w-4" />}
        index={1}
      />
      <MetricCard
        title="Month's Profit"
        value={formatCurrency(metrics?.monthProfit || 0)}
        icon={<TrendingUp className="h-4 w-4" />}
        index={2}
      />
      <MetricCard
        title="Outstanding"
        value={formatCurrency(metrics?.outstanding || 0)}
        icon={<Users className="h-4 w-4" />}
        index={3}
      />
    </div>
  );
}
