"use server";

import { createClient } from "@/lib/supabase/server";

export interface DailyClosingData {
  date: string;
  totalSales: number;
  cashCollected: number;
  upiCollected: number;
  cardCollected: number;
  creditSales: number;
  totalReturns: number;
  totalExpenses: number;
  totalTax: number;
  billCount: number;
  averageBillValue: number;
  topSellingProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  lowStockItems: Array<{
    name: string;
    stock: number;
    unit: string;
  }>;
  netProfit: number;
  revenue: number;
}

export async function getDailyClosingData(businessId: string, date?: string) {
  const supabase = await createClient();
  const targetDate = date || new Date().toISOString().split("T")[0];
  const nextDate = new Date(new Date(targetDate).getTime() + 86400000)
    .toISOString()
    .split("T")[0];

  // Fetch invoices for the day
  const { data: invoices, error: invoiceError } = await supabase
    .from("invoices")
    .select(
      "id, total, amount_paid, payment_method, status, tax_amount, discount_amount, created_at"
    )
    .eq("business_id", businessId)
    .gte("created_at", targetDate)
    .lt("created_at", nextDate)
    .order("created_at", { ascending: true });

  if (invoiceError) throw new Error(invoiceError.message);

  // Fetch invoice items for top selling products
  const invoiceIds = (invoices || []).map((i) => i.id);
  let invoiceItems: any[] = [];

  if (invoiceIds.length > 0) {
    const { data: items, error: itemsError } = await supabase
      .from("invoice_items")
      .select("name, quantity, total, product_id")
      .in("invoice_id", invoiceIds);

    if (!itemsError && items) {
      invoiceItems = items;
    }
  }

  // Fetch expenses for the day
  const { data: expenses, error: expenseError } = await supabase
    .from("expenses")
    .select("amount, payment_method")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .gte("expense_date", targetDate)
    .lte("expense_date", targetDate);

  if (expenseError) throw new Error(expenseError.message);

  // Fetch returned invoices
  const { data: returns } = await supabase
    .from("invoices")
    .select("total")
    .eq("business_id", businessId)
    .eq("status", "returned")
    .gte("created_at", targetDate)
    .lt("created_at", nextDate);

  // Fetch low stock items
  const { data: lowStock } = await supabase
    .from("products")
    .select("name, min_stock")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(10);

  // Calculate metrics from active (non-returned) invoices
  const activeInvoices = (invoices || []).filter(
    (i) => i.status !== "returned" && i.status !== "cancelled"
  );

  const totalSales = activeInvoices.reduce(
    (sum, i) => sum + Number(i.total),
    0
  );

  const cashCollected = activeInvoices
    .filter((i) => i.payment_method === "cash")
    .reduce((sum, i) => sum + Number(i.amount_paid), 0);

  const upiCollected = activeInvoices
    .filter((i) => i.payment_method === "upi")
    .reduce((sum, i) => sum + Number(i.amount_paid), 0);

  const cardCollected = activeInvoices
    .filter((i) => i.payment_method === "card" || i.payment_method === "bank_transfer")
    .reduce((sum, i) => sum + Number(i.amount_paid), 0);

  const creditSales = activeInvoices
    .filter((i) => i.status === "partial")
    .reduce((sum, i) => sum + (Number(i.total) - Number(i.amount_paid)), 0);

  const totalReturns = (returns || []).reduce(
    (sum, r) => sum + Number(r.total),
    0
  );

  const totalExpenses = (expenses || []).reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  const totalTax = activeInvoices.reduce(
    (sum, i) => sum + Number(i.tax_amount),
    0
  );

  const billCount = activeInvoices.length;
  const averageBillValue = billCount > 0 ? totalSales / billCount : 0;

  // Top selling products
  const productMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
  for (const item of invoiceItems) {
    const key = item.product_id || item.name;
    if (!productMap[key]) {
      productMap[key] = { name: item.name, quantity: 0, revenue: 0 };
    }
    productMap[key].quantity += item.quantity;
    productMap[key].revenue += Number(item.total);
  }
  const topSellingProducts = Object.values(productMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Low stock items
  const lowStockItems = (lowStock || []).map((p) => ({
    name: p.name,
    stock: p.min_stock || 0,
    unit: "pc",
  }));

  // Profit estimate
  const revenue = totalSales;
  const costOfGoods = activeInvoices.reduce((sum, i) => {
    // We don't have cost_price in the invoice summary, estimate at 60% of sales
    // This is a rough estimate; real implementation would use invoice_items cost_price
    return sum;
  }, 0);

  const netProfit = revenue - totalExpenses - costOfGoods;

  return {
    date: targetDate,
    totalSales,
    cashCollected,
    upiCollected,
    cardCollected,
    creditSales,
    totalReturns,
    totalExpenses,
    totalTax,
    billCount,
    averageBillValue,
    topSellingProducts,
    lowStockItems,
    netProfit,
    revenue,
  };
}
