"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useBusiness } from "@/lib/store";
import { BizoraChart } from "@/components/charts/bizora-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/shared";
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Receipt,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface InvoiceRow {
  total: number;
  tax_amount: number;
  discount_amount: number;
  status: string;
  created_at: string;
}

interface ExpenseRow {
  amount: number;
  created_at: string;
}

interface CustomerRow {
  outstanding_balance: number;
}

interface MonthData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface FinancialData {
  totalRevenue: number;
  grossProfit: number;
  netProfit: number;
  totalExpenses: number;
  receivables: number;
  payables: number;
  revenueData: Array<{ name: string; value: number }>;
  profitExpenseData: MonthData[];
  cashFlowData: Array<{ name: string; value: number }>;
  marginData: Array<{ name: string; value: number }>;
}

function getMonthLabel(date: Date): string {
  return date.toLocaleString("en-US", { month: "short", year: "2-digit" });
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function FinancialInsightsPage() {
  const { businessId } = useBusiness();
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);

    const supabase = createClient();

    const [invoicesRes, expensesRes, customersRes] = await Promise.all([
      supabase
        .from("invoices")
        .select("total, tax_amount, discount_amount, status, created_at")
        .eq("business_id", businessId),
      supabase
        .from("expenses")
        .select("amount, created_at")
        .eq("business_id", businessId),
      supabase
        .from("customers")
        .select("outstanding_balance")
        .eq("business_id", businessId)
        .gt("outstanding_balance", 0),
    ]);

    const invoices = (invoicesRes.data ?? []) as InvoiceRow[];
    const expenses = (expensesRes.data ?? []) as ExpenseRow[];
    const customers = (customersRes.data ?? []) as CustomerRow[];

    const totalRevenue = invoices
      .filter((i) => i.status !== "cancelled" && i.status !== "returned")
      .reduce((s, i) => s + Number(i.total), 0);

    const totalDiscount = invoices
      .filter((i) => i.status !== "cancelled" && i.status !== "returned")
      .reduce((s, i) => s + Number(i.discount_amount), 0);

    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const grossProfit = totalRevenue - totalDiscount;
    const netProfit = grossProfit - totalExpenses;
    const receivables = customers.reduce(
      (s, c) => s + Number(c.outstanding_balance),
      0
    );
    const payables = 0;

    const now = new Date();
    const months: Date[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d);
    }

    const revenueData = months.map((d) => {
      const key = getMonthKey(d);
      const monthInvoices = invoices.filter(
        (inv) =>
          inv.created_at.startsWith(key) &&
          inv.status !== "cancelled" &&
          inv.status !== "returned"
      );
      return {
        name: getMonthLabel(d),
        value: monthInvoices.reduce((s, inv) => s + Number(inv.total), 0),
      };
    });

    const profitExpenseData: MonthData[] = months.map((d) => {
      const key = getMonthKey(d);
      const monthInvoices = invoices.filter(
        (inv) =>
          inv.created_at.startsWith(key) &&
          inv.status !== "cancelled" &&
          inv.status !== "returned"
      );
      const monthExpenses = expenses.filter((e) => e.created_at.startsWith(key));
      const rev = monthInvoices.reduce((s, inv) => s + Number(inv.total), 0);
      const exp = monthExpenses.reduce((s, e) => s + Number(e.amount), 0);
      return {
        month: getMonthLabel(d),
        revenue: rev,
        expenses: exp,
        profit: rev - exp,
      };
    });

    const cashFlowData = months.map((d) => {
      const key = getMonthKey(d);
      const monthInvoices = invoices.filter(
        (inv) =>
          inv.created_at.startsWith(key) &&
          inv.status !== "cancelled" &&
          inv.status !== "returned"
      );
      const monthExpenses = expenses.filter((e) => e.created_at.startsWith(key));
      const inflow = monthInvoices.reduce((s, inv) => s + Number(inv.total), 0);
      const outflow = monthExpenses.reduce((s, e) => s + Number(e.amount), 0);
      return {
        name: getMonthLabel(d),
        value: inflow - outflow,
      };
    });

    const marginData = profitExpenseData.map((d) => ({
      name: d.month,
      value: d.revenue > 0 ? Number(((d.profit / d.revenue) * 100).toFixed(1)) : 0,
    }));

    setData({
      totalRevenue,
      grossProfit,
      netProfit,
      totalExpenses,
      receivables,
      payables,
      revenueData,
      profitExpenseData,
      cashFlowData,
      marginData,
    });
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    load();
  }, [load]);

  const formatCurrency = useMemo(
    () => (v: number) => `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
    []
  );

  const formatPercent = useMemo(
    () => (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`,
    []
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-56 mb-1" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-80 rounded-xl bg-muted animate-pulse" />
          <div className="h-80 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const hasAnyData = data.totalRevenue > 0 || data.totalExpenses > 0;

  if (!hasAnyData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Revenue, profit and cash flow
          </p>
        </div>
        <EmptyState
          icon={<DollarSign className="h-12 w-12" />}
          title="No financial data yet"
          description="Create invoices and track expenses to see your financial overview."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financial Dashboard</h1>
        <p className="text-muted-foreground">
          Revenue, profit and cash flow
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          label="Revenue"
          value={formatCurrency(data.totalRevenue)}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          label="Gross Profit"
          value={formatCurrency(data.grossProfit)}
          icon={<DollarSign className="h-4 w-4" />}
          variant={data.grossProfit < 0 ? "danger" : "default"}
        />
        <MetricCard
          label="Net Profit"
          value={formatCurrency(data.netProfit)}
          icon={data.netProfit >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          variant={data.netProfit < 0 ? "danger" : "default"}
        />
        <MetricCard
          label="Expenses"
          value={formatCurrency(data.totalExpenses)}
          icon={<Receipt className="h-4 w-4" />}
        />
        <MetricCard
          label="Receivables"
          value={formatCurrency(data.receivables)}
          icon={<Wallet className="h-4 w-4" />}
          variant={data.receivables > 0 ? "warning" : "default"}
        />
        <MetricCard
          label="Payables"
          value={formatCurrency(data.payables)}
          icon={<CreditCard className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {data.revenueData.some((d) => d.value > 0) && (
          <BizoraChart
            type="area"
            data={data.revenueData}
            dataKey="value"
            xAxisKey="name"
            title="Revenue Trend"
            subtitle="Last 12 months"
            formatValue={formatCurrency}
            height={280}
          />
        )}
        {data.profitExpenseData.some((d) => d.revenue > 0 || d.expenses > 0) && (
          <BizoraChart
            type="bar"
            data={data.profitExpenseData.map((d) => ({
              name: d.month,
              Revenue: d.revenue,
              Expenses: d.expenses,
            }))}
            dataKey="Revenue"
            dataKeys={[
              { key: "Revenue", color: "#0a0a0a", label: "Revenue" },
              { key: "Expenses", color: "#DC2626", label: "Expenses" },
            ]}
            xAxisKey="name"
            title="Profit vs Expenses"
            subtitle="Last 12 months"
            formatValue={formatCurrency}
            showLegend
            height={280}
          />
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {data.cashFlowData.some((d) => d.value !== 0) && (
          <BizoraChart
            type="line"
            data={data.cashFlowData}
            dataKey="value"
            xAxisKey="name"
            title="Cash Flow"
            subtitle="Net inflow/outflow"
            formatValue={formatCurrency}
            color="#DC2626"
            height={280}
          />
        )}
        {data.marginData.some((d) => d.value !== 0) && (
          <BizoraChart
            type="line"
            data={data.marginData.map((d) => ({
              ...d,
              value: d.value,
              isNegative: d.value < 0,
            }))}
            dataKey="value"
            xAxisKey="name"
            title="Profit Margin Trend"
            subtitle="Percentage over time"
            formatValue={formatPercent}
            color="#DC2626"
            height={280}
          />
        )}
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <th className="pb-3 pr-4">Month</th>
                  <th className="pb-3 pr-4 text-right">Revenue</th>
                  <th className="pb-3 pr-4 text-right">Expenses</th>
                  <th className="pb-3 text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {[...data.profitExpenseData].reverse().map((d) => (
                  <tr
                    key={d.month}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium">{d.month}</td>
                    <td className="py-3 pr-4 text-right">{formatCurrency(d.revenue)}</td>
                    <td className="py-3 pr-4 text-right">{formatCurrency(d.expenses)}</td>
                    <td
                      className={`py-3 text-right font-semibold ${
                        d.profit < 0 ? "text-[#DC2626]" : "text-foreground"
                      }`}
                    >
                      {formatCurrency(d.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  variant = "default",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  variant?: "default" | "warning" | "danger";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p
            className={`mt-1.5 text-lg font-bold tracking-tight financial-number ${
              variant === "danger"
                ? "text-[#DC2626]"
                : variant === "warning"
                ? "text-[#737373]"
                : "text-foreground"
            }`}
          >
            {value}
          </p>
        </div>
        <div className="rounded-lg bg-muted p-2 text-muted-foreground">{icon}</div>
      </div>
    </div>
  );
}
