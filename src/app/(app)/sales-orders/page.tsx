"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSalesOrders, deleteSalesOrder, updateSalesOrderStatus } from "@/server/actions/sales-orders";
import { useBusiness } from "@/lib/store";
import Link from "next/link";
import { ArrowLeft, Plus, ShoppingCart, Trash2, Eye, ArrowRight } from "lucide-react";

interface Order { id: string; order_number: string; status: string; total: number; expected_date?: string | null; created_at: string; customers?: { name: string } | null; }

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  confirmed: "bg-blue-500/10 text-blue-600",
  processing: "bg-primary/10 text-primary",
  dispatched: "bg-muted text-foreground",
  delivered: "bg-green-500/10 text-green-600",
  cancelled: "bg-[#DC2626]/10 text-[#DC2626]",
};

const STATUS_ORDER = ["pending", "confirmed", "processing", "dispatched", "delivered"];

export default function SalesOrdersPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    setOrders(await getSalesOrders(businessId, statusFilter));
    setLoading(false);
  }, [businessId, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleAdvanceStatus = async (id: string, currentStatus: string) => {
    const idx = STATUS_ORDER.indexOf(currentStatus);
    if (idx < 0 || idx >= STATUS_ORDER.length - 1) return;
    await updateSalesOrderStatus(businessId!, id, STATUS_ORDER[idx + 1]);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/more")}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sales Orders</h1>
            <p className="text-muted-foreground">{orders.length} orders</p>
          </div>
        </div>
        <Button onClick={() => router.push("/sales-orders/new")}><Plus className="mr-2 h-4 w-4" />New Order</Button>
      </div>

      <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
        <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {STATUS_ORDER.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No sales orders</h3>
          <Button onClick={() => router.push("/sales-orders/new")}><Plus className="mr-2 h-4 w-4" />Create Order</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/sales-orders/${o.id}`}>
              <div className="rounded-xl border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{o.order_number}</span>
                      <Badge className={STATUS_COLORS[o.status] || ""}>{o.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{o.customers?.name || "Walk-in"}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{o.total.toLocaleString()}</div>
                    {o.expected_date && <div className="text-xs text-muted-foreground">Due: {new Date(o.expected_date).toLocaleDateString()}</div>}
                  </div>
                  {o.status !== "delivered" && o.status !== "cancelled" && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.preventDefault(); handleAdvanceStatus(o.id, o.status); }}>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
