"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createJournalEntry } from "@/server/actions/accounting";
import { useBusiness } from "@/lib/store";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";

const ACCOUNT_TYPES = ["asset", "liability", "equity", "revenue", "expense"] as const;
const ACCOUNT_NAMES = [
  "cash", "bank", "accounts_receivable", "accounts_payable", "inventory",
  "sales", "sales_returns", "purchases", "purchase_returns",
  "cgst_input", "sgst_input", "igst_input", "cgst_output", "sgst_output", "igst_output",
  "rent", "salaries", "utilities", "marketing", "depreciation", "capital", "retained_earnings",
];

interface Line { account_name: string; account_type: string; debit: number; credit: number; description: string; }

export default function NewJournalEntryPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [lines, setLines] = useState<Line[]>([
    { account_name: "", account_type: "asset", debit: 0, credit: 0, description: "" },
    { account_name: "", account_type: "asset", debit: 0, credit: 0, description: "" },
  ]);
  const [loading, setLoading] = useState(false);

  const updateLine = (i: number, field: keyof Line, value: string | number) => {
    const next = lines.map((line, idx) => idx === i ? { ...line, [field]: value } : line);
    setLines(next);
  };
  const addLine = () => setLines([...lines, { account_name: "", account_type: "asset", debit: 0, credit: 0, description: "" }]);
  const removeLine = (i: number) => { if (lines.length > 2) setLines(lines.filter((_, idx) => idx !== i)); };

  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleSubmit = async () => {
    if (!businessId || !description) return;
    setLoading(true);
    try {
      await createJournalEntry(businessId, { description, entry_date: entryDate, lines: lines.map((l) => ({ ...l, account_type: l.account_type as "asset" | "liability" | "equity" | "revenue" | "expense" })) });
      router.push("/insights/journal");
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h1 className="text-2xl font-bold tracking-tight">New Journal Entry</h1></div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-2"><Label>Description *</Label><Input placeholder="e.g. Record sales for the day" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="space-y-2"><Label>Date</Label><Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Journal Lines</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {lines.map((line, i) => (
            <div key={i} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Select value={line.account_name} onValueChange={(v) => v && updateLine(i, "account_name", v)}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Account" /></SelectTrigger>
                  <SelectContent>{ACCOUNT_NAMES.map((a) => <SelectItem key={a} value={a}>{a.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={line.account_type} onValueChange={(v) => v && updateLine(i, "account_type", v)}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>{ACCOUNT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
                {lines.length > 2 && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeLine(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1"><Label className="text-xs">Debit ₹</Label><Input type="number" min="0" step="0.01" value={line.debit || ""} onChange={(e) => updateLine(i, "debit", parseFloat(e.target.value) || 0)} /></div>
                <div className="space-y-1"><Label className="text-xs">Credit ₹</Label><Input type="number" min="0" step="0.01" value={line.credit || ""} onChange={(e) => updateLine(i, "credit", parseFloat(e.target.value) || 0)} /></div>
                <div className="space-y-1"><Label className="text-xs">Description</Label><Input placeholder="Note" value={line.description} onChange={(e) => updateLine(i, "description", e.target.value)} /></div>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addLine}><Plus className="mr-2 h-4 w-4" />Add Line</Button>
          <div className="flex justify-between text-sm pt-2 border-t">
            <span>Total Debit: ₹{totalDebit.toFixed(2)}</span>
            <span>Total Credit: ₹{totalCredit.toFixed(2)}</span>
            <span className={isBalanced ? "text-green-500" : "text-[#DC2626]"}>{isBalanced ? "Balanced ✓" : "Not balanced"}</span>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={loading || !description || !isBalanced} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Post Entry
      </Button>
    </div>
  );
}
