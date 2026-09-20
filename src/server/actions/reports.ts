import { requireBusiness } from "@/lib/auth";

export interface DateRange {
  start_date: string;
  end_date: string;
}

export async function getRevenueReport(businessId: string, range: DateRange) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("total, amount_paid, status, tax_amount, discount_amount, created_at, customers(name)")
    .eq("business_id", auth.businessId)
    .neq("status", "cancelled")
    .gte("created_at", range.start_date)
    .lte("created_at", range.end_date + "T23:59:59")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const totalRevenue = invoices.reduce((sum, i) => sum + Number(i.total), 0);
  const totalCollected = invoices.reduce((sum, i) => sum + Number(i.amount_paid), 0);
  const totalTax = invoices.reduce((sum, i) => sum + Number(i.tax_amount), 0);
  const totalDiscount = invoices.reduce((sum, i) => sum + Number(i.discount_amount), 0);
  const invoiceCount = invoices.length;
  const paidCount = invoices.filter((i) => i.status === "paid").length;
  const avgInvoiceValue = invoiceCount > 0 ? totalRevenue / invoiceCount : 0;

  const dailyMap: Record<string, number> = {};
  invoices.forEach((inv) => {
    const day = inv.created_at.split("T")[0];
    dailyMap[day] = (dailyMap[day] || 0) + Number(inv.total);
  });
  const daily = Object.entries(dailyMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const customerMap: Record<string, { total: number; count: number }> = {};
  invoices.forEach((inv) => {
    const name = (inv.customers as unknown as { name?: string } | null)?.name || "Walk-in";
    if (!customerMap[name]) customerMap[name] = { total: 0, count: 0 };
    customerMap[name].total += Number(inv.total);
    customerMap[name].count += 1;
  });
  const topCustomers = Object.entries(customerMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return {
    totalRevenue,
    totalCollected,
    totalPending: totalRevenue - totalCollected,
    totalTax,
    totalDiscount,
    invoiceCount,
    paidCount,
    avgInvoiceValue,
    daily,
    topCustomers,
  };
}

export async function getExpenseReport(businessId: string, range: DateRange) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("amount, payment_method, expense_date, expense_categories(name, icon, color)")
    .eq("business_id", auth.businessId)
    .eq("is_active", true)
    .gte("expense_date", range.start_date)
    .lte("expense_date", range.end_date)
    .order("expense_date", { ascending: false });

  if (error) throw new Error(error.message);

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const catMap: Record<string, { amount: number; count: number; icon: string; color: string }> = {};
  expenses.forEach((e) => {
    const cat = e.expense_categories as unknown as { name?: string; icon?: string; color?: string } | null;
    const name = cat?.name || "Uncategorized";
    if (!catMap[name]) catMap[name] = { amount: 0, count: 0, icon: cat?.icon || "📋", color: cat?.color || "#6b7280" };
    catMap[name].amount += Number(e.amount);
    catMap[name].count += 1;
  });
  const byCategory = Object.entries(catMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.amount - a.amount);

  const dailyMap: Record<string, number> = {};
  expenses.forEach((e) => {
    dailyMap[e.expense_date] = (dailyMap[e.expense_date] || 0) + Number(e.amount);
  });
  const daily = Object.entries(dailyMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const methodMap: Record<string, number> = {};
  expenses.forEach((e) => {
    methodMap[e.payment_method] = (methodMap[e.payment_method] || 0) + Number(e.amount);
  });
  const byMethod = Object.entries(methodMap)
    .map(([method, amount]) => ({ method, amount }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totalExpenses,
    expenseCount: expenses.length,
    byCategory,
    daily,
    byMethod,
  };
}

export async function getProfitLossReport(businessId: string, range: DateRange) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };

  const [revenue, expenses] = await Promise.all([
    getRevenueReport(businessId, range),
    getExpenseReport(businessId, range),
  ]);

  const grossProfit = (revenue.totalRevenue ?? 0) - (revenue.totalDiscount ?? 0);
  const netProfit = grossProfit - (expenses.totalExpenses ?? 0);
  const profitMargin = (revenue.totalRevenue ?? 0) > 0 ? (netProfit / (revenue.totalRevenue ?? 0)) * 100 : 0;

  return {
    revenue,
    expenses,
    grossProfit,
    netProfit,
    profitMargin,
  };
}

export async function getGstReport(businessId: string, range: DateRange) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("invoice_number, created_at, total, tax_amount, discount_amount, status, customers(name, gst_number)")
    .eq("business_id", auth.businessId)
    .neq("status", "cancelled")
    .gte("created_at", range.start_date)
    .lte("created_at", range.end_date + "T23:59:59")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const totalTaxable = invoices.reduce((sum, i) => sum + Number(i.total) - Number(i.tax_amount), 0);
  const totalTax = invoices.reduce((sum, i) => sum + Number(i.tax_amount), 0);
  const invoiceCount = invoices.length;

  const invoiceDetails = invoices.map((inv) => ({
    invoice_number: inv.invoice_number,
    date: inv.created_at.split("T")[0],
    taxable_amount: Number(inv.total) - Number(inv.tax_amount),
    tax_amount: Number(inv.tax_amount),
    total: Number(inv.total),
    status: inv.status,
  }));

  return {
    totalTaxable,
    totalTax,
    invoiceCount,
    invoiceDetails,
  };
}

export async function getDashboardStats(businessId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];

  const [thisMonthRevenue, lastMonthRevenue, thisMonthExpenses, lastMonthExpenses] = await Promise.all([
    getRevenueReport(businessId, { start_date: startOfMonth, end_date: endOfMonth }),
    getRevenueReport(businessId, { start_date: startOfLastMonth, end_date: endOfLastMonth }),
    getExpenseReport(businessId, { start_date: startOfMonth, end_date: endOfMonth }),
    getExpenseReport(businessId, { start_date: startOfLastMonth, end_date: endOfLastMonth }),
  ]);

  const thisMonthProfit = (thisMonthRevenue.totalRevenue ?? 0) - (thisMonthExpenses.totalExpenses ?? 0);
  const lastMonthProfit = (lastMonthRevenue.totalRevenue ?? 0) - (lastMonthExpenses.totalExpenses ?? 0);

  const revenueChange = (lastMonthRevenue.totalRevenue ?? 0) > 0
    ? (((thisMonthRevenue.totalRevenue ?? 0) - (lastMonthRevenue.totalRevenue ?? 0)) / (lastMonthRevenue.totalRevenue ?? 0)) * 100
    : 0;
  const expenseChange = (lastMonthExpenses.totalExpenses ?? 0) > 0
    ? (((thisMonthExpenses.totalExpenses ?? 0) - (lastMonthExpenses.totalExpenses ?? 0)) / (lastMonthExpenses.totalExpenses ?? 0)) * 100
    : 0;
  const profitChange = lastMonthProfit > 0
    ? ((thisMonthProfit - lastMonthProfit) / lastMonthProfit) * 100
    : 0;

  return {
    revenue: { current: thisMonthRevenue.totalRevenue ?? 0, change: revenueChange },
    expenses: { current: thisMonthExpenses.totalExpenses ?? 0, change: expenseChange },
    profit: { current: thisMonthProfit, change: profitChange },
    invoices: thisMonthRevenue.invoiceCount ?? 0,
    outstanding: thisMonthRevenue.totalPending ?? 0,
    avgInvoice: thisMonthRevenue.avgInvoiceValue ?? 0,
  };
}

export interface DayBookEntry {
  id: string;
  kind: "in" | "out";
  label: string;
  detail: string;
  amount: number;
  time: string;
}

export interface DayBook {
  date: string;
  moneyIn: number;
  moneyOut: number;
  net: number;
  entries: DayBookEntry[];
}

/** Vyapar-style Day Book: every rupee in/out for one date, single chronological ledger. */
export async function getDayBook(businessId: string, date: string): Promise<DayBook> {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) throw new Error(auth.error || "Not authenticated");
  const supabase = auth.supabase;
  const start = `${date}T00:00:00`;
  const end = `${date}T23:59:59`;

  const [{ data: invoices }, { data: payments }, { data: expenses }] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, invoice_number, total, amount_paid, created_at, customers(name)")
      .eq("business_id", auth.businessId)
      .neq("status", "cancelled")
      .gte("created_at", start)
      .lte("created_at", end)
      .order("created_at", { ascending: true }),
    supabase
      .from("customer_payments")
      .select("id, amount, created_at, customers(name)")
      .eq("business_id", auth.businessId)
      .gte("created_at", start)
      .lte("created_at", end)
      .order("created_at", { ascending: true }),
    supabase
      .from("expenses")
      .select("id, description, amount, vendor, expense_date")
      .eq("business_id", auth.businessId)
      .eq("is_active", true)
      .gte("expense_date", date)
      .lte("expense_date", date)
      .order("created_at", { ascending: true }),
  ]);

  const entries: DayBookEntry[] = [];
  for (const inv of invoices || []) {
    const paid = Number(inv.amount_paid) || 0;
    if (paid <= 0) continue;
    const cust = Array.isArray(inv.customers) ? inv.customers[0] : inv.customers;
    entries.push({
      id: `inv-${inv.id}`,
      kind: "in",
      label: `Bill ${inv.invoice_number}`,
      detail: (cust as { name?: string } | null)?.name || "Walk-in",
      amount: paid,
      time: inv.created_at,
    });
  }
  for (const p of payments || []) {
    const cust = Array.isArray(p.customers) ? p.customers[0] : p.customers;
    entries.push({
      id: `pay-${p.id}`,
      kind: "in",
      label: "Khata collection",
      detail: (cust as { name?: string } | null)?.name || "Customer",
      amount: Number(p.amount) || 0,
      time: p.created_at,
    });
  }
  for (const e of expenses || []) {
    entries.push({
      id: `exp-${e.id}`,
      kind: "out",
      label: e.description,
      detail: e.vendor || "Expense",
      amount: Number(e.amount) || 0,
      time: e.expense_date,
    });
  }
  entries.sort((a, b) => a.time.localeCompare(b.time));

  const moneyIn = entries.filter((e) => e.kind === "in").reduce((s, e) => s + e.amount, 0);
  const moneyOut = entries.filter((e) => e.kind === "out").reduce((s, e) => s + e.amount, 0);
  return { date, moneyIn, moneyOut, net: moneyIn - moneyOut, entries };
}
