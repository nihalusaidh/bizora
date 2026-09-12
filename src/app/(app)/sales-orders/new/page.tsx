"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSalesOrder } from "@/server/actions/sales-orders";
import { useBusiness } from "@/lib/store";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";

interface Product { id: string; name: string; selling_price: number; gst_rate?: number | null; }
interface Customer { id: string; name: string; }

interface OrderItem { product_id?: string | null; name: string; quantity: number; unit_price: number; discount_percent: number; tax_rate: number; }

export default function NewSalesOrderPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<OrderItem[]>([{ name: "", quantity: 1, unit_price: 0, discount_percent: 0, tax_rate: 0 }]);
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    const s = createClient();
    Promise.all([
      s.from("customers").select("id, name").eq("business_id", businessId).eq("is_active", true).order("name"),
      s.from("products").select("id, name, selling_price, gst_rate").eq("business_id", businessId).eq("is_active", true).order("name"),
    ]).then(([c, p]) => { setCustomers(c.data || []); setProducts(p.data || []); });
  }, [businessId]);

  const updateItem = (i: number, field: keyof OrderItem, value: string | number) => {
    const next = items.map((item, idx) => idx === i ? { ...item, [field]: value } : item);
    setItems(next);
  };
  const selectProduct = (i: number, pid: string) => {
    const p = products.find((x) => x.id === pid);
    if (p) { updateItem(i, "product_id", p.id); updateItem(i, "name", p.name); updateItem(i, "unit_price", p.selling_price); updateItem(i, "tax_rate", p.gst_rate || 0); }
  };
  const addItem = () => setItems([...items, { name: "", quantity: 1, unit_price: 0, discount_percent: 0, tax_rate: 0 }]);
  const removeItem = (i: number) => { if (items.length > 1) setItems(items.filter((_, idx) => idx !== i)); };

  const total = items.reduce((s, item) => {
    const net = item.unit_price * item.quantity * (1 - item.discount_percent / 100);
    return s + net * (1 + item.tax_rate / 100);
  }, 0);

  const handleSubmit = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      await createSalesOrder(businessId, { customer_id: customerId || null, items, expected_date: expectedDate || null, notes: notes || null });
      router.push("/sales-orders");
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h1 className="text-2xl font-bold tracking-tight">New Sales Order</h1><p className="text-muted-foreground">Create a pre-sale commitment</p></div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Customer</CardTitle></CardHeader>
        <CardContent>
          <Select value={customerId} onValueChange={(v) => setCustomerId(v ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select customer (optional)" /></SelectTrigger>
            <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Items</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <Select value={item.product_id || ""} onValueChange={(v) => v && selectProduct(i, v)}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Product" /></SelectTrigger>
                <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} — ₹{p.selling_price}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" min="1" className="w-16" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)} />
              <Input type="number" className="w-24" placeholder="Price" value={item.unit_price || ""} onChange={(e) => updateItem(i, "unit_price", parseFloat(e.target.value) || 0)} />
              {items.length > 1 && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addItem}><Plus className="mr-2 h-4 w-4" />Add</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Expected Date</Label><Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} /></div>
            <div className="space-y-2"><Label>Notes</Label><Input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span><span>₹{total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Order
      </Button>
    </div>
  );
}
