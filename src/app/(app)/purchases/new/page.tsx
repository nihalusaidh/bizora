"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { createPurchaseOrder } from "@/server/actions/purchase-orders";
import { getProducts } from "@/server/actions/products";
import { getSuppliers } from "@/server/actions/suppliers";
import { useBusiness } from "@/lib/store";
import { ArrowLeft, Plus, Minus, Trash2, Package, Loader2 } from "lucide-react";

interface CartItem {
  productId: string | null;
  name: string;
  sku: string | null;
  quantity: number;
  unit: string;
  unitCost: number;
  taxRate: number;
}

export default function NewPurchaseOrderPage() {
  const { businessId } = useBusiness();
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string; sku: string | null; cost_price: number }>>([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!businessId) return;
      try {
        const [supData, prodResult] = await Promise.all([
          getSuppliers(businessId),
          getProducts(businessId) as Promise<{ data: Array<{ id: string; name: string; sku: string | null; cost_price: number }>; count: number | null }>,
        ]);
        setSuppliers(supData);
        setProducts(prodResult.data);
      } catch (err) {
        console.error("Failed to load:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [businessId]);

  const filteredProducts = search
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
      ).slice(0, 8)
    : [];

  const addToCart = (product: typeof products[0]) => {
    const existing = cart.findIndex((item) => item.productId === product.id);
    if (existing >= 0) {
      const updated = [...cart];
      updated[existing].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        quantity: 1,
        unit: "pc",
        unitCost: product.cost_price || 0,
        taxRate: 0,
      }]);
    }
    setSearch("");
  };

  const addCustomItem = () => {
    setCart([...cart, {
      productId: null,
      name: "",
      sku: null,
      quantity: 1,
      unit: "pc",
      unitCost: 0,
      taxRate: 0,
    }]);
  };

  const updateItem = (index: number, updates: Partial<CartItem>) => {
    setCart(cart.map((item, i) => i === index ? { ...item, ...updates } : item));
  };

  const removeItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.unitCost * item.quantity, 0);
  const totalTax = cart.reduce((sum, item) => sum + (item.unitCost * item.quantity * item.taxRate) / 100, 0);
  const total = subtotal + totalTax;

  const handleSubmit = async () => {
    if (!businessId || !selectedSupplier || cart.length === 0) return;
    setSubmitting(true);
    setError("");

    try {
      await createPurchaseOrder(businessId, {
        supplier_id: selectedSupplier,
        items: cart.map((item) => ({
          product_id: item.productId,
          name: item.name,
          sku: item.sku,
          ordered_quantity: item.quantity,
          unit: item.unit,
          unit_cost: item.unitCost,
          tax_rate: item.taxRate,
          tax_amount: (item.unitCost * item.quantity * item.taxRate) / 100,
          total: item.unitCost * item.quantity + (item.unitCost * item.quantity * item.taxRate) / 100,
        })),
        discount_amount: 0,
        amount_paid: 0,
        expected_date: expectedDate || null,
        notes: notes || null,
      });
      router.push("/purchases");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create purchase order");
    } finally {
      setSubmitting(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/purchases")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Purchase Order</h1>
          <p className="text-muted-foreground">Order stock from suppliers</p>
        </div>
      </div>

      {/* Supplier Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <Label>Supplier</Label>
            <Select value={selectedSupplier} onValueChange={(v: string | null) => setSelectedSupplier(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="space-y-2">
              <Label>Expected Date</Label>
              <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input placeholder="PO notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Search */}
      <div className="relative">
        <Input
          placeholder="Search products to add..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && filteredProducts.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-10 mt-1">
            <CardContent className="p-2">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  className="flex w-full items-center justify-between rounded-lg p-2 hover:bg-muted text-sm"
                  onClick={() => addToCart(p)}
                >
                  <span>{p.name}</span>
                  <span className="text-muted-foreground">₹{p.cost_price}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cart Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Items ({cart.length})</h3>
          <Button variant="outline" size="sm" onClick={addCustomItem}>
            <Plus className="h-4 w-4 mr-1" />
            Custom Item
          </Button>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground">
            Search products or add custom items
          </div>
        ) : (
          cart.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-3">
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(index, { name: e.target.value })}
                      placeholder="Item name"
                      className="h-8"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Qty</Label>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateItem(index, { quantity: Math.max(1, item.quantity - 1) })}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, { quantity: parseInt(e.target.value) || 1 })}
                        className="h-8 text-center"
                        min="1"
                      />
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateItem(index, { quantity: item.quantity + 1 })}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Unit Cost</Label>
                    <Input
                      type="number"
                      value={item.unitCost}
                      onChange={(e) => updateItem(index, { unitCost: parseFloat(e.target.value) || 0 })}
                      className="h-8"
                      min="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">GST %</Label>
                    <Input
                      type="number"
                      value={item.taxRate}
                      onChange={(e) => updateItem(index, { taxRate: parseFloat(e.target.value) || 0 })}
                      className="h-8"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="col-span-1 text-right font-medium">
                    ₹{(item.unitCost * item.quantity).toFixed(0)}
                  </div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary & Submit */}
      {cart.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {totalTax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST</span>
                  <span>₹{totalTax.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <Button className="w-full" onClick={handleSubmit} disabled={submitting || !selectedSupplier}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Purchase Order
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
