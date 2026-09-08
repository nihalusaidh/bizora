"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DateRangePicker } from "@/components/reports/date-range-picker";
import { StatCard } from "@/components/reports/stat-card";
import { getRevenueReport } from "@/server/actions/reports";
import { useBusiness } from "@/lib/store";
import { ArrowLeft, TrendingUp, Download } from "lucide-react";

interface RevenueData {
  totalRevenue: number;
  totalCollected: number;
  totalPending: number;
  totalTax: number;
  totalDiscount: number;
  invoiceCount: number;
  paidCount: number;
  avgInvoiceValue: number;
  daily: Array<{ date: string; amount: number }>;
  topCustomers: Array<{ name: string; total: number; count: number }>;
}

function getInitialDates() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    start: start.toISOString().split("T")[0],
    end: now.toISOString().split("T")[0],
  };
}

export default function RevenueReportPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [startDate, setStartDate] = useState(getInitialDates().start);
  const [endDate, setEndDate] = useState(getInitialDates().end);
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const result = await getRevenueReport(businessId, { start_date: startDate, end_date: endDate });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/insights")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Revenue Report</h1>
            <p className="text-muted-foreground">Sales and collection analytics</p>
          </div>
        </div>
      </div>

      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onChange={(s, e) => {
          setStartDate(s);
          setEndDate(e);
        }}
      />

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Revenue" value={data.totalRevenue.toLocaleString()} prefix="₹" variant="success" />
            <StatCard label="Collected" value={data.totalCollected.toLocaleString()} prefix="₹" />
            <StatCard label="Pending" value={data.totalPending.toLocaleString()} prefix="₹" variant="destructive" />
            <StatCard label="Avg Invoice" value={data.avgInvoiceValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} prefix="₹" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Invoices" value={String(data.invoiceCount)} />
            <StatCard label="Paid" value={String(data.paidCount)} />
            <StatCard label="GST Collected" value={data.totalTax.toLocaleString()} prefix="₹" />
          </div>

          {/* Daily Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-40">
                {data.daily.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-primary/20 rounded-t"
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

          {/* Top Customers */}
          {data.topCustomers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.topCustomers.map((customer, index) => (
                    <div key={customer.name} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{customer.name}</div>
                        <div className="text-xs text-muted-foreground">{customer.count} invoices</div>
                      </div>
                      <div className="font-bold">₹{customer.total.toLocaleString()}</div>
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
