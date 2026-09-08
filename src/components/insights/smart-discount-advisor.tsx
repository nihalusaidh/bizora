"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Percent, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface SmartDiscountAdvisorProps {
  businessId: string;
}

interface DiscountRecommendation {
  id: string;
  name: string;
  currentMargin: number;
  stockLevel: number;
  monthlySales: number;
  recommendation: "safe_to_discount" | "do_not_discount" | "bundle_instead";
  reason: string;
  suggestedDiscount: number;
}

export function SmartDiscountAdvisor({
  businessId,
}: SmartDiscountAdvisorProps) {
  const [recommendations, setRecommendations] = useState<
    DiscountRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);

  const loadAnalysis = useCallback(async () => {
    const supabase = createClient();
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    const [productsRes, invoiceItemsRes] = await Promise.all([
      supabase
        .from("products")
        .select(
          "id, name, cost_price, selling_price, stock_quantity, min_stock, is_active"
        )
        .eq("business_id", businessId)
        .eq("is_active", true),
      supabase
        .from("invoice_items")
        .select("product_id, quantity, created_at")
        .eq("business_id", businessId)
        .gte("created_at", thirtyDaysAgo),
    ]);

    const products = productsRes.data || [];
    const recentItems = invoiceItemsRes.data || [];

    const monthlySalesByProduct = new Map<string, number>();
    for (const item of recentItems) {
      if (!item.product_id) continue;
      monthlySalesByProduct.set(
        item.product_id,
        (monthlySalesByProduct.get(item.product_id) || 0) + item.quantity
      );
    }

    const results: DiscountRecommendation[] = [];

    for (const product of products) {
      const costPrice = Number(product.cost_price) || 0;
      const sellingPrice = Number(product.selling_price) || 0;
      const stockQty = Number(product.stock_quantity) || 0;

      if (sellingPrice <= 0 || costPrice <= 0) continue;

      const margin = ((sellingPrice - costPrice) / sellingPrice) * 100;
      const monthlySales = monthlySalesByProduct.get(product.id) || 0;
      const minStock = Number(product.min_stock) || 5;
      const isHighStock = stockQty > minStock * 3;
      const isLowSales = monthlySales < 3;

      let recommendation: DiscountRecommendation["recommendation"];
      let reason: string;
      let suggestedDiscount: number;

      if (margin < 15) {
        recommendation = "do_not_discount";
        reason = "Margin too low — discounting will cause losses.";
        suggestedDiscount = 0;
      } else if (isHighStock && isLowSales && margin >= 25) {
        recommendation = "safe_to_discount";
        reason = "High stock, slow sales, healthy margin — safe to discount.";
        suggestedDiscount = Math.min(25, Math.round(margin * 0.5));
      } else if (isHighStock && isLowSales && margin < 25) {
        recommendation = "bundle_instead";
        reason = "High stock but margin too thin for direct discount — bundle with other products.";
        suggestedDiscount = 0;
      } else if (isHighStock && margin >= 30) {
        recommendation = "safe_to_discount";
        reason = "High stock with strong margin — discount to move inventory.";
        suggestedDiscount = Math.min(20, Math.round(margin * 0.4));
      } else {
        recommendation = "do_not_discount";
        reason = "Current stock and sales are balanced.";
        suggestedDiscount = 0;
      }

      results.push({
        id: product.id,
        name: product.name,
        currentMargin: Math.round(margin),
        stockLevel: stockQty,
        monthlySales,
        recommendation,
        reason,
        suggestedDiscount,
      });
    }

    const order: Record<string, number> = {
      safe_to_discount: 0,
      bundle_instead: 1,
      do_not_discount: 2,
    };
    results.sort(
      (a, b) =>
        order[a.recommendation] - order[b.recommendation] ||
        b.currentMargin - a.currentMargin
    );

    setRecommendations(results.slice(0, 15));
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  const recBadge = (rec: DiscountRecommendation["recommendation"]) => {
    switch (rec) {
      case "safe_to_discount":
        return <Badge className="bg-[#0a0a0a] text-white text-[10px]">Safe to discount</Badge>;
      case "do_not_discount":
        return <Badge variant="destructive" className="text-[10px]">Do not discount</Badge>;
      case "bundle_instead":
        return (
          <Badge variant="secondary" className="text-[10px]">
            Bundle instead
          </Badge>
        );
    }
  };

  const recIcon = (rec: DiscountRecommendation["recommendation"]) => {
    switch (rec) {
      case "safe_to_discount":
        return <TrendingUp className="h-4 w-4" />;
      case "do_not_discount":
        return <AlertTriangle className="h-4 w-4" />;
      case "bundle_instead":
        return <TrendingDown className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Smart Discount Advisor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
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
          <Percent className="h-5 w-5" />
          Smart Discount Advisor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">
              No products to analyze. Add inventory to get discount insights.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="rounded-lg border border-border p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {recIcon(rec.recommendation)}
                    <span className="text-sm font-medium truncate">
                      {rec.name}
                    </span>
                  </div>
                  {recBadge(rec.recommendation)}
                </div>

                <p className="text-xs text-muted-foreground">{rec.reason}</p>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">
                    Margin:{" "}
                    <span className="font-medium text-foreground">
                      {rec.currentMargin}%
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    Stock:{" "}
                    <span className="font-medium text-foreground">
                      {rec.stockLevel}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    Monthly sales:{" "}
                    <span className="font-medium text-foreground">
                      {rec.monthlySales}
                    </span>
                  </span>
                </div>

                {rec.suggestedDiscount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Suggested discount:{" "}
                      <span className="font-bold text-foreground">
                        {rec.suggestedDiscount}%
                      </span>
                    </span>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      Apply discount
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
