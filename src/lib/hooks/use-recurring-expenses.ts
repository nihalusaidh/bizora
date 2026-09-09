"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useBusiness } from "@/lib/store";

export function useRecurringExpenses() {
  const { businessId } = useBusiness();

  const processRecurring = useCallback(async () => {
    if (!businessId) return;

    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];

    const { data: expenses } = await supabase
      .from("expenses")
      .select("*")
      .eq("business_id", businessId)
      .eq("is_recurring", true)
      .eq("is_active", true)
      .lte("expense_date", today);

    if (!expenses?.length) return;

    for (const expense of expenses) {
      if (!expense.recurring_period) continue;

      let nextDate: Date;
      const lastDate = new Date(expense.expense_date);

      switch (expense.recurring_period) {
        case "daily":
          nextDate = new Date(lastDate);
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case "weekly":
          nextDate = new Date(lastDate);
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case "monthly":
          nextDate = new Date(lastDate);
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case "yearly":
          nextDate = new Date(lastDate);
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
        default:
          continue;
      }

      const nextDateStr = nextDate.toISOString().split("T")[0];

      // Check if we already created the next entry
      const { data: existing } = await supabase
        .from("expenses")
        .select("id")
        .eq("business_id", businessId)
        .eq("description", expense.description)
        .eq("expense_date", nextDateStr)
        .limit(1);

      if (existing?.length) continue;

      // Create the next recurring entry
      await supabase.from("expenses").insert({
        business_id: businessId,
        category_id: expense.category_id,
        description: expense.description,
        amount: expense.amount,
        payment_method: expense.payment_method,
        vendor: expense.vendor,
        expense_date: nextDateStr,
        notes: expense.notes,
        is_recurring: true,
        recurring_period: expense.recurring_period,
        is_active: true,
      });
    }
  }, [businessId]);

  useEffect(() => {
    processRecurring();
  }, [processRecurring]);
}
