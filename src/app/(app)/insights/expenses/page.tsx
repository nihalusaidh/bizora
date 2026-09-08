"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/reports/date-range-picker";
import { StatCard } from "@/components/reports/stat-card";
import { getExpenseReport } from "@/server/actions/reports";
import { useBusiness } from "@/lib/store";
import { ArrowLeft } from "lucide-react";

interface ExpenseData {
  totalExpenses: number;
  expenseCount: number;
  byCategory: Array<{ name: string; amount: number; count: number; icon: string; color: string }>;
  daily: Array<{ date: string; amount: number }>;
  byMethod: Array<{ method: string; amount: number }>;
}

function getInitialDates() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    start: start.toISOString().split("T")[0],
    end: now.toISOString().split("T")[0],
  };
}

export default function ExpenseReportPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [startDate, setStartDate] = useState(getInitialDates().start);
  const [endDate, setEndDate] = useState(getInitialDates().end);
  const [data, setData] = useState<ExpenseData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const result = await getExpenseReport(businessId, { start_date: startDate, end_date: endDate });
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

  const maxDaily = data ? Math.max(...data.daily.map((d) => d.amount), 1) : 1;
  const maxCat = data ? Math.max(...data.byCategory.map((c) => c.amount), 1) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/insights")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expense Report</h1>
          <p className="text-muted-foreground">Spending breakdown and trends</p>
        </div>
      </div>

      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onChange={(s, e) => { setStartDate(s); setEndDate(e); }}
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total Expenses" value={data.totalExpenses.toLocaleString()} prefix="₹" variant="destructive" />
            <StatCard label="Transactions" value={String(data.expenseCount)} />
          </div>

          {/* Category Breakdown */}
          {data.byCategory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.byCategory.map((cat) => (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span className="text-sm font-medium">{cat.name}</span>
                          <span className="text-xs text-muted-foreground">({cat.count})</span>
                        </div>
                        <span className="text-sm font-bold">₹{cat.amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${(cat.amount / maxCat) * 100}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Daily Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-40">
                {data.daily.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-destructive/20 rounded-t"
                      style={{ height: `${(day.amount / maxDaily) * 120}px`, minHeight: "2px" }}
                    />
                    <div className="text-[10px] text-muted-foreground mt-1 rotate-45 origin-left">
                      {day.date.split("-")[2]}
                    </div>
                  </div>
                ))}
                {data.daily.length === 0 && (
                  <div className="w-full text-center text-muted-foreground py-8">No data for this period</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          {data.byMethod.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.byMethod.map((m) => (
                    <div key={m.method} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span className="text-sm capitalize">{m.method.replace("_", " ")}</span>
                      <span className="font-bold">₹{m.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
