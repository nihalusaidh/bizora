"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DateRangePicker } from "@/components/reports/date-range-picker";
import { StatCard } from "@/components/reports/stat-card";
import { getProfitLossReport } from "@/server/actions/reports";
import { useBusiness } from "@/lib/store";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";

interface PLData {
  revenue: {
    totalRevenue: number;
    totalCollected: number;
    totalPending: number;
    totalTax: number;
    totalDiscount: number;
    invoiceCount: number;
    avgInvoiceValue: number;
  };
  expenses: {
    totalExpenses: number;
    byCategory: Array<{ name: string; amount: number; icon: string; color: string }>;
  };
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
}

function getInitialDates() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    start: start.toISOString().split("T")[0],
    end: now.toISOString().split("T")[0],
  };
}

export default function ProfitLossPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [startDate, setStartDate] = useState(getInitialDates().start);
  const [endDate, setEndDate] = useState(getInitialDates().end);
  const [data, setData] = useState<PLData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const result = await getProfitLossReport(businessId, { start_date: startDate, end_date: endDate });
      setData(result);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId, startDate, endDate]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/insights")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profit & Loss</h1>
          <p className="text-muted-foreground">Financial overview</p>
        </div>
      </div>

      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onChange={(s, e) => { setStartDate(s); setEndDate(e); }}
      />

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <>
          {/* P&L Statement */}
          <Card>
            <CardContent className="p-6 space-y-4">
              {/* Revenue Section */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">REVENUE</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Gross Sales</span>
                    <span>₹{data.revenue.totalRevenue.toLocaleString()}</span>
                  </div>
                  {data.revenue.totalDiscount > 0 && (
                    <div className="flex justify-between text-sm text-foreground">
                      <span>Discounts</span>
                      <span>-₹{data.revenue.totalDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Net Revenue</span>
                    <span>₹{(data.revenue.totalRevenue - data.revenue.totalDiscount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Expenses Section */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">EXPENSES</h3>
                <div className="space-y-2">
                  {data.expenses.byCategory.map((cat) => (
                    <div key={cat.name} className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <span>{cat.icon}</span>
                        {cat.name}
                      </span>
                      <span className="text-[#DC2626]">-₹{cat.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {data.expenses.byCategory.length === 0 && (
                    <div className="text-sm text-muted-foreground">No expenses recorded</div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Expenses</span>
                    <span className="text-[#DC2626]">-₹{data.expenses.totalExpenses.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className="pt-4 border-t-2">
                <div className="flex justify-between text-xl font-bold">
                  <span>Net Profit</span>
                  <span className={data.netProfit >= 0 ? "text-foreground" : "text-[#DC2626]"}>
                    ₹{Math.abs(data.netProfit).toLocaleString()}
                    {data.netProfit < 0 && " (Loss)"}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>Profit Margin</span>
                  <span>{data.profitMargin.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-foreground" />
                  <span className="text-sm text-muted-foreground">Revenue</span>
                </div>
                <div className="text-2xl font-bold">₹{data.revenue.totalRevenue.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{data.revenue.invoiceCount} invoices</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-[#DC2626]" />
                  <span className="text-sm text-muted-foreground">Expenses</span>
                </div>
                <div className="text-2xl font-bold text-[#DC2626]">₹{data.expenses.totalExpenses.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{data.expenses.byCategory.length} categories</div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
