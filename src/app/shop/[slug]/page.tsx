"use client";

import { useEffect, useState, useCallback, use } from "react";
import { getBusinessBySlug, getCatalogueProducts, getCatalogueCategories } from "@/server/actions/catalogue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Phone, MapPin, MessageCircle, Package, Store,
  ArrowRight, ExternalLink
} from "lucide-react";
import Link from "next/link";

interface Business {
  id: string;
  name: string;
  type: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  logo_url?: string | null;
}

interface Product {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  selling_price: number;
  image_url?: string | null;
  description?: string | null;
  gst_rate: number;
  brand?: string | null;
  category?: { id: string; name: string; icon?: string | null } | null;
  variants?: Array<{
    id: string;
    name: string;
    selling_price: number;
    sku?: string | null;
    stock_quantity: number;
    attributes?: Record<string, string>;
  }>;
}

interface Category {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
}

export default function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const biz = await getBusinessBySlug(slug);
      setBusiness(biz);

      const [prods, cats] = await Promise.all([
        getCatalogueProducts(biz.id, selectedCategory ?? undefined) as unknown as Product[],
        getCatalogueCategories(biz.id),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      setError("Store not found");
    } finally {
      setLoading(false);
    }
  }, [slug, selectedCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProducts = search
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
      )
    : products;

  const handleWhatsAppInquiry = (productName: string) => {
    const phone = business?.phone?.replace(/[^0-9]/g, "");
    if (!phone) return;
    const message = encodeURIComponent(`Hi! I'm interested in "${productName}". Is it available?`);
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Store Not Found</h1>
          <p className="text-muted-foreground">This store doesn&apos;t exist or is no longer active.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            {business.logo_url ? (
              <img src={business.logo_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">
                  {business.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-lg font-bold">{business.name}</h1>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {business.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {business.phone}
                  </span>
                )}
                {business.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {business.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 bg-gray-50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !selectedCategory
                    ? "bg-primary text-primary-foreground"
                    : "bg-white border text-muted-foreground hover:bg-gray-50"
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-white border text-muted-foreground hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {search ? "No products found" : "No products yet"}
            </h3>
            <p className="text-muted-foreground">
              {search ? "Try a different search" : "This store hasn't added products yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-12 w-12 text-gray-300" />
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  {product.brand && (
                    <div className="text-xs text-muted-foreground">{product.brand}</div>
                  )}
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  {product.category && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {product.category.icon} {product.category.name}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="font-bold text-primary">
                      ₹{product.selling_price.toLocaleString()}
                    </div>
                    {product.variants && product.variants.length > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        {product.variants.length} variants
                      </Badge>
                    )}
                  </div>

                  {/* WhatsApp Button */}
                  <Button
                    className="w-full mt-2 h-8 text-xs"
                    size="sm"
                    onClick={() => handleWhatsAppInquiry(product.name)}
                    disabled={!business.phone}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Enquire on WhatsApp
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Business Info Footer */}
        <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>Powered by <span className="font-bold text-primary">BIZORA</span></p>
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="inline-flex items-center gap-1 mt-2 text-primary hover:underline"
            >
              <Phone className="h-3 w-3" />
              Call us: {business.phone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
