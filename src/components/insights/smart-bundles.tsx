"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight } from "lucide-react";

interface SmartBundlesProps {
  businessId: string;
}

interface ProductPair {
  productA: string;
  productB: string;
  coOccurrences: number;
  invoiceCount: number;
}

export function SmartBundles({ businessId }: SmartBundlesProps) {
  const [pairs, setPairs] = useState<ProductPair[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnalysis = useCallback(async () => {
    const supabase = createClient();

    const [invoiceItemsRes, productsRes] = await Promise.all([
      supabase
        .from("invoice_items")
        .select("invoice_id, product_id, name")
        .eq("business_id", businessId)
        .not("product_id", "is", null),
      supabase
        .from("products")
        .select("id, name")
        .eq("business_id", businessId),
    ]);

    const items = invoiceItemsRes.data || [];
    const products = productsRes.data || [];

    const nameMap = new Map<string, string>();
    for (const p of products) {
      nameMap.set(p.id, p.name);
    }

    const invoiceProducts = new Map<string, Set<string>>();
    for (const item of items) {
      if (!item.invoice_id || !item.product_id) continue;
      if (!invoiceProducts.has(item.invoice_id)) {
        invoiceProducts.set(item.invoice_id, new Set());
      }
      invoiceProducts.get(item.invoice_id)!.add(item.product_id);
    }

    const pairCounts = new Map<string, { count: number; setA: string; setB: string }>();

    for (const [, productIds] of invoiceProducts) {
      const arr = Array.from(productIds);
      if (arr.length < 2) continue;

      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const key = [arr[i], arr[j]].sort().join("::");
          const existing = pairCounts.get(key);
          if (existing) {
            existing.count++;
          } else {
            pairCounts.set(key, {
              count: 1,
              setA: arr[i],
              setB: arr[j],
            });
          }
        }
      }
    }

    const result: ProductPair[] = [];
    for (const [, value] of pairCounts.entries()) {
      if (value.count >= 2) {
        const nameA = nameMap.get(value.setA) || "Unknown";
        const nameB = nameMap.get(value.setB) || "Unknown";
        result.push({
          productA: nameA,
          productB: nameB,
          coOccurrences: value.count,
          invoiceCount: invoiceProducts.size,
        });
      }
    }

    result.sort((a, b) => b.coOccurrences - a.coOccurrences);
    setPairs(result.slice(0, 10));
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Smart Bundles
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
          Smart Bundles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pairs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">
              Not enough data to find product bundles yet. Keep making sales!
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium">
              Customers who buy X frequently buy Y
            </p>

            <div className="space-y-2">
              {pairs.map((pair, i) => {
                const percentage =
                  pair.invoiceCount > 0
                    ? Math.round(
                        (pair.coOccurrences / pair.invoiceCount) * 100
                      )
                    : 0;

                return (
                  <div
                    key={`${pair.productA}-${pair.productB}-${i}`}
                    className="rounded-lg border border-border p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium truncate">
                        {pair.productA}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium truncate">
                        {pair.productB}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {pair.coOccurrences}x together
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {percentage}% of orders
                        </span>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Create bundle
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
