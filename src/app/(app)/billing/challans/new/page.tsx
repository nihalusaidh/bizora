"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDeliveryChallan } from "@/server/actions/delivery-challans";
import { useBusiness } from "@/lib/store";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";

interface Product { id: string; name: string; }
interface Customer { id: string; name: string; phone?: string | null; }
interface Invoice { id: string; invoice_number: string; total: number; }

interface ChallanItem {
  product_id?: string | null;
  name: string;
  quantity: number;
  unit: string;
  batch_number?: string | null;
}

export default function NewChallanPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ChallanItem[]>([{ name: "", quantity: 1, unit: "pcs" }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    const supabase = createClient();
    Promise.all([
      supabase.from("customers").select("id, name, phone").eq("business_id", businessId).eq("is_active", true).order("name"),
      supabase.from("products").select("id, name").eq("business_id", businessId).eq("is_active", true).order("name"),
      supabase.from("invoices").select("id, invoice_number, total").eq("business_id", businessId).in("status", ["draft", "sent", "partial"]).order("created_at", { ascending: false }),
    ]).then(([c, p, inv]) => {
      setCustomers(c.data || []);
      setProducts(p.data || []);
      setInvoices(inv.data || []);
    });
  }, [businessId]);

  const updateItem = (index: number, field: keyof ChallanItem, value: string | number | null) => {
    const next = items.map((item, i) => i === index ? { ...item, [field]: value } : item);
    setItems(next);
  };

  const selectProduct = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      updateItem(index, "product_id", product.id);
      updateItem(index, "name", product.name);
    }
  };

  const addItem = () => setItems([...items, { name: "", quantity: 1, unit: "pcs" }]);
  const removeItem = (index: number) => { if (items.length > 1) setItems(items.filter((_, i) => i !== index)); };

  const handleSubmit = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      await createDeliveryChallan(businessId, {
        invoice_id: invoiceId || null,
        customer_id: customerId || null,
        items,
        dispatch_date: dispatchDate,
        vehicle_number: vehicleNumber || null,
        driver_name: driverName || null,
        driver_phone: driverPhone || null,
        notes: notes || null,
      });
      router.push("/billing/challans");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Delivery Challan</h1>
          <p className="text-muted-foreground">Dispatch goods to customer</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select value={customerId} onValueChange={(v) => setCustomerId(v ?? "")}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Linked Invoice (optional)</Label>
              <Select value={invoiceId} onValueChange={(v) => setInvoiceId(v ?? "")}>
                <SelectTrigger><SelectValue placeholder="Select invoice" /></SelectTrigger>
                <SelectContent>
                  {invoices.map((inv) => <SelectItem key={inv.id} value={inv.id}>{inv.invoice_number} — ₹{inv.total}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Vehicle Number</Label>
              <Input placeholder="MH 12 AB 1234" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Driver Name</Label>
              <Input placeholder="Driver name" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Driver Phone</Label>
              <Input placeholder="Phone" value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Dispatch Date</Label>
            <Input type="date" value={dispatchDate} onChange={(e) => setDispatchDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Items</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <Select value={item.product_id || ""} onValueChange={(v) => v && selectProduct(i, v)}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="number" min="1" className="w-20" placeholder="Qty" value={item.quantity}
                onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)} />
              <Input className="w-24" placeholder="Batch#" value={item.batch_number || ""}
                onChange={(e) => updateItem(i, "batch_number", e.target.value || null)} />
              {items.length > 1 && (
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeItem(i)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input placeholder="Dispatch notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Challan
      </Button>
    </div>
  );
}
