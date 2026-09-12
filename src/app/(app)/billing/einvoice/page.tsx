"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateEinvoice, getEinvoiceLog } from "@/server/actions/einvoice";
import { useBusiness } from "@/lib/store";
import { ArrowLeft, FileCheck, Loader2, Shield } from "lucide-react";

interface EinvoiceEntry {
  id: string;
  irn?: string | null;
  ack_number?: string | null;
  status: string;
  created_at: string;
  invoices?: { invoice_number: string } | null;
}

export default function EinvoicePage() {
  const { businessId, business } = useBusiness();
  const router = useRouter();
  const [invoiceId, setInvoiceId] = useState("");
  const [invoices, setInvoices] = useState<Array<{ id: string; invoice_number: string; irn?: string | null }>>([]);
  const [log, setLog] = useState<EinvoiceEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const load = useCallback(async () => {
    if (!businessId) return;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const [invRes, logRes] = await Promise.all([
      supabase.from("invoices").select("id, invoice_number, irn").eq("business_id", businessId).eq("status", "paid").order("created_at", { ascending: false }),
      getEinvoiceLog(businessId),
    ]);
      setInvoices(invRes.data || []);
      setLog(logRes as EinvoiceEntry[]);
    setDataLoading(false);
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async () => {
    if (!businessId || !invoiceId) return;
    setLoading(true);
    try {
      await generateEinvoice(businessId, invoiceId, "sandbox");
      setInvoiceId("");
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/billing")}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h1 className="text-2xl font-bold tracking-tight">E-Invoice</h1><p className="text-muted-foreground">Generate IRN for GST-registered invoices</p></div>
      </div>

      {business?.gst_status !== "registered" ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">GST Registration Required</h3>
            <p className="text-muted-foreground mb-4">E-Invoice is only available for GST-registered businesses</p>
            <Button variant="outline" onClick={() => router.push("/settings")}>Go to Settings</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader><CardTitle className="text-base">Generate E-Invoice</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select value={invoiceId} onValueChange={(v) => setInvoiceId(v ?? "")}>
                <SelectTrigger><SelectValue placeholder="Select paid invoice" /></SelectTrigger>
                <SelectContent>
                  {invoices.filter((i) => !i.irn).map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>{inv.invoice_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleGenerate} disabled={loading || !invoiceId}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCheck className="mr-2 h-4 w-4" />}
                Generate IRN (Sandbox)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">E-Invoice Log</CardTitle></CardHeader>
            <CardContent>
              {dataLoading ? <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div>
              : log.length === 0 ? <p className="text-sm text-muted-foreground">No e-invoices generated yet</p>
              : (
                <div className="space-y-2">
                  {log.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <span className="font-medium text-sm">{entry.invoices?.invoice_number}</span>
                        {entry.irn && <div className="text-xs font-mono text-muted-foreground mt-1">IRN: {entry.irn}</div>}
                        {entry.ack_number && <div className="text-xs text-muted-foreground">Ack: {entry.ack_number}</div>}
                      </div>
                      <Badge variant={entry.status === "generated" ? "default" : "destructive"}>{entry.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
