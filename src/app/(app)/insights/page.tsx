"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsightCard } from "@/components/ui/shared";
import { EmptyState } from "@/components/ui/shared";
import { Skeleton } from "@/components/ui/skeleton-cards";
import { useBusiness } from "@/lib/store";
import { BarChart3, TrendingUp, AlertTriangle, Brain, Lightbulb, FileText, Calendar } from "lucide-react";
import Link from "next/link";

interface Insight {
  type: "success" | "warning" | "danger" | "opportunity" | "ai";
  title: string;
  description: string;
  impact?: string;
  href?: string;
}

export default function InsightsPage() {
  const { businessId } = useBusiness();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInsights = useCallback(async () => {
    if (!businessId) return;
    const supabase = createClient();
    const items: Insight[] = [];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Sales trend
    const { data: recentInvoices } = await supabase
      .from("invoices")
      .select("total, created_at")
      .eq("business_id", businessId)
      .gte("created_at", thirtyDaysAgo);

    const prevMonthStart = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const { data: prevInvoices } = await supabase
      .from("invoices")
      .select("total")
      .eq("business_id", businessId)
      .gte("created_at", prevMonthStart)
      .lt("created_at", thirtyDaysAgo);

    const currentRevenue = recentInvoices?.reduce((sum, i) => sum + Number(i.total), 0) || 0;
    const prevRevenue = prevInvoices?.reduce((sum, i) => sum + Number(i.total), 0) || 0;
    const revenueChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    if (revenueChange > 10) {
      items.push({
        type: "success",
        title: "Sales are growing",
        description: `Revenue is up ${revenueChange.toFixed(0)}% compared to last month.`,
        impact: `+₹${(currentRevenue - prevRevenue).toLocaleString("en-IN")} additional revenue`,
      });
    } else if (revenueChange < -10) {
      items.push({
        type: "warning",
        title: "Sales declining",
        description: `Revenue is down ${Math.abs(revenueChange).toFixed(0)}% compared to last month.`,
        impact: `₹${(prevRevenue - currentRevenue).toLocaleString("en-IN")} revenue drop`,
        href: "/insights/revenue",
      });
    }

    // Low stock
    const { data: products } = await supabase
      .from("products")
      .select("id, name, stock_quantity, min_stock")
      .eq("business_id", businessId);

    const lowStock = products?.filter(p => p.stock_quantity <= (p.min_stock || 5)) || [];
    if (lowStock.length > 0) {
      items.push({
        type: "danger",
        title: `${lowStock.length} product${lowStock.length > 1 ? "s" : ""} low on stock`,
        description: lowStock.slice(0, 3).map(p => p.name).join(", ") + (lowStock.length > 3 ? "..." : ""),
        href: "/inventory",
      });
    }

    // Outstanding payments
    const { data: customers } = await supabase
      .from("customers")
      .select("id, name, outstanding_balance")
      .eq("business_id", businessId)
      .gt("outstanding_balance", 0);

    const customersWithDues = customers || [];
    if (customersWithDues.length > 0) {
      const totalDues = customersWithDues.reduce((sum, c) => sum + Number(c.outstanding_balance), 0);
      items.push({
        type: "warning",
        title: `${customersWithDues.length} customer${customersWithDues.length > 1 ? "s" : ""} with outstanding dues`,
        description: `₹${totalDues.toLocaleString("en-IN")} in pending payments`,
        href: "/customers",
      });
    }

    // Profit insight
    const { data: expenses } = await supabase
      .from("expenses")
      .select("amount")
      .eq("business_id", businessId)
      .gte("expense_date", thirtyDaysAgo.split("T")[0]);

    const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
    if (currentRevenue > 0) {
      const profitMargin = ((currentRevenue - totalExpenses) / currentRevenue) * 100;
      if (profitMargin < 10) {
        items.push({
          type: "warning",
          title: "Profit margin is low",
          description: `Current margin: ${profitMargin.toFixed(0)}%. Consider reviewing expenses or pricing.`,
          impact: `Expenses: ₹${totalExpenses.toLocaleString("en-IN")}`,
          href: "/insights/profit-loss",
        });
      }
    }

    setInsights(items.slice(0, 5));
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground">Things worth your attention</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-48 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : insights.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="h-12 w-12" />}
          title="No insights yet"
          description="Start using Bizora to get insights about your business. Create bills, add products, and track customers."
          action={
            <Link href="/billing">
              <Button>
                <TrendingUp className="mr-2 h-4 w-4" />
                Start billing
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <InsightCard
              key={i}
              type={insight.type}
              title={insight.title}
              description={insight.description}
              impact={insight.impact}
              action={
                insight.href ? (
                  <Link href={insight.href}>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      View details
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Report Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/insights/revenue">
          <Card className="hover:shadow-md transition-default cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Daily and monthly sales trends</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/insights/expenses">
          <Card className="hover:shadow-md transition-default cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Category breakdown and trends</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/insights/profit-loss">
          <Card className="hover:shadow-md transition-default cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Profit & Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">P&L statement and margins</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/insights/gst">
          <Card className="hover:shadow-md transition-default cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-intelligence" />
                GST Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Invoice-wise tax breakdown</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/insights/gstr">
          <Card className="hover:shadow-md transition-default cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                GSTR-1
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Outward supplies for GST filing</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/insights/daily-closing">
          <Card className="hover:shadow-md transition-default cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Daily Closing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">End-of-day summary and reconciliation</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
