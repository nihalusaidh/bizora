"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getEstimates, deleteEstimate, convertEstimateToInvoice } from "@/server/actions/estimates";
import { useBusiness } from "@/lib/store";
import {
  ArrowLeft, Plus, FileText, Trash2, ArrowRight, Clock,
  CheckCircle, XCircle, Send, RefreshCw
} from "lucide-react";

interface Estimate {
  id: string;
  estimate_number: string;
  status: string;
  total: number;
  valid_until?: string | null;
  created_at: string;
  customers?: { name: string; phone?: string | null } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  draft: { label: "Draft", color: "bg-muted text-foreground", icon: Clock },
  sent: { label: "Sent", color: "bg-muted text-foreground", icon: Send },
  accepted: { label: "Accepted", color: "bg-muted text-foreground", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-[#DC2626]/10 text-[#DC2626]", icon: XCircle },
  expired: { label: "Expired", color: "bg-[#DC2626]/10 text-[#DC2626]", icon: XCircle },
  converted: { label: "Converted", color: "bg-muted text-foreground", icon: RefreshCw },
};

export default function EstimatesPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await getEstimates(businessId, statusFilter);
      setEstimates(data);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId, statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id: string) => {
    if (!businessId) return;
    if (!confirm("Delete this estimate?")) return;
    try {
      await deleteEstimate(businessId, id);
      loadData();
    } catch (err) {
      console.error("Failed:", err);
    }
  };

  const handleConvert = async (id: string) => {
    if (!businessId) return;
    if (!confirm("Convert this estimate to an invoice?")) return;
    try {
      const invoice = await convertEstimateToInvoice(businessId, id);
      loadData();
      router.push(`/billing/invoices/${invoice.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to convert");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/billing")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Estimates</h1>
            <p className="text-muted-foreground">{estimates.length} estimates</p>
          </div>
        </div>
        <Button onClick={() => router.push("/billing/estimates/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Estimate
        </Button>
      </div>

      <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
        <SelectTrigger>
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Estimates</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="sent">Sent</SelectItem>
          <SelectItem value="accepted">Accepted</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="converted">Converted</SelectItem>
        </SelectContent>
      </Select>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : estimates.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No estimates yet</h3>
          <p className="text-muted-foreground mb-4">Create your first estimate</p>
          <Button onClick={() => router.push("/billing/estimates/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Estimate
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {estimates.map((est) => {
            const statusCfg = STATUS_CONFIG[est.status] || STATUS_CONFIG.draft;
            const StatusIcon = statusCfg.icon;
            return (
              <div key={est.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{est.estimate_number}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusCfg.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {est.customers?.name || "Walk-in Customer"}
                    </div>
                    {est.valid_until && (
                      <div className="text-xs text-muted-foreground">
                        Valid until: {new Date(est.valid_until).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{est.total.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(est.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {est.status !== "converted" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-foreground"
                        onClick={() => handleConvert(est.id)}
                        title="Convert to Invoice"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#DC2626]"
                      onClick={() => handleDelete(est.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
