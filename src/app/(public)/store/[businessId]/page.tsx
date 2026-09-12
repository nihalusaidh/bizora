"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, MessageCircle, ShoppingCart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  selling_price: number;
  mrp?: number | null;
  image_url?: string | null;
  description?: string | null;
  stock_quantity: number;
  category?: { name: string } | null;
}

interface Business {
  name: string;
  phone?: string | null;
  address?: string | null;
  logo_url?: string | null;
  upi_id?: string | null;
}

export default function PublicStorePage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Map<string, number>>(new Map());

  const load = useCallback(async () => {
    const supabase = createClient();
    const [bizRes, prodRes] = await Promise.all([
      supabase.from("businesses").select("name, phone, address, logo_url, upi_id").eq("id", businessId).single(),
      supabase.from("products").select("id, name, selling_price, mrp, image_url, description, stock_quantity, category:categories(name)")
        .eq("business_id", businessId).eq("is_active", true).gt("stock_quantity", 0).order("name"),
    ]);
    setBusiness(bizRes.data);
    setProducts((prodRes.data || []).map((p) => ({ ...p, category: Array.isArray(p.category) ? p.category[0] : p.category })));
    setLoading(false);
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  const addToCart = (productId: string) => {
    const next = new Map(cart);
    next.set(productId, (next.get(productId) || 0) + 1);
    setCart(next);
  };

  const shareOnWhatsApp = () => {
    const items = Array.from(cart.entries()).map(([id, qty]) => {
      const p = products.find((x) => x.id === id);
      return p ? `${p.name} x${qty} = ₹${(p.selling_price * qty).toLocaleString()}` : "";
    }).filter(Boolean);
    const total = Array.from(cart.entries()).reduce((sum, [id, qty]) => {
      const p = products.find((x) => x.id === id);
      return sum + (p ? p.selling_price * qty : 0);
    }, 0);

    const text = `Hi ${business?.name}! I'd like to order:\n\n${items.join("\n")}\n\n*Total: ₹${total.toLocaleString()}*`;
    window.open(`https://wa.me/${business?.phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const filtered = products.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.name.toLowerCase().includes(s) || (p.category?.name && p.category.name.toLowerCase().includes(s));
  });

  const cartCount = Array.from(cart.values()).reduce((s, v) => s + v, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {business?.logo_url ? (
              <img src={business.logo_url} alt={business.name} className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">{business?.name?.charAt(0) || "B"}</span>
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold">{business?.name || "Store"}</h1>
              {business?.address && <p className="text-xs text-muted-foreground">{business.address}</p>}
            </div>
            {cartCount > 0 && (
              <div className="ml-auto relative">
                <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">{cartCount}</Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => (
              <Card key={p.id} className="overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-32 w-full object-cover" />
                ) : (
                  <div className="h-32 w-full bg-muted flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <CardContent className="p-3 space-y-2">
                  <h3 className="font-medium text-sm line-clamp-2">{p.name}</h3>
                  {p.category && <span className="text-[10px] text-muted-foreground">{p.category.name}</span>}
                  <div className="flex items-center gap-2">
                    <span className="font-bold">₹{p.selling_price}</span>
                    {p.mrp && p.mrp > p.selling_price && (
                      <span className="text-xs text-muted-foreground line-through">₹{p.mrp}</span>
                    )}
                  </div>
                  <Button size="sm" className="w-full" onClick={() => addToCart(p.id)}>
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* WhatsApp Order */}
        {cartCount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
            <div className="max-w-2xl mx-auto">
              <Button onClick={shareOnWhatsApp} className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                Order via WhatsApp ({cartCount} items)
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
