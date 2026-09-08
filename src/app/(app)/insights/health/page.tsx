"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useBusiness } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton-cards";
import { cn } from "@/lib/utils";
import { ArrowLeft, Info } from "lucide-react";
import { useRouter } from "next/navigation";

interface CategoryScore {
  name: string;
  score: number;
  max: number;
  detail: string;
}

function scoreColor(score: number): string {
  if (score < 60) return "text-[#DC2626]";
  if (score < 80) return "text-[#737373]";
  return "text-foreground font-bold";
}

function barColor(score: number): string {
  if (score < 60) return "bg-[#DC2626]";
  if (score < 80) return "bg-[#737373]";
  return "bg-foreground";
}

function statusText(score: number): string {
  if (score >= 80) return "Healthy";
  if (score >= 60) return "Needs attention";
  return "Critical";
}

function statusColor(score: number): string {
  if (score >= 80) return "text-foreground";
  if (score >= 60) return "text-[#737373]";
  return "text-[#DC2626]";
}

export default function BusinessHealthPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [overallScore, setOverallScore] = useState(50);
  const [categories, setCategories] = useState<CategoryScore[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateScores = useCallback(async () => {
    if (!businessId) return;
    const supabase = createClient();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      monthInvoices,
      allProducts,
      allCustomers,
      monthExpenses,
    ] = await Promise.all([
      supabase
        .from("invoices")
        .select("id, status, total, amount_paid, created_at")
        .eq("business_id", businessId)
        .gte("created_at", monthStart),
      supabase
        .from("products")
        .select("id, stock_quantity, min_stock, cost_price, selling_price, is_active")
        .eq("business_id", businessId),
      supabase
        .from("customers")
        .select("id, is_active, outstanding_balance, last_purchase_at, total_spend")
        .eq("business_id", businessId),
      supabase
        .from("expenses")
        .select("amount")
        .eq("business_id", businessId)
        .gte("expense_date", thirtyDaysAgo.split("T")[0]),
    ]);

    const invoices = monthInvoices.data || [];
    const products = allProducts.data || [];
    const customers = allCustomers.data || [];
    const expenses = monthExpenses.data || [];

    // Shared computations
    const totalRevenue = invoices.reduce(
      (sum, i) => sum + Number(i.total),
      0
    );
    const totalExpenses = expenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0
    );

    // --- Sales Score ---
    const invoiceCount = invoices.length;
    let salesScore = 0;
    if (invoiceCount > 30) salesScore = 95;
    else if (invoiceCount > 20) salesScore = 80;
    else if (invoiceCount > 10) salesScore = 65;
    else if (invoiceCount > 5) salesScore = 50;
    else if (invoiceCount > 0) salesScore = 35;
    else salesScore = 10;

    const recentInvoices = invoices.filter(
      (i) => new Date(i.created_at) >= new Date(sevenDaysAgo)
    );
    if (recentInvoices.length < 2 && invoiceCount > 10) {
      salesScore = Math.max(salesScore - 15, 0);
    }

    // --- Profit Score ---
    let profitScore = 50;
    if (products.length > 0) {
      const avgMargin =
        products.reduce((sum, p) => {
          const sp = Number(p.selling_price) || 0;
          const cp = Number(p.cost_price) || 0;
          const margin = sp > 0 ? (sp - cp) / sp : 0;
          return sum + margin;
        }, 0) / products.length;

      if (totalRevenue > 0) {
        const actualMargin = (totalRevenue - totalExpenses) / totalRevenue;
        const marginPct = actualMargin * 100;
        if (marginPct >= 30) profitScore = 90;
        else if (marginPct >= 20) profitScore = 75;
        else if (marginPct >= 10) profitScore = 60;
        else if (marginPct >= 0) profitScore = 45;
        else profitScore = 20;
      } else if (avgMargin >= 0.2) {
        profitScore = 65;
      }
    } else {
      profitScore = 50;
    }

    // --- Inventory Score ---
    let inventoryScore = 100;
    const activeProducts = products.filter((p) => p.is_active !== false);
    if (activeProducts.length > 0) {
      const lowStockCount = activeProducts.filter(
        (p) => Number(p.stock_quantity) <= (Number(p.min_stock) || 5)
      ).length;
      const lowStockPct = lowStockCount / activeProducts.length;
      inventoryScore = Math.round((1 - lowStockPct) * 100);
    } else {
      inventoryScore = 50;
    }

    // --- Customers Score ---
    let customerScore = 50;
    if (customers.length > 0) {
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const activeCustomers = customers.filter((c) => {
        if (c.is_active === false) return false;
        if (!c.last_purchase_at) return false;
        return (
          new Date(c.last_purchase_at).getTime() >= now.getTime() - thirtyDaysMs
        );
      }).length;
      const activeRatio = activeCustomers / customers.length;
      if (activeRatio >= 0.7) customerScore = 90;
      else if (activeRatio >= 0.5) customerScore = 75;
      else if (activeRatio >= 0.3) customerScore = 60;
      else if (activeRatio >= 0.1) customerScore = 45;
      else customerScore = 25;
    } else {
      customerScore = 50;
    }

    // --- Cash Flow Score ---
    const totalOutstanding = customers.reduce(
      (sum, c) => sum + Number(c.outstanding_balance || 0),
      0
    );
    const totalCollected = invoices.reduce(
      (sum, i) => sum + Number(i.amount_paid || 0),
      0
    );
    let cashFlowScore = 70;
    if (totalRevenue > 0) {
      const collectedRatio = totalCollected / totalRevenue;
      const outstandingRatio = totalOutstanding / totalRevenue;
      if (collectedRatio >= 0.9) cashFlowScore = 95;
      else if (collectedRatio >= 0.8) cashFlowScore = 80;
      else if (collectedRatio >= 0.6) cashFlowScore = 65;
      else cashFlowScore = 45;

      if (outstandingRatio > 0.5) cashFlowScore = Math.max(cashFlowScore - 20, 10);
      else if (outstandingRatio > 0.3) cashFlowScore = Math.max(cashFlowScore - 10, 20);
    } else {
      cashFlowScore = 70;
    }

    // --- Expenses Score ---
    let expenseScore = 70;
    if (totalRevenue > 0) {
      const expenseRatio = totalExpenses / totalRevenue;
      if (expenseRatio <= 0.3) expenseScore = 95;
      else if (expenseRatio <= 0.5) expenseScore = 80;
      else if (expenseRatio <= 0.7) expenseScore = 60;
      else if (expenseRatio <= 0.9) expenseScore = 40;
      else expenseScore = 20;
    } else {
      expenseScore = 60;
    }

    const categoriesData: CategoryScore[] = [
      { name: "Sales", score: salesScore, max: 100, detail: `${invoiceCount} invoice${invoiceCount !== 1 ? "s" : ""} this month` },
      { name: "Profit", score: profitScore, max: 100, detail: `${(profitScore * 0.3).toFixed(0)}% est. margin` },
      { name: "Inventory", score: inventoryScore, max: 100, detail: `${activeProducts.filter((p) => Number(p.stock_quantity) <= (Number(p.min_stock) || 5)).length} low stock` },
      { name: "Customers", score: customerScore, max: 100, detail: `${customers.length} total customer${customers.length !== 1 ? "s" : ""}` },
      { name: "Cash Flow", score: cashFlowScore, max: 100, detail: `₹${totalCollected.toLocaleString("en-IN")} collected` },
      { name: "Expenses", score: expenseScore, max: 100, detail: `₹${totalExpenses.toLocaleString("en-IN")} this month` },
    ];

    const overall = Math.round(
      (salesScore + profitScore + inventoryScore + customerScore + cashFlowScore + expenseScore) / 6
    );

    setCategories(categoriesData);
    setOverallScore(overall);
    setLastUpdated(new Date());
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    calculateScores();
  }, [calculateScores]);

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/insights")}
          className="rounded-lg p-2 hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Business Health</h1>
          <p className="text-muted-foreground">Overall score and category breakdown</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-8 flex flex-col items-center">
            <Skeleton className="h-36 w-36 rounded-full mb-4" />
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-4">
                <Skeleton className="h-4 w-20 mb-3" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Overall Score */}
          <Card>
            <CardContent className="flex flex-col items-center py-8">
              <div className="relative h-36 w-36 mb-4">
                <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted/50"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    strokeWidth="8"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={dashOffset}
                    className={cn(
                      overallScore >= 80
                        ? "stroke-foreground"
                        : overallScore >= 60
                        ? "stroke-[#737373]"
                        : "stroke-[#DC2626]"
                    )}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn("text-4xl font-bold tracking-tight", scoreColor(overallScore))}>
                    {overallScore}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
              </div>
              <span className={cn("text-lg font-semibold", statusColor(overallScore))}>
                {statusText(overallScore)}
              </span>
            </CardContent>
          </Card>

          {/* Category Scores */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Card key={cat.name}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      {cat.name}
                    </span>
                    <span className={cn("text-sm font-bold financial-number", scoreColor(cat.score))}>
                      {cat.score}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted/50 mb-2">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", barColor(cat.score))}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{cat.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* How We Calculate */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                How we calculate this
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-xs text-muted-foreground">
                <div>
                  <span className="font-semibold text-foreground">Sales</span> — Based on invoice count and consistency over the past 30 days. More consistent activity scores higher.
                </div>
                <div>
                  <span className="font-semibold text-foreground">Profit</span> — Estimated from your average product margins and actual revenue vs expenses this month.
                </div>
                <div>
                  <span className="font-semibold text-foreground">Inventory</span> — Measures the percentage of products that are adequately stocked. Fewer low-stock items means a higher score.
                </div>
                <div>
                  <span className="font-semibold text-foreground">Customers</span> — Ratio of active customers (purchased in last 30 days) vs total customer base.
                </div>
                <div>
                  <span className="font-semibold text-foreground">Cash Flow</span> — Compares collected payments to total invoice value. Lower outstanding relative to revenue scores better.
                </div>
                <div>
                  <span className="font-semibold text-foreground">Expenses</span> — Expense-to-revenue ratio. Keeping expenses below 50% of revenue scores highest.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last Updated */}
          {lastUpdated && (
            <p className="text-xs text-muted-foreground text-center">
              Last updated:{" "}
              {lastUpdated.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </>
      )}
    </div>
  );
}
