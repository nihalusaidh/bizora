"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ActionItem } from "@/components/ui/shared";
import { Skeleton } from "@/components/ui/skeleton-cards";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface TodaysActionsProps {
  businessId: string;
}

interface Action {
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  href: string;
  actionLabel: string;
}

export function TodaysActions({ businessId }: TodaysActionsProps) {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActions = useCallback(async () => {
    const supabase = createClient();
    const items: Action[] = [];

    // Check low stock products
    const { data: products } = await supabase
      .from("products")
      .select("id, name, stock_quantity, min_stock")
      .eq("business_id", businessId)
      .order("stock_quantity", { ascending: true })
      .limit(5);

    const lowStock = products?.filter(p => p.stock_quantity <= (p.min_stock || 5)) || [];
    if (lowStock.length > 0) {
      items.push({
        severity: "high",
        title: `Reorder ${lowStock[0].name}`,
        description: `${lowStock.length} product${lowStock.length > 1 ? "s" : ""} running low on stock`,
        href: "/inventory",
        actionLabel: "View inventory",
      });
    }

    // Check outstanding payments
    const { data: customers } = await supabase
      .from("customers")
      .select("id, name, outstanding_balance")
      .eq("business_id", businessId)
      .gt("outstanding_balance", 0)
      .order("outstanding_balance", { ascending: false })
      .limit(5);

    const customersWithDues = customers || [];
    if (customersWithDues.length > 0) {
      const totalDues = customersWithDues.reduce((sum, c) => sum + Number(c.outstanding_balance), 0);
      items.push({
        severity: "medium",
        title: `Follow up with ${customersWithDues.length} customer${customersWithDues.length > 1 ? "s" : ""}`,
        description: `₹${totalDues.toLocaleString("en-IN")} in outstanding payments`,
        href: "/customers",
        actionLabel: "View customers",
      });
    }

    // Check partial invoices
    const { data: partialInvoices } = await supabase
      .from("invoices")
      .select("id, invoice_number, total, amount_paid")
      .eq("business_id", businessId)
      .eq("status", "partial")
      .limit(5);

    if (partialInvoices && partialInvoices.length > 0) {
      items.push({
        severity: "medium",
        title: `${partialInvoices.length} unpaid invoice${partialInvoices.length > 1 ? "s" : ""}`,
        description: "Partial payments pending",
        href: "/billing/invoices",
        actionLabel: "View invoices",
      });
    }

    setActions(items.slice(0, 3));
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="text-sm font-semibold mb-3">Today&apos;s priorities</h3>
      {actions.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">All clear for today! 🎉</p>
        </div>
      ) : (
        <div className="space-y-2">
          {actions.map((action, i) => (
            <ActionItem
              key={i}
              severity={action.severity}
              title={action.title}
              description={action.description}
              action={
                <Link href={action.href}>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    {action.actionLabel}
                  </Button>
                </Link>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
