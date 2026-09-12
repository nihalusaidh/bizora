"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  getPurchaseOrder,
  receivePurchaseOrderItems,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
} from "@/server/actions/purchase-orders";
import { useBusiness } from "@/lib/store";
import {
  ArrowLeft, CheckCircle, Trash2, Truck, Package, Clock, Send, Megaphone
} from "lucide-react";

interface POItem {
  id: string;
  name: string;
  sku?: string | null;
  ordered_quantity: number;
  received_quantity: number;
  unit: string;
  unit_cost: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  product_id?: string | null;
}

interface POData {
  id: string;
  po_number: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  amount_paid: number;
  expected_date?: string | null;
  received_date?: string | null;
  notes?: string | null;
  created_at: string;
  suppliers?: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    gst_number?: string | null;
  } | null;
  purchase_order_items: POItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-muted text-foreground" },
  ordered: { label: "Ordered", color: "bg-muted text-foreground" },
  partial: { label: "Partial", color: "bg-muted text-foreground" },
  received: { label: "Received", color: "bg-muted text-foreground" },
  cancelled: { label: "Cancelled", color: "bg-[#DC2626]/10 text-[#DC2626]" },
};

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { businessId } = useBusiness();
  const poId = params.id as string;

  const [po, setPo] = useState<POData | null>(null);
  const [loading, setLoading] = useState(true);
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!businessId || !poId) return;
    setLoading(true);
    try {
      const data = await getPurchaseOrder(businessId, poId);
      setPo(data);
      // Initialize receive quantities
      const qtys: Record<string, number> = {};
      data.purchase_order_items.forEach((item: POItem) => {
        qtys[item.id] = Number(item.received_quantity) || 0;
      });
      setReceiveQuantities(qtys);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId, poId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReceive = async () => {
    if (!businessId || !po) return;
    setSaving(true);
    try {
      const items = po.purchase_order_items.map((item) => ({
        id: item.id,
        received_quantity: receiveQuantities[item.id] || 0,
      }));
      await receivePurchaseOrderItems(businessId, po.id, items);
      load();
    } catch (err) {
      console.error("Failed to receive:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkOrdered = async () => {
    if (!businessId || !po) return;
    try {
      await updatePurchaseOrderStatus(businessId, po.id, "ordered");
      load();
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };

  const handleDelete = async () => {
    if (!businessId || !po) return;
    if (!confirm("Delete this purchase order?")) return;
    try {
      await deletePurchaseOrder(businessId, po.id);
      router.push("/purchases");
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!po) {
    return (
      <div className="space-y-6">
        <Link href="/purchases" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Link>
        <div className="rounded-xl border bg-card p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Purchase order not found</h3>
          <Link href="/purchases"><Button>Go to Purchase Orders</Button></Link>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[po.status] || STATUS_CONFIG.draft;
  const canReceive = po.status === "ordered" || po.status === "partial";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/purchases" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{po.po_number}</h1>
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Created {new Date(po.created_at).toLocaleDateString()}
              {po.expected_date && ` • Expected: ${new Date(po.expected_date).toLocaleDateString()}`}
              {po.received_date && ` • Received: ${new Date(po.received_date).toLocaleDateString()}`}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {po.status === "draft" && (
            <Button onClick={handleMarkOrdered}>
              <Send className="mr-2 h-4 w-4" /> Mark Ordered
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Supplier Info */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-semibold text-muted-foreground mb-1">SUPPLIER</div>
          <div className="font-medium">{po.suppliers?.name || "Unknown"}</div>
          {po.suppliers?.phone && <div className="text-sm text-muted-foreground">{po.suppliers.phone}</div>}
          {po.suppliers?.email && <div className="text-sm text-muted-foreground">{po.suppliers.email}</div>}
          {po.suppliers?.address && <div className="text-sm text-muted-foreground">{po.suppliers.address}</div>}
          {po.suppliers?.gst_number && <div className="text-sm font-medium">GSTIN: {po.suppliers.gst_number}</div>}
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold">#</th>
                  <th className="text-left py-2 font-semibold">Item</th>
                  <th className="text-right py-2 font-semibold">Ordered</th>
                  <th className="text-right py-2 font-semibold">Received</th>
                  <th className="text-right py-2 font-semibold">Cost</th>
                  <th className="text-right py-2 font-semibold">Total</th>
                  {canReceive && <th className="text-right py-2 font-semibold">Receive</th>}
                </tr>
              </thead>
              <tbody>
                {po.purchase_order_items.map((item, index) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2 text-muted-foreground">{index + 1}</td>
                    <td className="py-2">
                      <div className="font-medium">{item.name}</div>
                      {item.sku && <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>}
                    </td>
                    <td className="py-2 text-right">{item.ordered_quantity} {item.unit}</td>
                    <td className="py-2 text-right">
                      {Number(item.received_quantity) >= Number(item.ordered_quantity) ? (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-0.5" /> Done
                        </Badge>
                      ) : (
                        <span>{item.received_quantity || 0} {item.unit}</span>
                      )}
                    </td>
                    <td className="py-2 text-right">₹{Number(item.unit_cost).toFixed(2)}</td>
                    <td className="py-2 text-right font-medium">₹{Number(item.total).toFixed(2)}</td>
                    {canReceive && (
                      <td className="py-2 text-right">
                        <Input
                          type="number"
                          min="0"
                          max={item.ordered_quantity}
                          value={receiveQuantities[item.id] || 0}
                          onChange={(e) => setReceiveQuantities({
                            ...receiveQuantities,
                            [item.id]: parseInt(e.target.value) || 0,
                          })}
                          className="h-8 w-20 text-right"
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardContent className="p-4">
          <div className="w-72 ml-auto space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{Number(po.subtotal).toFixed(2)}</span>
            </div>
            {Number(po.tax_amount) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST</span>
                <span>₹{Number(po.tax_amount).toFixed(2)}</span>
              </div>
            )}
            {Number(po.discount_amount) > 0 && (
              <div className="flex justify-between text-foreground">
                <span>Discount</span>
                <span>-₹{Number(po.discount_amount).toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>₹{Number(po.total).toFixed(2)}</span>
            </div>
            {Number(po.amount_paid) > 0 && (
              <div className="flex justify-between text-foreground">
                <span>Paid</span>
                <span>-₹{Number(po.amount_paid).toFixed(2)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {po.notes && (
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-semibold mb-1">Notes</div>
            <div className="text-sm text-muted-foreground">{po.notes}</div>
          </CardContent>
        </Card>
      )}

      {/* Receive Button */}
      {canReceive && (
        <Button className="w-full" onClick={handleReceive} disabled={saving}>
          {saving ? null : <Truck className="mr-2 h-4 w-4" />}
          {saving ? "Saving..." : "Save Received Quantities"}
        </Button>
      )}

      {/* Notify Customers after receiving */}
      {(po.status === "received" || po.status === "partial") && (
        <Link href={`/customers/notify?type=restock&product=${encodeURIComponent(po.purchase_order_items?.map((i: POItem) => i.name).join(", ") || "")}`}>
          <Button variant="outline" className="w-full bg-green-500/5 border-green-500/20 text-green-700 hover:bg-green-500/10">
            <Megaphone className="mr-2 h-4 w-4" />
            Notify Customers — Stock Arrived
          </Button>
        </Link>
      )}
    </div>
  );
}
