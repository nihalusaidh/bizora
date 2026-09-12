"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { generateBalanceSheet } from "@/server/actions/accounting";
import { useBusiness } from "@/lib/store";
import { ArrowLeft, TrendingUp, TrendingDown, Scale, Wallet, CreditCard } from "lucide-react";

interface Account { name: string; type: string; balance: number; }
interface BalanceSheet {
  assets: Account[];
  liabilities: Account[];
  equity: Account[];
  revenue: Account[];
  expenses: Account[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

export default function BalanceSheetPage() {
  const { businessId } = useBusiness();
  const [data, setData] = useState<BalanceSheet | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try { setData(await generateBalanceSheet(businessId)); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/insights" className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent h-8 w-8">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div><h1 className="text-2xl font-bold tracking-tight">Balance Sheet</h1><p className="text-muted-foreground">Financial position snapshot</p></div>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : !data ? (
        <div className="rounded-xl border bg-card p-8 text-center"><p className="text-muted-foreground">No financial data yet</p></div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">₹{data.totalAssets.toLocaleString()}</div><div className="text-xs text-muted-foreground">Total Assets</div></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-[#DC2626]">₹{data.totalLiabilities.toLocaleString()}</div><div className="text-xs text-muted-foreground">Total Liabilities</div></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">₹{data.totalEquity.toLocaleString()}</div><div className="text-xs text-muted-foreground">Equity</div></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><div className={`text-2xl font-bold ${data.netIncome >= 0 ? "text-green-500" : "text-[#DC2626]"}`}>₹{data.netIncome.toLocaleString()}</div><div className="text-xs text-muted-foreground">Net Income</div></CardContent></Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wallet className="h-4 w-4" /> Assets</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {data.assets.length === 0 ? <p className="text-sm text-muted-foreground">No asset accounts</p> : data.assets.map((a) => (
                  <div key={a.name} className="flex justify-between text-sm"><span className="text-muted-foreground">{a.name}</span><span className="font-medium">₹{a.balance.toLocaleString()}</span></div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold"><span>Total Assets</span><span>₹{data.totalAssets.toLocaleString()}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" /> Liabilities</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {data.liabilities.length === 0 ? <p className="text-sm text-muted-foreground">No liability accounts</p> : data.liabilities.map((a) => (
                  <div key={a.name} className="flex justify-between text-sm"><span className="text-muted-foreground">{a.name}</span><span className="font-medium">₹{a.balance.toLocaleString()}</span></div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold"><span>Total Liabilities</span><span>₹{data.totalLiabilities.toLocaleString()}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Revenue</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {data.revenue.length === 0 ? <p className="text-sm text-muted-foreground">No revenue</p> : data.revenue.map((a) => (
                  <div key={a.name} className="flex justify-between text-sm"><span className="text-muted-foreground">{a.name}</span><span className="font-medium">₹{a.balance.toLocaleString()}</span></div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold"><span>Total Revenue</span><span>₹{data.totalRevenue.toLocaleString()}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingDown className="h-4 w-4" /> Expenses</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {data.expenses.length === 0 ? <p className="text-sm text-muted-foreground">No expenses</p> : data.expenses.map((a) => (
                  <div key={a.name} className="flex justify-between text-sm"><span className="text-muted-foreground">{a.name}</span><span className="font-medium">₹{a.balance.toLocaleString()}</span></div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold"><span>Total Expenses</span><span>₹{data.totalExpenses.toLocaleString()}</span></div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
