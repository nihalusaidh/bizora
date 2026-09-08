"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, IndianRupee, ExternalLink } from "lucide-react";

interface DeadCapitalDetectorProps {
  businessId: string;
}

interface SlowProduct {
  id: string;
  name: string;
  stock_quantity: number;
  cost_price: number;
  selling_price: number;
  lastSoldAt: string | null;
  daysSinceSale: number;
  deadCapital: number;
}

export function DeadCapitalDetector({ businessId }: DeadCapitalDetectorProps) {
  const [slowProducts, setSlowProducts] = useState<SlowProduct[]>([]);
  const [totalDeadCapital, setTotalDeadCapital] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadAnalysis = useCallback(async () => {
    const supabase = createClient();
    const sixtyDaysAgo = new Date(
      Date.now() - 60 * 24 * 60 * 60 * 1000
    ).toISOString();

    const [productsRes, invoiceItemsRes] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, stock_quantity, cost_price, selling_price, is_active")
        .eq("business_id", businessId)
        .eq("is_active", true)
        .gt("stock_quantity", 0),
      supabase
        .from("invoice_items")
        .select("product_id, quantity, created_at")
        .eq("business_id", businessId)
        .gte("created_at", sixtyDaysAgo),
    ]);

    const products = productsRes.data || [];
    const recentItems = invoiceItemsRes.data || [];

    const lastSoldByProduct = new Map<string, string>();
    const totalSoldByProduct = new Map<string, number>();
    for (const item of recentItems) {
      if (!item.product_id) continue;
      const existing = lastSoldByProduct.get(item.product_id);
      if (!existing || item.created_at > existing) {
        lastSoldByProduct.set(item.product_id, item.created_at);
      }
      totalSoldByProduct.set(
        item.product_id,
        (totalSoldByProduct.get(item.product_id) || 0) + item.quantity
      );
    }

    const now = Date.now();
    const slow: SlowProduct[] = [];
    let totalDead = 0;

    for (const product of products) {
      const stockQty = Number(product.stock_quantity) || 0;
      const costPrice = Number(product.cost_price) || 0;
      const sellingPrice = Number(product.selling_price) || 0;

      if (stockQty <= 0 || costPrice <= 0) continue;

      const lastSold = lastSoldByProduct.get(product.id) || null;
      const daysSince = lastSold
        ? Math.floor(
            (now - new Date(lastSold).getTime()) / (1000 * 60 * 60 * 24)
          )
        : 999;

      const velocity = totalSoldByProduct.get(product.id) || 0;
      const isSlow =
        !lastSold ||
        daysSince >= 60 ||
        (stockQty > 20 && velocity < 5);

      if (isSlow) {
        const deadCap = stockQty * costPrice;
        totalDead += deadCap;
        slow.push({
          id: product.id,
          name: product.name,
          stock_quantity: stockQty,
          cost_price: costPrice,
          selling_price: sellingPrice,
          lastSoldAt: lastSold,
          daysSinceSale: daysSince,
          deadCapital: deadCap,
        });
      }
    }

    slow.sort((a, b) => b.deadCapital - a.deadCapital);
    setSlowProducts(slow);
    setTotalDeadCapital(totalDead);
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000)
      return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000)
      return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Dead Capital Detector
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Dead Capital Detector
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {slowProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">
              No slow-moving inventory detected. Your stock is healthy.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-lg bg-[#DC2626]/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Capital locked in slow-moving stock
                </span>
                <span className="text-2xl font-bold text-[#DC2626]">
                  {formatCurrency(totalDeadCapital)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {slowProducts.length} product{slowProducts.length !== 1 ? "s" : ""}{" "}
                with no meaningful sales in 60+ days
              </p>
            </div>

            <div className="space-y-2">
              {slowProducts.slice(0, 10).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-[10px]">
                        {product.stock_quantity} units
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {product.daysSinceSale === 999
                          ? "Never sold"
                          : `${product.daysSinceSale}d since last sale`}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-bold text-[#DC2626]">
                      {formatCurrency(product.deadCapital)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{formatCurrency(product.cost_price)}/unit
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {slowProducts.length > 10 && (
              <p className="text-xs text-center text-muted-foreground">
                + {slowProducts.length - 10} more products
              </p>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                View products
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Package className="h-3.5 w-3.5 mr-1.5" />
                Create clearance
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
