"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInvoices, deleteInvoice, updateInvoiceStatus } from "@/server/actions/invoices";
import { ExportButton } from "@/components/export/export-button";
import { formatInvoicesForCsv } from "@/lib/export";
import { useBusiness } from "@/lib/store";
import {
  ArrowLeft, Plus, Search, Receipt, Trash2, Eye,
  CheckCircle, XCircle, Clock, Send
} from "lucide-react";

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total: number;
  amount_paid: number;
  created_at: string;
  customers?: { name: string; phone?: string | null } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  draft: { label: "Draft", color: "bg-muted text-foreground", icon: Clock },
  sent: { label: "Sent", color: "bg-muted text-foreground", icon: Send },
  paid: { label: "Paid", color: "bg-muted text-foreground", icon: CheckCircle },
  partial: { label: "Partial", color: "bg-muted text-foreground", icon: Clock },
  cancelled: { label: "Cancelled", color: "bg-[#DC2626]/10 text-[#DC2626]", icon: XCircle },
  returned: { label: "Returned", color: "bg-[#DC2626]/10 text-[#DC2626]", icon: XCircle },
};

export default function InvoicesPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadInvoices = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await getInvoices(businessId, statusFilter);
      setInvoices(data);
    } catch (err) {
      console.error("Failed to load invoices:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId, statusFilter]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleDelete = async (id: string) => {
    if (!businessId) return;
    if (!confirm("Delete this invoice?")) return;
    try {
      await deleteInvoice(businessId, id);
      loadInvoices();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleMarkPaid = async (id: string, total: number) => {
    if (!businessId) return;
    try {
      await updateInvoiceStatus(businessId, id, "paid", total);
      loadInvoices();
    } catch (err) {
      console.error("Failed to mark paid:", err);
    }
  };

  const totalRevenue = invoices
    .filter((i) => i.status === "paid" || i.status === "partial")
    .reduce((sum, i) => sum + (i.amount_paid || 0), 0);

  const totalOutstanding = invoices
    .filter((i) => i.status !== "paid" && i.status !== "cancelled")
    .reduce((sum, i) => sum + (i.total - (i.amount_paid || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/billing")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">{invoices.length} invoices</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={formatInvoicesForCsv(invoices as unknown as Record<string, unknown>[])}
            filename={`invoices-${new Date().toISOString().split("T")[0]}`}
          />
          <Button onClick={() => router.push("/billing")}>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Revenue Collected</div>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-[#DC2626]">₹{totalOutstanding.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Outstanding</div>
        </div>
      </div>

      {/* Filter */}
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
        <SelectTrigger>
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Invoices</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="partial">Partial</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {/* Invoice List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
          <p className="text-muted-foreground mb-4">Create your first invoice to get started</p>
          <Button onClick={() => router.push("/billing")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => {
            const statusCfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft;
            const StatusIcon = statusCfg.icon;
            return (
              <Link
                key={invoice.id}
                href={`/billing/invoices/${invoice.id}`}
                className="block rounded-xl border bg-card p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{invoice.invoice_number}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusCfg.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {invoice.customers?.name || "Walk-in Customer"}
                      {invoice.customers?.phone ? ` • ${invoice.customers.phone}` : ""}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{invoice.total.toLocaleString()}</div>
                    {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                      <div className="text-xs text-[#DC2626]">
                        Due: ₹{(invoice.total - (invoice.amount_paid || 0)).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-foreground"
                        onClick={(e) => {
                          e.preventDefault();
                          handleMarkPaid(invoice.id, invoice.total);
                        }}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#DC2626]"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(invoice.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
