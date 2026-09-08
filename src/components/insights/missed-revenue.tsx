"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingDown, IndianRupee, ShoppingCart, Users } from "lucide-react";

interface MissedRevenueProps {
  businessId: string;
}

interface MissedIssue {
  id: string;
  type: "out_of_stock" | "frequent_oos" | "inactive_customer";
  title: string;
  description: string;
  impact: number;
  count: number;
  actionLabel: string;
}

export function MissedRevenue({ businessId }: MissedRevenueProps) {
  const [issues, setIssues] = useState<MissedIssue[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnalysis = useCallback(async () => {
    const supabase = createClient();
    const now = Date.now();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString();

    const found: MissedIssue[] = [];

    const [
      productsRes,
      recentItemsRes,
      olderItemsRes,
      customersRes,
      invoicesRes,
    ] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, stock_quantity, selling_price, cost_price, is_active")
        .eq("business_id", businessId)
        .eq("is_active", true),
      supabase
        .from("invoice_items")
        .select("product_id, quantity, total, created_at")
        .eq("business_id", businessId)
        .gte("created_at", thirtyDaysAgo),
      supabase
        .from("invoice_items")
        .select("product_id, quantity, total")
        .eq("business_id", businessId)
        .gte("created_at", sixtyDaysAgo)
        .lt("created_at", thirtyDaysAgo),
      supabase
        .from("customers")
        .select("id, name, total_spend, last_purchase_at, is_active")
        .eq("business_id", businessId)
        .eq("is_active", true),
      supabase
        .from("invoices")
        .select("id, customer_id, total, created_at")
        .eq("business_id", businessId),
    ]);

    const products = productsRes.data || [];
    const recentItems = recentItemsRes.data || [];
    const olderItems = olderItemsRes.data || [];
    const customers = customersRes.data || [];

    const outOfStockProducts = products.filter(
      (p) => Number(p.stock_quantity) <= 0
    );

    const avgRevenuePerProduct =
      recentItems.length > 0
        ? recentItems.reduce((s, i) => s + Number(i.total), 0) /
          new Set(recentItems.map((i) => i.product_id).filter(Boolean)).size
        : 0;

    if (outOfStockProducts.length > 0) {
      const lostRevenue = Math.round(
        avgRevenuePerProduct * outOfStockProducts.length * 0.3
      );
      found.push({
        id: "out_of_stock",
        type: "out_of_stock",
        title: `${outOfStockProducts.length} product${outOfStockProducts.length !== 1 ? "s" : ""} out of stock`,
        description: outOfStockProducts
          .slice(0, 3)
          .map((p) => p.name)
          .join(", ") + (outOfStockProducts.length > 3 ? "..." : ""),
        impact: lostRevenue,
        count: outOfStockProducts.length,
        actionLabel: "Restock now",
      });
    }

    const recentSoldByProduct = new Map<string, number>();
    for (const item of recentItems) {
      if (item.product_id) {
        recentSoldByProduct.set(
          item.product_id,
          (recentSoldByProduct.get(item.product_id) || 0) + item.quantity
        );
      }
    }

    const olderSoldByProduct = new Map<string, number>();
    for (const item of olderItems) {
      if (item.product_id) {
        olderSoldByProduct.set(
          item.product_id,
          (olderSoldByProduct.get(item.product_id) || 0) + item.quantity
        );
      }
    }

    const frequentOOS: string[] = [];
    for (const [pid, olderQty] of olderSoldByProduct.entries()) {
      const recentQty = recentSoldByProduct.get(pid) || 0;
      if (olderQty >= 3 && recentQty === 0) {
        const product = products.find((p) => p.id === pid);
        if (product && Number(product.stock_quantity) <= 0) {
          frequentOOS.push(product.name);
        }
      }
    }

    if (frequentOOS.length > 0) {
      const lostRevenue = Math.round(avgRevenuePerProduct * frequentOOS.length * 0.5);
      found.push({
        id: "frequent_oos",
        type: "frequent_oos",
        title: `${frequentOOS.length} frequently sold product${frequentOOS.length !== 1 ? "s" : ""} now out of stock`,
        description:
          frequentOOS.slice(0, 3).join(", ") +
          (frequentOOS.length > 3 ? "..." : "") +
          " — these were consistent sellers.",
        impact: lostRevenue,
        count: frequentOOS.length,
        actionLabel: "Priority restock",
      });
    }

    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const inactiveCustomers = customers.filter((c) => {
      if (!c.last_purchase_at) return true;
      return (
        new Date(c.last_purchase_at).getTime() < now - thirtyDaysMs
      );
    });

    if (inactiveCustomers.length > 0) {
      const avgSpend =
        inactiveCustomers.reduce((s, c) => s + Number(c.total_spend || 0), 0) /
        (inactiveCustomers.length || 1);
      const estimatedLost = Math.round(avgSpend * 0.2 * inactiveCustomers.length);
      found.push({
        id: "inactive_customers",
        type: "inactive_customer",
        title: `${inactiveCustomers.length} customer${inactiveCustomers.length !== 1 ? "s" : ""} inactive for 30+ days`,
        description:
          inactiveCustomers
            .slice(0, 3)
            .map((c) => c.name)
            .join(", ") +
          (inactiveCustomers.length > 3 ? "..." : ""),
        impact: estimatedLost,
        count: inactiveCustomers.length,
        actionLabel: "Re-engage",
      });
    }

    setIssues(found);
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const typeIcon = (type: MissedIssue["type"]) => {
    switch (type) {
      case "out_of_stock":
        return <ShoppingCart className="h-4 w-4" />;
      case "frequent_oos":
        return <TrendingDown className="h-4 w-4" />;
      case "inactive_customer":
        return <Users className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Missed Revenue Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalImpact = issues.reduce((sum, i) => sum + i.impact, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Missed Revenue Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {issues.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">
              No missed revenue detected. You&apos;re capturing all opportunities.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium">
              You may be missing sales because...
            </p>

            <div className="flex items-center justify-between rounded-lg bg-[#DC2626]/10 p-3">
              <span className="text-sm font-medium">Total estimated lost revenue</span>
              <span className="text-lg font-bold text-[#DC2626]">
                {formatCurrency(totalImpact)}
              </span>
            </div>

            <div className="space-y-3">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="border-l-4 border-[#DC2626] rounded-r-lg bg-card p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {typeIcon(issue.type)}
                      <h4 className="text-sm font-semibold">{issue.title}</h4>
                    </div>
                    <Badge variant="destructive" className="text-[10px] shrink-0">
                      {issue.count} affected
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">{issue.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <IndianRupee className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Estimated lost
                      </span>
                      <span className="text-sm font-bold text-[#DC2626]">
                        {formatCurrency(issue.impact)}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      {issue.actionLabel}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
