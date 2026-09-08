"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPurchaseOrders, updatePurchaseOrderStatus, deletePurchaseOrder } from "@/server/actions/purchase-orders";
import { useBusiness } from "@/lib/store";
import {
  ArrowLeft, Plus, Trash2, CheckCircle, Package,
  Clock, Send, XCircle, Truck
} from "lucide-react";

interface PurchaseOrder {
  id: string;
  po_number: string;
  status: string;
  total: number;
  amount_paid: number;
  expected_date?: string | null;
  created_at: string;
  suppliers?: { name: string; phone?: string | null } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  draft: { label: "Draft", color: "bg-muted text-foreground", icon: Clock },
  ordered: { label: "Ordered", color: "bg-muted text-foreground", icon: Send },
  partial: { label: "Partial", color: "bg-muted text-foreground", icon: Truck },
  received: { label: "Received", color: "bg-muted text-foreground", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-[#DC2626]/10 text-[#DC2626]", icon: XCircle },
};

export default function PurchasesPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await getPurchaseOrders(businessId, statusFilter);
      setOrders(data);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!businessId) return;
    if (!confirm("Delete this purchase order?")) return;
    try {
      await deletePurchaseOrder(businessId, id);
      load();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleMarkOrdered = async (id: string) => {
    if (!businessId) return;
    try {
      await updatePurchaseOrderStatus(businessId, id, "ordered");
      load();
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };

  const totalOrdered = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const totalPending = orders
    .filter((o) => o.status !== "received" && o.status !== "cancelled")
    .reduce((sum, o) => sum + (Number(o.total) - Number(o.amount_paid)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/inventory")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
            <p className="text-muted-foreground">{orders.length} orders</p>
          </div>
        </div>
        <Button onClick={() => router.push("/purchases/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New PO
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold">₹{totalOrdered.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total Ordered</div>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-[#DC2626]">₹{totalPending.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Amount Pending</div>
        </div>
      </div>

      <Select value={statusFilter} onValueChange={(v: string | null) => setStatusFilter(v ?? "all")}>
        <SelectTrigger>
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Orders</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="ordered">Ordered</SelectItem>
          <SelectItem value="partial">Partial Received</SelectItem>
          <SelectItem value="received">Received</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No purchase orders</h3>
          <p className="text-muted-foreground mb-4">Create your first purchase order</p>
          <Button onClick={() => router.push("/purchases/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Purchase Order
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((po) => {
            const statusCfg = STATUS_CONFIG[po.status] || STATUS_CONFIG.draft;
            const StatusIcon = statusCfg.icon;
            return (
              <Link
                key={po.id}
                href={`/purchases/${po.id}`}
                className="block rounded-xl border bg-card p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{po.po_number}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusCfg.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {po.suppliers?.name || "Unknown Supplier"}
                      {po.expected_date && ` • Expected: ${new Date(po.expected_date).toLocaleDateString()}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(po.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{Number(po.total).toLocaleString()}</div>
                    {Number(po.amount_paid) > 0 && Number(po.amount_paid) < Number(po.total) && (
                      <div className="text-xs text-[#DC2626]">
                        Paid: ₹{Number(po.amount_paid).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {po.status === "draft" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={(e) => { e.preventDefault(); handleMarkOrdered(po.id); }}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#DC2626]"
                      onClick={(e) => { e.preventDefault(); handleDelete(po.id); }}
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
