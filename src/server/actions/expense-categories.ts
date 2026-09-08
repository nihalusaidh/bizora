"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { expenseCategorySchema, type ExpenseCategoryInput } from "@/lib/validators/expenses";

export async function getExpenseCategories(businessId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expense_categories")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function createExpenseCategory(businessId: string, input: ExpenseCategoryInput) {
  const parsed = expenseCategorySchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("expense_categories")
    .insert({ ...parsed.data, business_id: businessId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateExpenseCategory(
  businessId: string,
  categoryId: string,
  input: Partial<ExpenseCategoryInput>
) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("expense_categories")
    .update(input)
    .eq("business_id", businessId)
    .eq("id", categoryId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteExpenseCategory(businessId: string, categoryId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("expense_categories")
    .update({ is_active: false })
    .eq("business_id", businessId)
    .eq("id", categoryId);

  if (error) throw new Error(error.message);
}

export async function seedDefaultCategories(businessId: string) {
  const { EXPENSE_CATEGORIES_DEFAULTS } = await import("@/lib/constants");
  const admin = createAdminClient();

  const categories = EXPENSE_CATEGORIES_DEFAULTS.map((cat) => ({
    ...cat,
    business_id: businessId,
  }));

  const { data, error } = await admin
    .from("expense_categories")
    .insert(categories)
    .select();

  if (error) throw new Error(error.message);
  return data;
}
