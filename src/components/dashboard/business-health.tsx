"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { HealthScore } from "@/components/ui/shared";
import { Skeleton } from "@/components/ui/skeleton-cards";

interface BusinessHealthProps {
  businessId: string;
}

export function BusinessHealth({ businessId }: BusinessHealthProps) {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateScore = useCallback(async () => {
    const supabase = createClient();
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Get data for scoring
    const [invoices, products, customers, expenses] = await Promise.all([
      supabase.from("invoices").select("id, status, total").eq("business_id", businessId).gte("created_at", monthStart),
      supabase.from("products").select("id, stock_quantity, min_stock").eq("business_id", businessId),
      supabase.from("customers").select("id, outstanding_balance, last_purchase_date").eq("business_id", businessId),
      supabase.from("expenses").select("id, amount").eq("business_id", businessId).gte("expense_date", thirtyDaysAgo.split("T")[0]),
    ]);

    let scorePoints = 50; // Base score

    // Sales consistency (up to 15 points)
    const invoiceCount = invoices.data?.length || 0;
    if (invoiceCount > 20) scorePoints += 15;
    else if (invoiceCount > 10) scorePoints += 10;
    else if (invoiceCount > 0) scorePoints += 5;

    // Payment health (up to 15 points)
    const totalRevenue = invoices.data?.reduce((sum, i) => sum + Number(i.total), 0) || 0;
    const paidInvoices = invoices.data?.filter(i => i.status === "paid").length || 0;
    if (invoiceCount > 0) {
      const paidRatio = paidInvoices / invoiceCount;
      scorePoints += Math.round(paidRatio * 15);
    }

    // Inventory health (up to 10 points)
    const productsList = products.data || [];
    const lowStockProducts = productsList.filter(p => p.stock_quantity <= (p.min_stock || 5));
    if (productsList.length > 0) {
      const healthRatio = 1 - (lowStockProducts.length / productsList.length);
      scorePoints += Math.round(healthRatio * 10);
    }

    // Customer base (up to 10 points)
    const customerCount = customers.data?.length || 0;
    if (customerCount > 20) scorePoints += 10;
    else if (customerCount > 10) scorePoints += 7;
    else if (customerCount > 0) scorePoints += 3;

    setScore(Math.min(100, Math.max(0, scorePoints)));
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    calculateScore();
  }, [calculateScore]);

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="flex items-end gap-3">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div>
            <Skeleton className="h-7 w-20 mb-2" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <HealthScore
      score={score || 50}
      label={score !== null ? (score >= 80 ? "Healthy" : score >= 60 ? "Needs attention" : "Critical") : undefined}
    />
  );
}
