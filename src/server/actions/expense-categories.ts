import { requireBusiness } from "@/lib/auth";
import { expenseCategorySchema, type ExpenseCategoryInput } from "@/lib/validators/expenses";

export async function getExpenseCategories(businessId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

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

  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const { data, error } = await supabase
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
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const { data, error } = await supabase
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
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const { error } = await supabase
    .from("expense_categories")
    .update({ is_active: false })
    .eq("business_id", businessId)
    .eq("id", categoryId);

  if (error) throw new Error(error.message);
}

export async function seedDefaultCategories(businessId: string) {
  const { EXPENSE_CATEGORIES_DEFAULTS } = await import("@/lib/constants");

  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const categories = EXPENSE_CATEGORIES_DEFAULTS.map((cat) => ({
    ...cat,
    business_id: businessId,
  }));

  const { data, error } = await supabase
    .from("expense_categories")
    .insert(categories)
    .select();

  if (error) throw new Error(error.message);
  return data;
}
