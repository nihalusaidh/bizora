"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/shared";
import { useBusiness } from "@/lib/store";
import { useDebounce } from "@/lib/hooks";
import { Search, Plus, Package, ScanBarcode } from "lucide-react";
import { BarcodeScanner } from "@/components/billing/barcode-scanner";
import { PosCart } from "@/components/billing/pos-cart";
import { Suspense } from "react";

function sanitizeSearch(input: string): string {
  return input.replace(/[%_(),.\\]/g, "\\$&");
}

interface Product {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  selling_price: number;
  stock_quantity: number;
  image_url?: string | null;
  category?: { name: string } | null;
}

export default function BillingPage() {
  const router = useRouter();
  const { businessId } = useBusiness();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);

  const loadProducts = useCallback(async () => {
    if (!businessId) return;
    const supabase = createClient();
    let query = supabase
      .from("products")
      .select("id, name, sku, barcode, selling_price, stock_quantity, image_url, category:categories(name)")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .gt("stock_quantity", 0)
      .order("name");

    if (debouncedSearch) {
      const safe = sanitizeSearch(debouncedSearch);
      query = query.or(`name.ilike.%${safe}%,sku.ilike.%${safe}%,barcode.ilike.%${safe}%`);
    }

    const { data } = await query.limit(50);
    setProducts((data as unknown as Product[]) || []);
    setLoading(false);
  }, [businessId, debouncedSearch]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleBarcodeProduct = (product: Product) => {
    setScannedProduct(product);
    router.push(`/billing?add=${product.id}`);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-28 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground text-sm">Quick POS — scan or tap a product to add to cart</p>
        </div>
        <Button onClick={() => router.push("/billing/invoices")} variant="outline" size="sm" className="gap-2">
          <ScanBarcode className="h-4 w-4" />
          Invoices
        </Button>
      </div>

      {/* Barcode Scanner */}
      <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
        <CardContent className="p-3">
          <BarcodeScanner
            onProductFound={handleBarcodeProduct}
            onBarcodeNotFound={(barcode) => {
              setSearch(barcode);
            }}
          />
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products, SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11"
        />
      </div>

      {/* Fast POS cart: ?add= checkout, repeat last bill, sticky cart bar */}
      {businessId && (
        <Suspense>
          <PosCart businessId={businessId} />
        </Suspense>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-3 shimmer-loading">
              <div className="h-20 w-full rounded-lg mb-2 bg-muted" />
              <div className="h-4 w-24 rounded bg-muted mb-1" />
              <div className="h-3 w-16 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="No products found"
          description={search ? "Try a different search term" : "Add your first product to start billing"}
          action={
            <Button onClick={() => router.push("/inventory/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#DC2626]">Top deals today</h2>
            <span className="text-[11px] font-bold text-[#DC2626]">{products.length} items →</span>
          </div>
          {products.map((product, i) => (
            <button
              key={product.id}
              onClick={() => router.push(`/billing?add=${product.id}`)}
              className="group flex w-full items-center gap-3 rounded-xl border border-red-100 bg-white p-3 text-left tap-effect premium-fade-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="h-16 w-16 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-[#FEF2F2] border border-red-100 flex items-center justify-center shrink-0">
                  <Package className="h-7 w-7 text-[#DC2626]/60" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold truncate">{product.name}</h3>
                {product.category && (
                  <span className="text-[11px] font-bold text-[#DC2626]">
                    {(product.category as { name: string }).name}
                  </span>
                )}
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-[#DC2626]">₹{product.selling_price.toLocaleString("en-IN")}</span>
                  <Badge
                    variant={product.stock_quantity <= 5 ? "destructive" : "secondary"}
                    className="text-[10px]"
                  >
                    {product.stock_quantity} left
                  </Badge>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-[#DC2626] px-3 py-1.5 text-xs font-extrabold text-[#DC2626]">
                + ADD
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
