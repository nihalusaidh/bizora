"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useBusiness } from "@/lib/store";
import { Copy, ExternalLink, Package, QrCode } from "lucide-react";

interface Product {
  id: string;
  name: string;
  selling_price: number;
  image_url?: string | null;
  description?: string | null;
  is_active: boolean;
  category?: { name: string } | null;
}

export default function CataloguePage() {
  const { businessId, business } = useBusiness();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogueEnabled, setCatalogueEnabled] = useState(true);

  const storeUrl = businessId ? `${typeof window !== "undefined" ? window.location.origin : ""}/store/${businessId}` : "";

  const load = useCallback(async () => {
    if (!businessId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select("id, name, selling_price, image_url, description, is_active, category:categories(name)")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .order("name");
    setProducts((data || []).map((p) => ({ ...p, category: Array.isArray(p.category) ? p.category[0] : p.category })));
    setLoading(false);
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Online Store</h1>
        <p className="text-muted-foreground">Share your catalogue with customers</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div><Label className="font-medium">Enable Online Store</Label><p className="text-xs text-muted-foreground">Share your products online</p></div>
            <Switch checked={catalogueEnabled} onCheckedChange={setCatalogueEnabled} />
          </div>
          {catalogueEnabled && storeUrl && (
            <div className="flex items-center gap-2">
              <Input readOnly value={storeUrl} className="text-sm font-mono" />
              <Button variant="outline" size="icon" onClick={copyLink}><Copy className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => window.open(storeUrl, "_blank")}><ExternalLink className="h-4 w-4" /></Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Products in Catalogue ({products.length})</h2>
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}</div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Add products to see them in your catalogue</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center"><Package className="h-5 w-5 text-muted-foreground" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.category?.name || "Uncategorized"}</div>
                </div>
                <div className="font-bold text-sm">₹{p.selling_price}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
