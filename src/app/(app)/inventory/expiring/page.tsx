"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBusiness } from "@/lib/store";
import { ArrowLeft, Search, AlertTriangle, Package, Calendar } from "lucide-react";

interface ExpiringProduct {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  batch_number?: string | null;
  expiry_date: string;
  manufacturing_date?: string | null;
  mrp?: number | null;
  stock_quantity: number;
  selling_price: number;
  category?: { name: string } | null;
  daysLeft: number;
}

type Filter = "all" | "expired" | "critical" | "warning";

export default function ExpiringProductsPage() {
  const { businessId } = useBusiness();
  const [products, setProducts] = useState<ExpiringProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const loadProducts = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("id, name, sku, barcode, batch_number, expiry_date, manufacturing_date, mrp, stock_quantity, selling_price, is_active, category:categories(name)")
        .eq("business_id", businessId)
        .eq("is_active", true)
        .not("expiry_date", "is", null)
        .order("expiry_date", { ascending: true });

      if (!data) { setProducts([]); return; }

      const now = new Date();
      const mapped: ExpiringProduct[] = data
        .map((p) => {
          const exp = new Date(p.expiry_date!);
          const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
          return { ...p, daysLeft, category: Array.isArray(p.category) ? p.category[0] : p.category } as unknown as ExpiringProduct;
        })
        .filter((p) => {
          if (filter === "expired") return p.daysLeft < 0;
          if (filter === "critical") return p.daysLeft >= 0 && p.daysLeft <= 7;
          if (filter === "warning") return p.daysLeft > 7 && p.daysLeft <= 30;
          return true;
        })
        .filter((p) => {
          if (!search) return true;
          const s = search.toLowerCase();
          return p.name.toLowerCase().includes(s) ||
            (p.sku && p.sku.toLowerCase().includes(s)) ||
            (p.batch_number && p.batch_number.toLowerCase().includes(s));
        });

      setProducts(mapped);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId, search, filter]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const expired = products.filter((p) => p.daysLeft < 0).length;
  const critical = products.filter((p) => p.daysLeft >= 0 && p.daysLeft <= 7).length;
  const warning = products.filter((p) => p.daysLeft > 7 && p.daysLeft <= 30).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/inventory" className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Expiry Alerts</h1>
            <p className="text-muted-foreground">Track products nearing expiry</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-[#DC2626]/30 bg-[#DC2626]/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[#DC2626]">{expired}</div>
            <div className="text-xs text-muted-foreground">Expired</div>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">{critical}</div>
            <div className="text-xs text-muted-foreground">Critical (≤7d)</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{warning}</div>
            <div className="text-xs text-muted-foreground">Warning (≤30d)</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="critical">Critical (≤7d)</SelectItem>
            <SelectItem value="warning">Warning (≤30d)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {filter !== "all" ? "No matching products" : "No expiring products"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {filter !== "all" ? "Try a different filter" : "Products with expiry dates will appear here"}
          </p>
          <Link href="/inventory">
            <Button variant="outline">Go to Inventory</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <Link key={product.id} href={`/inventory/${product.id}`}>
              <div className="rounded-xl border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{
                    backgroundColor: product.daysLeft < 0 ? "#DC262610" : product.daysLeft <= 7 ? "#f9731610" : "#eab30810"
                  }}>
                    {product.daysLeft < 0 ? (
                      <AlertTriangle className="h-5 w-5 text-[#DC2626]" />
                    ) : (
                      <Calendar className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.batch_number && <span>Batch: {product.batch_number} • </span>}
                      {product.category?.name || "Uncategorized"}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      product.daysLeft < 0 ? "destructive" :
                      product.daysLeft <= 7 ? "destructive" :
                      product.daysLeft <= 30 ? "secondary" : "outline"
                    }>
                      {product.daysLeft < 0 ? `Expired ${Math.abs(product.daysLeft)}d ago` :
                       `${product.daysLeft}d left`}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      Stock: {product.stock_quantity}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
