"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  TrendingDown,
  Percent,
  RotateCcw,
  IndianRupee,
} from "lucide-react";

interface ProfitLeakDetectorProps {
  businessId: string;
}

interface LeakIssue {
  id: string;
  type: "high_discount" | "low_margin" | "high_returns";
  productName: string;
  productId: string;
  title: string;
  description: string;
  impact: number;
  action: string;
}

export function ProfitLeakDetector({ businessId }: ProfitLeakDetectorProps) {
  const [issues, setIssues] = useState<LeakIssue[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnalysis = useCallback(async () => {
    const supabase = createClient();
    const found: LeakIssue[] = [];

    const [productsRes, invoiceItemsRes, invoicesRes] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, cost_price, selling_price, stock_quantity, is_active")
        .eq("business_id", businessId)
        .eq("is_active", true),
      supabase
        .from("invoice_items")
        .select("id, invoice_id, product_id, quantity, unit_price, discount_percent, total")
        .eq("business_id", businessId),
      supabase
        .from("invoices")
        .select("id, status, created_at")
        .eq("business_id", businessId)
        .eq("status", "returned"),
    ]);

    const products = productsRes.data || [];
    const invoiceItems = invoiceItemsRes.data || [];
    const returnedInvoices = invoicesRes.data || [];
    const returnedInvoiceIds = new Set(returnedInvoices.map((i) => i.id));

    const returnedItems = invoiceItems.filter((item) =>
      returnedInvoiceIds.has(item.invoice_id)
    );
    const returnedByProduct = new Map<string, number>();
    for (const item of returnedItems) {
      if (item.product_id) {
        returnedByProduct.set(
          item.product_id,
          (returnedByProduct.get(item.product_id) || 0) + item.quantity
        );
      }
    }

    const totalSoldByProduct = new Map<string, number>();
    for (const item of invoiceItems) {
      if (item.product_id) {
        totalSoldByProduct.set(
          item.product_id,
          (totalSoldByProduct.get(item.product_id) || 0) + item.quantity
        );
      }
    }

    for (const product of products) {
      const costPrice = Number(product.cost_price) || 0;
      const sellingPrice = Number(product.selling_price) || 0;

      if (sellingPrice <= 0) continue;

      const totalSold = totalSoldByProduct.get(product.id) || 0;
      const totalReturned = returnedByProduct.get(product.id) || 0;

      const avgDiscount =
        invoiceItems
          .filter((i) => i.product_id === product.id)
          .reduce((sum, i) => sum + (Number(i.discount_percent) || 0), 0) /
          (invoiceItems.filter((i) => i.product_id === product.id).length || 1);

      if (avgDiscount > 20) {
        const lostRevenue = Math.round(
          (avgDiscount / 100) * sellingPrice * (totalSold || 1)
        );
        found.push({
          id: `disc-${product.id}`,
          type: "high_discount",
          productName: product.name,
          productId: product.id,
          title: `${product.name} — ${avgDiscount.toFixed(0)}% avg discount`,
          description:
            "This product is being sold at heavy discounts regularly, eroding your margins.",
          impact: lostRevenue,
          action: "Review pricing",
        });
      }

      const margin =
        sellingPrice > 0 ? ((sellingPrice - costPrice) / sellingPrice) * 100 : 0;
      if (margin < 20 && sellingPrice > 0 && costPrice > 0) {
        const estimatedLoss = Math.round(
          ((20 - margin) / 100) * sellingPrice * (totalSold || 1)
        );
        found.push({
          id: `margin-${product.id}`,
          type: "low_margin",
          productName: product.name,
          productId: product.id,
          title: `${product.name} — ${margin.toFixed(0)}% margin`,
          description:
            "Margin is below 20%. Consider raising the price or reducing cost.",
          impact: estimatedLoss,
          action: "Adjust pricing",
        });
      }

      if (totalSold > 0) {
        const returnRate = (totalReturned / totalSold) * 100;
        if (returnRate > 15) {
          const returnCost = Math.round(costPrice * totalReturned);
          found.push({
            id: `return-${product.id}`,
            type: "high_returns",
            productName: product.name,
            productId: product.id,
            title: `${product.name} — ${returnRate.toFixed(0)}% return rate`,
            description:
              "High returns indicate quality issues or customer dissatisfaction.",
            impact: returnCost,
            action: "Investigate returns",
          });
        }
      }
    }

    found.sort((a, b) => b.impact - a.impact);
    setIssues(found);
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

  const typeIcon = (type: LeakIssue["type"]) => {
    switch (type) {
      case "high_discount":
        return <Percent className="h-4 w-4" />;
      case "low_margin":
        return <TrendingDown className="h-4 w-4" />;
      case "high_returns":
        return <RotateCcw className="h-4 w-4" />;
    }
  };

  const typeLabel = (type: LeakIssue["type"]) => {
    switch (type) {
      case "high_discount":
        return <Badge variant="destructive">High Discount</Badge>;
      case "low_margin":
        return <Badge variant="destructive">Low Margin</Badge>;
      case "high_returns":
        return <Badge variant="destructive">High Returns</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Profit Leak Detector
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalImpact = issues.reduce((sum, issue) => sum + issue.impact, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Profit Leak Detector
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {issues.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No profit leaks detected. Your pricing looks healthy.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-lg bg-[#DC2626]/10 p-3">
              <span className="text-sm font-medium">Total estimated leak</span>
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
                      <h4 className="text-sm font-semibold">{issue.productName}</h4>
                    </div>
                    {typeLabel(issue.type)}
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">
                        What we found
                      </span>
                      <p className="text-sm">{issue.title}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">
                        Why it matters
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {issue.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Estimated impact
                        </span>
                        <span className="text-sm font-bold text-[#DC2626]">
                          {formatCurrency(issue.impact)}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        {issue.action}
                      </Button>
                    </div>
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
