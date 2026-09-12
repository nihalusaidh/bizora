"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createEstimate } from "@/server/actions/estimates";
import { useBusiness } from "@/lib/store";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  selling_price: number;
  gst_rate?: number | null;
}

interface Customer {
  id: string;
  name: string;
  phone?: string | null;
}

interface EstimateItem {
  product_id?: string | null;
  name: string;
  sku?: string | null;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
}

export default function NewEstimatePage() {
  const { businessId } = useBusiness();
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<EstimateItem[]>([
    { name: "", quantity: 1, unit_price: 0, discount_percent: 0, tax_rate: 0 },
  ]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;
    const supabase = createClient();
    Promise.all([
      supabase.from("customers").select("id, name, phone").eq("business_id", businessId).eq("is_active", true).order("name"),
      supabase.from("products").select("id, name, selling_price, gst_rate").eq("business_id", businessId).eq("is_active", true).order("name"),
    ]).then(([cust, prod]) => {
      setCustomers(cust.data || []);
      setProducts(prod.data || []);
      setDataLoading(false);
    });
  }, [businessId]);

  const updateItem = (index: number, field: keyof EstimateItem, value: string | number) => {
    const next = items.map((item, i) => i === index ? { ...item, [field]: value } : item);
    setItems(next);
  };

  const selectProduct = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      updateItem(index, "product_id", product.id);
      updateItem(index, "name", product.name);
      updateItem(index, "unit_price", product.selling_price);
      updateItem(index, "tax_rate", product.gst_rate || 0);
    }
  };

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, unit_price: 0, discount_percent: 0, tax_rate: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const totalTax = items.reduce((sum, item) => {
    const net = item.unit_price * item.quantity * (1 - item.discount_percent / 100);
    return sum + net * (item.tax_rate / 100);
  }, 0);
  const globalDiscount = subtotal * (discountPercent / 100);
  const total = subtotal - globalDiscount + totalTax;

  const handleSubmit = async () => {
    if (!businessId || items.length === 0) return;
    setLoading(true);
    try {
      const estimate = await createEstimate(businessId, {
        customer_id: customerId || null,
        items,
        discount_percent: discountPercent,
        notes: notes || null,
        valid_until: validUntil || null,
      });
      router.push(`/billing/estimates`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Estimate</h1>
          <p className="text-muted-foreground">Create a quote for your customer</p>
        </div>
      </div>

      {/* Customer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={customerId} onValueChange={(v) => setCustomerId(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Select customer (optional)" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Select value={item.product_id || ""} onValueChange={(v) => v && selectProduct(i, v)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select product or type name" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} — ₹{p.selling_price}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {items.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeItem(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                <Input type="number" min="1" placeholder="Qty" value={item.quantity}
                  onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 1)} />
                <Input type="number" min="0" step="0.01" placeholder="Price" value={item.unit_price || ""}
                  onChange={(e) => updateItem(i, "unit_price", parseFloat(e.target.value) || 0)} />
                <Input type="number" min="0" max="100" placeholder="Disc%" value={item.discount_percent || ""}
                  onChange={(e) => updateItem(i, "discount_percent", parseFloat(e.target.value) || 0)} />
                <Input type="number" min="0" max="100" placeholder="GST%" value={item.tax_rate || ""}
                  onChange={(e) => updateItem(i, "tax_rate", parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-muted-foreground">Discount %</span>
            <Input type="number" min="0" max="100" className="w-20 text-right h-8" value={discountPercent || ""}
              onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)} />
          </div>
          {globalDiscount > 0 && (
            <div className="flex justify-between text-sm text-[#DC2626]">
              <span>Discount</span>
              <span>-₹{globalDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">GST</span>
            <span>₹{totalTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Notes & Validity */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-2">
            <Label>Valid Until</Label>
            <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input placeholder="Additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={loading || items.length === 0} className="w-full">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Create Estimate
      </Button>
    </div>
  );
}
