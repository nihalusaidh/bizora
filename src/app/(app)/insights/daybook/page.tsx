"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDayBook, type DayBook } from "@/server/actions/reports";
import { useBusiness } from "@/lib/store";
import { ArrowLeft, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";

function shift(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export default function DayBookPage() {
  const { businessId } = useBusiness();
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [data, setData] = useState<DayBook | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      setData(await getDayBook(businessId, date));
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [businessId, date]);

  useEffect(() => { load(); }, [load]);

  const ins = data?.entries.filter((e) => e.kind === "in") || [];
  const outs = data?.entries.filter((e) => e.kind === "out") || [];

  return (
    <div className="space-y-4 animate-fade-in pb-24 lg:pb-6">
      <div className="flex items-center gap-3">
        <Link href="/insights" className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent h-8 w-8">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Day Book</h1>
          <p className="text-muted-foreground text-sm">Every rupee in & out, one ledger</p>
        </div>
      </div>

      {/* Date stepper — Vyapar-simple */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setDate(shift(date, -1))} aria-label="Previous day">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Input type="date" value={date} max={today} onChange={(e) => e.target.value && setDate(e.target.value)} className="text-center font-bold" />
        <Button variant="outline" size="icon" onClick={() => setDate(shift(date, 1))} disabled={date >= today} aria-label="Next day">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : !data ? (
        <p className="text-center text-sm text-muted-foreground py-8">Couldn&apos;t load this day.</p>
      ) : (
        <>
          <div className="rounded-2xl bg-[#DC2626] text-white p-4 shadow-sm">
            <p className="text-[11px] uppercase tracking-wider text-white/70 font-bold">
              {new Date(date + "T12:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <div className="grid grid-cols-3 gap-2 mt-2 text-center">
              <div className="rounded-xl bg-white/15 p-2">
                <p className="text-[10px] text-white/70">Money in</p>
                <p className="font-extrabold">₹{data.moneyIn.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-xl bg-white/15 p-2">
                <p className="text-[10px] text-white/70">Money out</p>
                <p className="font-extrabold">₹{data.moneyOut.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-xl bg-white p-2">
                <p className="text-[10px] text-[#DC2626]/70 font-bold">Net</p>
                <p className={`font-extrabold ${data.net >= 0 ? "text-[#DC2626]" : "text-[#DC2626]"}`}>
                  {data.net >= 0 ? "+" : "−"}₹{Math.abs(data.net).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {data.entries.length === 0 && (
            <div className="rounded-xl border border-red-100 bg-white p-8 text-center">
              <p className="font-bold">No entries this day</p>
              <p className="text-xs text-muted-foreground mt-1">Bills, collections & expenses will appear here.</p>
            </div>
          )}

          {ins.length > 0 && (
            <>
              <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#DC2626]">Money in ({ins.length})</h2>
              <div className="space-y-2">
                {ins.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 rounded-xl border border-red-100 bg-white p-3">
                    <div className="h-10 w-10 rounded-lg bg-[#FEF2F2] border border-red-100 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-5 w-5 text-[#DC2626]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{e.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{e.detail}</p>
                    </div>
                    <span className="text-sm font-extrabold text-[#DC2626]">+₹{e.amount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {outs.length > 0 && (
            <>
              <h2 className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground">Money out ({outs.length})</h2>
              <div className="space-y-2">
                {outs.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 rounded-xl border bg-white p-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <TrendingDown className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{e.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{e.detail}</p>
                    </div>
                    <span className="text-sm font-extrabold">−₹{e.amount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
