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
      query = query.or(`name.ilike.%${debouncedSearch}%,sku.ilike.%${debouncedSearch}%,barcode.ilike.%${debouncedSearch}%`);
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
    <div className="space-y-4 animate-fade-in">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map((product, i) => (
            <button
              key={product.id}
              onClick={() => router.push(`/billing?add=${product.id}`)}
              className="group rounded-xl border bg-card p-3 text-left tap-effect premium-fade-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-20 w-full object-cover rounded-lg mb-2 transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <div className="h-20 w-full bg-muted rounded-lg mb-2 flex items-center justify-center transition-all duration-200 group-hover:bg-muted/80">
                  <Package className="h-8 w-8 text-muted-foreground/50 transition-transform duration-200 group-hover:scale-110" />
                </div>
              )}
              <h3 className="text-sm font-semibold truncate">{product.name}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-bold">₹{product.selling_price.toLocaleString("en-IN")}</span>
                <Badge
                  variant={product.stock_quantity <= 5 ? "destructive" : "secondary"}
                  className="text-[10px]"
                >
                  {product.stock_quantity} in stock
                </Badge>
              </div>
              {product.category && (
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  {(product.category as { name: string }).name}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
