"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, IndianRupee } from "lucide-react";

interface CustomerIntelligenceProps {
  businessId: string;
}

interface CustomerInfo {
  id: string;
  name: string;
  totalSpend: number;
  purchaseCount: number;
  lastPurchaseAt: string | null;
}

interface CustomerSegment {
  label: string;
  description: string;
  customers: CustomerInfo[];
  totalValue: number;
  color: string;
}

export function CustomerIntelligence({
  businessId,
}: CustomerIntelligenceProps) {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnalysis = useCallback(async () => {
    const supabase = createClient();
    const now = Date.now();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(
      now - 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: customers } = await supabase
      .from("customers")
      .select("id, name, total_spend, purchase_count, last_purchase_at, is_active")
      .eq("business_id", businessId)
      .eq("is_active", true);

    const allCustomers = (customers || []) as Array<{
      id: string;
      name: string;
      total_spend: number;
      purchase_count: number;
      last_purchase_at: string | null;
    }>;

    const sorted = [...allCustomers].sort(
      (a, b) => (Number(b.total_spend) || 0) - (Number(a.total_spend) || 0)
    );

    const topTwentyCount = Math.max(1, Math.ceil(sorted.length * 0.2));
    const topTwentySpend = sorted
      .slice(0, topTwentyCount)
      .reduce((s, c) => s + (Number(c.total_spend) || 0), 0);

    const highValue: CustomerInfo[] = sorted
      .slice(0, topTwentyCount)
      .map((c) => ({
        id: c.id,
        name: c.name,
        totalSpend: Number(c.total_spend) || 0,
        purchaseCount: c.purchase_count || 0,
        lastPurchaseAt: c.last_purchase_at,
      }));

    const regular: CustomerInfo[] = allCustomers
      .filter((c) => {
        if (!c.last_purchase_at) return false;
        return new Date(c.last_purchase_at).getTime() >= new Date(sevenDaysAgo).getTime();
      })
      .map((c) => ({
        id: c.id,
        name: c.name,
        totalSpend: Number(c.total_spend) || 0,
        purchaseCount: c.purchase_count || 0,
        lastPurchaseAt: c.last_purchase_at,
      }));

    const inactive: CustomerInfo[] = allCustomers
      .filter((c) => {
        if (!c.last_purchase_at) return true;
        return (
          new Date(c.last_purchase_at).getTime() <
          new Date(thirtyDaysAgo).getTime()
        );
      })
      .map((c) => ({
        id: c.id,
        name: c.name,
        totalSpend: Number(c.total_spend) || 0,
        purchaseCount: c.purchase_count || 0,
        lastPurchaseAt: c.last_purchase_at,
      }));

    const atRisk: CustomerInfo[] = allCustomers
      .filter((c) => {
        if (!c.last_purchase_at) return false;
        const lastMs = new Date(c.last_purchase_at).getTime();
        const inLast30 = lastMs >= new Date(thirtyDaysAgo).getTime();
        const notInLast7 = lastMs < new Date(sevenDaysAgo).getTime();
        return inLast30 && notInLast7;
      })
      .map((c) => ({
        id: c.id,
        name: c.name,
        totalSpend: Number(c.total_spend) || 0,
        purchaseCount: c.purchase_count || 0,
        lastPurchaseAt: c.last_purchase_at,
      }));

    setSegments([
      {
        label: "High-Value Customers",
        description: "Top 20% by total spend",
        customers: highValue,
        totalValue: topTwentySpend,
        color: "#0a0a0a",
      },
      {
        label: "Regular Customers",
        description: "Purchased in last 7 days",
        customers: regular,
        totalValue: regular.reduce(
          (s, c) => s + c.totalSpend,
          0
        ),
        color: "#737373",
      },
      {
        label: "At-Risk Customers",
        description: "Purchased 8-30 days ago — declining frequency",
        customers: atRisk,
        totalValue: atRisk.reduce(
          (s, c) => s + c.totalSpend,
          0
        ),
        color: "#DC2626",
      },
      {
        label: "Inactive Customers",
        description: "No purchase in 30+ days",
        customers: inactive,
        totalValue: inactive.reduce(
          (s, c) => s + c.totalSpend,
          0
        ),
        color: "#DC2626",
      },
    ]);

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
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
          <Users className="h-5 w-5" />
          Customer Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {segments.map((segment) => (
            <div
              key={segment.label}
              className="rounded-lg border border-border p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold">{segment.label}</h4>
                  <p className="text-xs text-muted-foreground">
                    {segment.description}
                  </p>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {segment.customers.length}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5">
                <IndianRupee className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Total value</span>
                <span
                  className="text-sm font-bold"
                  style={{ color: segment.color }}
                >
                  {formatCurrency(segment.totalValue)}
                </span>
              </div>

              <div className="space-y-1 max-h-32 overflow-y-auto">
                {segment.customers.slice(0, 5).map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="truncate">{customer.name}</span>
                    <span className="text-muted-foreground shrink-0 ml-2">
                      {formatCurrency(customer.totalSpend)}
                    </span>
                  </div>
                ))}
                {segment.customers.length > 5 && (
                  <p className="text-[10px] text-muted-foreground text-center">
                    +{segment.customers.length - 5} more
                  </p>
                )}
                {segment.customers.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    None found
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
