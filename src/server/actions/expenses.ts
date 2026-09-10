import { createClient } from "@/lib/supabase/client";
import { expenseSchema, type ExpenseInput } from "@/lib/validators/expenses";

export async function getExpenses(
  businessId: string,
  options?: { search?: string; category_id?: string; start_date?: string; end_date?: string }
) {
  const supabase = createClient();
  let query = supabase
    .from("expenses")
    .select("*, expense_categories(id, name, icon, color)")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("expense_date", { ascending: false });

  if (options?.search) {
    query = query.or(`description.ilike.%${options.search}%,vendor.ilike.%${options.search}%`);
  }
  if (options?.category_id) {
    query = query.eq("category_id", options.category_id);
  }
  if (options?.start_date) {
    query = query.gte("expense_date", options.start_date);
  }
  if (options?.end_date) {
    query = query.lte("expense_date", options.end_date);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getExpense(businessId: string, expenseId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("*, expense_categories(id, name, icon, color)")
    .eq("business_id", businessId)
    .eq("id", expenseId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createExpense(businessId: string, input: ExpenseInput) {
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      ...parsed.data,
      category_id: parsed.data.category_id || null,
      vendor: parsed.data.vendor || null,
      reference: parsed.data.reference || null,
      notes: parsed.data.notes || null,
      recurring_period: parsed.data.is_recurring ? parsed.data.recurring_period : null,
      business_id: businessId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateExpense(
  businessId: string,
  expenseId: string,
  input: Partial<ExpenseInput>
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("expenses")
    .update({
      ...input,
      category_id: input.category_id || null,
      recurring_period: input.is_recurring ? input.recurring_period : null,
    })
    .eq("business_id", businessId)
    .eq("id", expenseId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteExpense(businessId: string, expenseId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("expenses")
    .update({ is_active: false })
    .eq("business_id", businessId)
    .eq("id", expenseId);

  if (error) throw new Error(error.message);
}

export async function getExpenseSummary(businessId: string, startDate: string, endDate: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("amount, category_id, expense_categories(name, icon, color)")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .gte("expense_date", startDate)
    .lte("expense_date", endDate);

  if (error) throw new Error(error.message);

  const total = data.reduce((sum, e) => sum + Number(e.amount), 0);

  const byCategory = data.reduce((acc, e) => {
    const cat = e.expense_categories as unknown as { name?: string; icon?: string; color?: string } | null;
    const catName = cat?.name || "Uncategorized";
    const catColor = cat?.color || "#6b7280";
    const catIcon = cat?.icon || "📋";
    if (!acc[catName]) {
      acc[catName] = { amount: 0, color: catColor, icon: catIcon, count: 0 };
    }
    acc[catName].amount += Number(e.amount);
    acc[catName].count += 1;
    return acc;
  }, {} as Record<string, { amount: number; color: string; icon: string; count: number }>);

  return { total, byCategory, count: data.length };
}
