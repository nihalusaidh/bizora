"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductForm } from "@/components/inventory/product-form";
import { BarcodeDisplay } from "@/components/inventory/barcode-display";
import { ArrowLeft, Edit, Trash2, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  category_id?: string | null;
  brand?: string | null;
  cost_price: number;
  selling_price: number;
  gst_rate?: number | null;
  hsn_sac?: string | null;
  min_stock?: number | null;
  supplier_id?: string | null;
  has_variants?: boolean;
  image_url?: string | null;
  category?: { id: string; name: string } | null;
  supplier?: { id: string; name: string } | null;
  variants?: Array<{
    id: string;
    name: string;
    sku?: string | null;
    barcode?: string | null;
    cost_price?: number | null;
    selling_price?: number | null;
    stock_quantity?: number;
  }>;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
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

      const [productRes, cats, sups] = await Promise.all([
        supabase
          .from("products")
          .select("*, category:categories(id, name), supplier:suppliers(id, name), variants:product_variants(*)")
          .eq("id", id)
          .eq("business_id", bid)
          .single(),
        supabase.from("categories").select("id, name").eq("business_id", bid).eq("is_active", true).order("name"),
        supabase.from("suppliers").select("id, name").eq("business_id", bid).eq("is_active", true).order("name"),
      ]);

      if (productRes.data) {
        setProduct(productRes.data as Product);
      }
      setCategories(cats.data || []);
      setSuppliers(sups.data || []);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!businessId || !product) return;
    const supabase = createClient();
    await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", product.id);
    router.push("/inventory");
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Product not found</p>
        <Link href="/inventory" className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/80 transition-colors">
          Back to Inventory
        </Link>
      </div>
    );
  }

  if (editing && businessId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setEditing(false)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
        </div>
        <ProductForm
          businessId={businessId}
          categories={categories}
          suppliers={suppliers}
          product={product}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  const margin = product.cost_price > 0
    ? ((product.selling_price - product.cost_price) / product.cost_price * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/inventory" className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              {product.sku && <span>SKU: {product.sku}</span>}
              {product.brand && <span>• {product.brand}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{product.category?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Brand</p>
                  <p className="font-medium">{product.brand || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">HSN/SAC</p>
                  <p className="font-medium">{product.hsn_sac || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GST Rate</p>
                  <p className="font-medium">{product.gst_rate || 0}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Min Stock</p>
                  <p className="font-medium">{product.min_stock || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  <p className="font-medium">{product.supplier?.name || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          {product.has_variants && product.variants && product.variants.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Variants ({product.variants.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {product.variants.map((variant) => (
                    <div key={variant.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <span className="font-medium">{variant.name}</span>
                        {variant.sku && (
                          <span className="ml-2 text-sm text-muted-foreground">SKU: {variant.sku}</span>
                        )}
                      </div>
                      <span className="text-sm">Stock: {variant.stock_quantity || 0}</span>
                      {variant.selling_price != null && (
                        <span className="font-medium">₹{variant.selling_price}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost Price</span>
                <span className="font-medium">₹{product.cost_price}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Selling Price</span>
                <span className="font-bold text-lg">₹{product.selling_price}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Margin</span>
                <Badge variant={parseFloat(margin) > 0 ? "default" : "destructive"}>
                  {margin}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Barcode */}
          {product.barcode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Barcode</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <BarcodeDisplay value={product.barcode} />
              </CardContent>
            </Card>
          )}

          {/* Batch & Expiry */}
          {((product as any).batch_number || (product as any).expiry_date || (product as any).mrp) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Batch & Expiry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(product as any).batch_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Batch</span>
                    <span className="font-medium font-mono">{(product as any).batch_number}</span>
                  </div>
                )}
                {(product as any).mrp && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MRP</span>
                    <span className="font-medium">₹{(product as any).mrp}</span>
                  </div>
                )}
                {(product as any).manufacturing_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mfg Date</span>
                    <span className="font-medium">{new Date((product as any).manufacturing_date).toLocaleDateString()}</span>
                  </div>
                )}
                {(product as any).expiry_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Expiry</span>
                    {(() => {
                      const exp = new Date((product as any).expiry_date);
                      const now = new Date();
                      const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
                      if (daysLeft < 0) return <Badge variant="destructive">Expired</Badge>;
                      if (daysLeft <= 30) return <Badge variant="destructive">{daysLeft}d left</Badge>;
                      if (daysLeft <= 60) return <Badge className="bg-yellow-500/10 text-yellow-600">{daysLeft}d left</Badge>;
                      return <Badge variant="secondary">{daysLeft}d left</Badge>;
                    })()}
                  </div>
                )}
                {(product as any).hsn_code && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">HSN Code</span>
                    <span className="font-medium font-mono">{(product as any).hsn_code}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
