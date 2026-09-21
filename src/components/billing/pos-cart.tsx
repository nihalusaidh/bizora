"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createInvoice } from "@/server/actions/invoices";
import { calculateInvoiceTotals, type CartItem } from "@/lib/billing";
import { ShoppingCart, Plus, X, Zap, Loader2, CheckCircle, Receipt } from "lucide-react";

const PAY_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank" },
  { value: "credit", label: "Credit" },
] as const;

interface Customer { id: string; name: string; phone?: string | null }

export function PosCart({ businessId }: { businessId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [payMethod, setPayMethod] = useState<string>("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [globalDisc, setGlobalDisc] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ number: string; id: string; total: number } | null>(null);
  const [repeating, setRepeating] = useState(false);

  const addById = useCallback(async (productId: string) => {
    if (!businessId) return;
    const supabase = createClient();
    const { data: p } = await supabase
      .from("products")
      .select("id, name, sku, selling_price, cost_price, gst_rate, stock_quantity")
      .eq("id", productId)
      .eq("business_id", businessId)
      .single();
    if (!p) return;
    setCart((prev) => {
      const found = prev.find((i) => i.productId === p.id);
      if (found) {
        return prev.map((i) =>
          i.productId === p.id
            ? { ...i, quantity: Math.min(i.quantity + 1, Math.max(1, p.stock_quantity)) }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: p.id,
          variantId: null,
          name: p.name,
          sku: p.sku,
          quantity: 1,
          unit: "pc",
          unitPrice: Number(p.selling_price),
          costPrice: p.cost_price != null ? Number(p.cost_price) : null,
          discountPercent: 0,
          taxRate: Number(p.gst_rate) || 0,
          stockQuantity: p.stock_quantity,
        },
      ];
    });
  }, [businessId]);

  // ?add=<id> from picker / scanner / repeat-last-bill
  useEffect(() => {
    const add = searchParams.get("add");
    if (add) {
      addById(add);
      router.replace("/billing");
    }
  }, [searchParams, addById, router]);

  useEffect(() => {
    if (!businessId || !open) return;
    createClient()
      .from("customers")
      .select("id, name, phone")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .order("name")
      .limit(100)
      .then(({ data }) => setCustomers((data as Customer[]) || []));
  }, [businessId, open]);

  const totals = calculateInvoiceTotals(cart, parseFloat(globalDisc) || 0, 0);
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  const setQty = (id: string | null, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.productId === id
            ? { ...i, quantity: Math.max(0, Math.min(i.quantity + delta, Math.max(1, i.stockQuantity))) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const repeatLastBill = async () => {
    if (!businessId || repeating) return;
    setRepeating(true);
    try {
      const supabase = createClient();
      const { data: last } = await supabase
        .from("invoices")
        .select("id")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (!last) return;
      const { data: items } = await supabase
        .from("invoice_items")
        .select("product_id")
        .eq("invoice_id", last.id);
      const ids = [...new Set((items || []).map((i) => i.product_id).filter(Boolean))];
      for (const id of ids) await addById(id as string);
      if (ids.length) setOpen(true);
    } finally {
      setRepeating(false);
    }
  };

  const checkout = async () => {
    if (!businessId || cart.length === 0 || checkingOut) return;
    setCheckingOut(true);
    setError("");
    try {
      const paid = amountPaid === "" ? totals.grandTotal : parseFloat(amountPaid) || 0;
      const invoice = await createInvoice(businessId, {
        customer_id: customerId || null,
        items: cart.map((i) => ({
          product_id: i.productId,
          variant_id: null,
          name: i.name,
          sku: i.sku,
          quantity: i.quantity,
          unit: i.unit,
          unit_price: i.unitPrice,
          cost_price: i.costPrice,
          discount_percent: i.discountPercent,
          discount_amount: 0,
          tax_rate: i.taxRate,
          tax_amount: 0,
          total: 0,
        })),
        discount_amount: 0,
        discount_percent: parseFloat(globalDisc) || 0,
        delivery_method: "ask",
        payment_method: payMethod as "cash" | "upi" | "card" | "bank_transfer" | "credit" | "other",
        amount_paid: paid,
        notes: null,
        terms: null,
      });
      const inv = invoice as { id: string; invoice_number: string; total: number };
      setDone({ number: inv.invoice_number, id: inv.id, total: Number(inv.total) });
      setCart([]);
      setAmountPaid("");
      setGlobalDisc("");
      setCustomerId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <>
      {/* Repeat last bill — 10-second invoicing */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={repeatLastBill} disabled={repeating} className="gap-2 border-red-200 text-[#DC2626]">
          {repeating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          Repeat last bill
        </Button>
      </div>

      {/* Sticky cart bar */}
      {cart.length > 0 && !open && (
        <div className="lg:hidden fixed bottom-[76px] inset-x-3 z-40">
          <button
            onClick={() => setOpen(true)}
            className="flex w-full items-center justify-between rounded-xl bg-[#DC2626] text-white px-4 py-3 shadow-lg font-bold tap-effect"
          >
            <span className="flex items-center gap-2 text-sm">
              <ShoppingCart className="h-4 w-4" />
              {count} item{count > 1 ? "s" : ""}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#DC2626]">
              ₹{totals.grandTotal.toLocaleString("en-IN")} • Checkout
            </span>
          </button>
        </div>
      )}

      {/* Checkout sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-fade-in" onClick={() => setOpen(false)}>
          <div
            className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-4 max-h-[88vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold">Checkout • {count} items</h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-2"><X className="h-5 w-5" /></button>
            </div>

            {error && <p className="text-xs font-bold text-[#DC2626] bg-[#FEF2F2] border border-red-200 rounded-lg p-2">{error}</p>}

            <div className="space-y-2">
              {cart.map((i) => (
                <div key={i.productId} className="flex items-center gap-2 rounded-xl border border-red-100 p-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{i.name}</p>
                    <p className="text-xs text-muted-foreground">₹{i.unitPrice.toLocaleString("en-IN")} {i.taxRate > 0 && `+ ${i.taxRate}% GST`}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setQty(i.productId, -1)} className="h-8 w-8 rounded-full border border-red-200 text-[#DC2626] font-bold" aria-label="Decrease">−</button>
                    <span className="w-6 text-center text-sm font-bold">{i.quantity}</span>
                    <button onClick={() => setQty(i.productId, 1)} className="h-8 w-8 rounded-full bg-[#DC2626] text-white font-bold" aria-label="Increase">+</button>
                  </div>
                  <span className="text-sm font-extrabold shrink-0 min-w-16 text-right">₹{(i.unitPrice * i.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Customer</Label>
                <Select value={customerId} onValueChange={(v) => setCustomerId(v ?? "")}>
                  <SelectTrigger><SelectValue placeholder="Walk-in" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Discount %</Label>
                <Input type="number" min="0" max="100" placeholder="0" value={globalDisc} onChange={(e) => setGlobalDisc(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Payment</Label>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {PAY_METHODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => {
                      setPayMethod(m.value);
                      if (m.value === "credit") setAmountPaid("0");
                      else setAmountPaid("");
                    }}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold border ${payMethod === m.value ? "bg-[#DC2626] text-white border-[#DC2626]" : "bg-white border-red-100 text-muted-foreground"}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Amount received (₹)</Label>
              <Input type="number" min="0" placeholder={`${totals.grandTotal}`} value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
            </div>

            <div className="rounded-xl bg-[#FEF2F2] border border-red-100 p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-bold">₹{totals.subtotal.toLocaleString("en-IN")}</span></div>
              {totals.totalDiscount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="font-bold">−₹{totals.totalDiscount.toLocaleString("en-IN")}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">GST</span><span className="font-bold">₹{totals.totalTax.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between text-base"><span className="font-extrabold">Total</span><span className="font-extrabold text-[#DC2626]">₹{totals.grandTotal.toLocaleString("en-IN")}</span></div>
            </div>

            <Button variant="red" size="lg" className="w-full" onClick={checkout} disabled={checkingOut || cart.length === 0}>
              {checkingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Receipt className="mr-2 h-4 w-4" />}
              {checkingOut ? "Billing..." : `Charge ₹${totals.grandTotal.toLocaleString("en-IN")}`}
            </Button>
          </div>
        </div>
      )}

      {/* Success */}
      {done && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setDone(null)}>
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 text-center animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <CheckCircle className="h-12 w-12 mx-auto text-[#DC2626] mb-2" />
            <h2 className="text-lg font-extrabold">Bill complete!</h2>
            <p className="text-3xl font-extrabold text-[#DC2626] my-1">₹{done.total.toLocaleString("en-IN")}</p>
            <p className="text-xs text-muted-foreground mb-4">Invoice #{done.number}</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href={`/billing/invoices/${done.id}`} className="block">
                <Button variant="outline" className="w-full">Print / Share</Button>
              </Link>
              <Button variant="red" className="w-full" onClick={() => { setDone(null); setOpen(false); }}>
                <Plus className="mr-1 h-4 w-4" /> New bill
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop inline trigger */}
      {cart.length > 0 && (
        <div className="hidden lg:block">
          <Button variant="red" onClick={() => setOpen(true)} className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Cart • {count} • ₹{totals.grandTotal.toLocaleString("en-IN")}
          </Button>
        </div>
      )}
    </>
  );
}
