"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDeliveryChallans, deleteDeliveryChallan, updateChallanStatus } from "@/server/actions/delivery-challans";
import { useBusiness } from "@/lib/store";
import { ArrowLeft, Plus, Truck, Trash2, CheckCircle, Eye } from "lucide-react";

interface Challan {
  id: string;
  challan_number: string;
  status: string;
  dispatch_date: string;
  vehicle_number?: string | null;
  created_at: string;
  customers?: { name: string; phone?: string | null } | null;
  invoices?: { invoice_number: string } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-muted text-foreground" },
  dispatched: { label: "Dispatched", color: "bg-muted text-foreground" },
  delivered: { label: "Delivered", color: "bg-muted text-foreground" },
  returned: { label: "Returned", color: "bg-[#DC2626]/10 text-[#DC2626]" },
};

export default function ChallansPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await getDeliveryChallans(businessId, statusFilter);
      setChallans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [businessId, statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this challan?")) return;
    await deleteDeliveryChallan(businessId!, id);
    loadData();
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    await updateChallanStatus(businessId!, id, status);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/billing")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Delivery Challans</h1>
            <p className="text-muted-foreground">{challans.length} challans</p>
          </div>
        </div>
        <Button onClick={() => router.push("/billing/challans/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Challan
        </Button>
      </div>

      <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
        <SelectTrigger>
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="dispatched">Dispatched</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
          <SelectItem value="returned">Returned</SelectItem>
        </SelectContent>
      </Select>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : challans.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No delivery challans</h3>
          <p className="text-muted-foreground mb-4">Create a challan for goods dispatch</p>
          <Button onClick={() => router.push("/billing/challans/new")}>
            <Plus className="mr-2 h-4 w-4" /> Create Challan
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {challans.map((c) => {
            const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
            return (
              <Link key={c.id} href={`/billing/challans/${c.id}`}>
                <div className="rounded-xl border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{c.challan_number}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {c.customers?.name || "Walk-in"} {c.invoices?.invoice_number ? `• Inv: ${c.invoices.invoice_number}` : ""}
                      </div>
                      {c.vehicle_number && (
                        <div className="text-xs text-muted-foreground">Vehicle: {c.vehicle_number}</div>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {new Date(c.dispatch_date).toLocaleDateString()}
                    </div>
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
