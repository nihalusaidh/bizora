"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getJournalEntries } from "@/server/actions/accounting";
import { useBusiness } from "@/lib/store";
import Link from "next/link";
import { ArrowLeft, BookOpen, Plus } from "lucide-react";

interface JournalEntry {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  total_debit: number;
  total_credit: number;
  status: string;
  reference_type?: string | null;
  journal_entry_lines?: Array<{ account_name: string; debit: number; credit: number }>;
}

export default function JournalPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try { setEntries(await getJournalEntries(businessId, statusFilter)); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [businessId, statusFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/insights" className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div><h1 className="text-2xl font-bold tracking-tight">Journal Entries</h1><p className="text-muted-foreground">{entries.length} entries</p></div>
        </div>
        <Button onClick={() => router.push("/insights/journal/new")}><Plus className="mr-2 h-4 w-4" />New Entry</Button>
      </div>

      <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
        <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="posted">Posted</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="reversed">Reversed</SelectItem>
        </SelectContent>
      </Select>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No journal entries</h3>
          <p className="text-muted-foreground mb-4">Entries are auto-created from invoices and expenses</p>
          <Button onClick={() => router.push("/insights/journal/new")}><Plus className="mr-2 h-4 w-4" />Create Manual Entry</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{entry.entry_number}</span>
                      <Badge variant={entry.status === "posted" ? "default" : entry.status === "reversed" ? "destructive" : "secondary"}>{entry.status}</Badge>
                      {entry.reference_type && <span className="text-xs text-muted-foreground">({entry.reference_type})</span>}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{entry.description}</div>
                    {entry.journal_entry_lines && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {entry.journal_entry_lines.slice(0, 3).map((l, i) => (
                          <span key={i}>{l.account_name} ({l.debit > 0 ? `Dr ₹${l.debit}` : `Cr ₹${l.credit}`}){i < 2 ? " → " : ""}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">₹{entry.total_debit.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{new Date(entry.entry_date).toLocaleDateString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
