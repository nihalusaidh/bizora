"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/reports/date-range-picker";
import { StatCard } from "@/components/reports/stat-card";
import { getGstReport } from "@/server/actions/reports";
import { useBusiness } from "@/lib/store";
import { ArrowLeft } from "lucide-react";

interface GstData {
  totalTaxable: number;
  totalTax: number;
  invoiceCount: number;
  invoiceDetails: Array<{
    invoice_number: string;
    date: string;
    taxable_amount: number;
    tax_amount: number;
    total: number;
    status: string;
  }>;
}

function getInitialDates() {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3);
  const start = new Date(now.getFullYear(), quarter * 3, 1);
  return {
    start: start.toISOString().split("T")[0],
    end: now.toISOString().split("T")[0],
  };
}

export default function GstReportPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [startDate, setStartDate] = useState(getInitialDates().start);
  const [endDate, setEndDate] = useState(getInitialDates().end);
  const [data, setData] = useState<GstData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const result = await getGstReport(businessId, { start_date: startDate, end_date: endDate });
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
          <h1 className="text-2xl font-bold tracking-tight">GST Report</h1>
          <p className="text-muted-foreground">Tax summary for filing</p>
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
            <StatCard label="Total Taxable" value={data.totalTaxable.toLocaleString()} prefix="₹" />
            <StatCard label="GST Collected" value={data.totalTax.toLocaleString()} prefix="₹" variant="success" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoice-wise GST ({data.invoiceCount} invoices)</CardTitle>
            </CardHeader>
            <CardContent>
              {data.invoiceDetails.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No invoices for this period</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-semibold">Invoice</th>
                        <th className="text-left py-2 font-semibold">Date</th>
                        <th className="text-right py-2 font-semibold">Taxable</th>
                        <th className="text-right py-2 font-semibold">GST</th>
                        <th className="text-right py-2 font-semibold">Total</th>
                        <th className="text-right py-2 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.invoiceDetails.map((inv) => (
                        <tr key={inv.invoice_number} className="border-b">
                          <td className="py-2 font-medium">{inv.invoice_number}</td>
                          <td className="py-2 text-muted-foreground">{inv.date}</td>
                          <td className="py-2 text-right">₹{inv.taxable_amount.toLocaleString()}</td>
                          <td className="py-2 text-right text-foreground">₹{inv.tax_amount.toLocaleString()}</td>
                          <td className="py-2 text-right font-medium">₹{inv.total.toLocaleString()}</td>
                          <td className="py-2 text-right">
                            <Badge variant={inv.status === "paid" ? "default" : "secondary"} className="text-xs">
                              {inv.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 font-bold">
                        <td colSpan={2} className="py-2">Total</td>
                        <td className="py-2 text-right">₹{data.totalTaxable.toLocaleString()}</td>
                        <td className="py-2 text-right text-foreground">₹{data.totalTax.toLocaleString()}</td>
                        <td className="py-2 text-right">₹{(data.totalTaxable + data.totalTax).toLocaleString()}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
