"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BarcodeDisplay } from "@/components/inventory/barcode-display";
import { ExportButton } from "@/components/export/export-button";
import { formatProductsForCsv } from "@/lib/export";
import {
  Plus,
  Search,
  Package,
  Tag,
  Factory,
  ArrowRight,
  Grid3X3,
  List,
  ShoppingCart,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  selling_price: number;
  cost_price: number;
  image_url?: string | null;
  category?: { name: string } | null;
  min_stock?: number | null;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberships } = await supabase
        .from("memberships")
        .select("business_id")
        .eq("user_id", user.id)
        .limit(1);

      if (!memberships?.[0]) return;
      const bid = memberships[0].business_id;
      setBusinessId(bid);

      let query = supabase
        .from("products")
        .select("*, category:categories(name)")
        .eq("business_id", bid)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`);
      }

      const { data } = await query;
      setProducts(data || []);
      setLoading(false);
    };
    fetchData();
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your products, categories & suppliers</p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={formatProductsForCsv(products as unknown as Record<string, unknown>[])}
            filename={`products-${new Date().toISOString().split("T")[0]}`}
          />
          <Link href="/inventory/new" className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/80 transition-colors">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
          </Link>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid gap-3 md:grid-cols-4">
        <Link href="/inventory/categories">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Categories</h3>
                <p className="text-sm text-muted-foreground">Organize products</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/suppliers">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Factory className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Suppliers</h3>
                <p className="text-sm text-muted-foreground">Manage vendors</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/purchases">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Purchase Orders</h3>
                <p className="text-sm text-muted-foreground">Order stock</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{products.length} Products</h3>
              <p className="text-sm text-muted-foreground">In inventory</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & View Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex border rounded-lg">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-lg font-semibold mb-2">
            {search ? "No products found" : "No products yet"}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {search
              ? "Try a different search term"
              : "Add your first product to start building your inventory."}
          </p>
          {!search && (
            <Link href="/inventory/new" className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/80 transition-colors">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Product
            </Link>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link key={product.id} href={`/inventory/${product.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.category?.name || "Uncategorized"}
                      </p>
                      {product.sku && (
                        <p className="text-xs text-muted-foreground mt-1">SKU: {product.sku}</p>
                      )}
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">₹{product.selling_price}</span>
                    {product.cost_price > 0 && (
                      <Badge variant="outline">
                        {((product.selling_price - product.cost_price) / product.cost_price * 100).toFixed(0)}% margin
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <Link key={product.id} href={`/inventory/${product.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {product.sku && <span>SKU: {product.sku}</span>}
                      {product.category?.name && <span>• {product.category.name}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{product.selling_price}</p>
                    {product.cost_price > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Cost: ₹{product.cost_price}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-px bg-border ${className}`} />;
}
