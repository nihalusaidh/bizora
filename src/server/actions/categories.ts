"use server";

import { requireBusiness } from "@/lib/auth";
import { categorySchema, type CategoryInput } from "@/lib/validators/inventory";

export async function getCategories(businessId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("business_id", auth.businessId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function getCategory(businessId: string, categoryId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("business_id", auth.businessId)
    .eq("id", categoryId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createCategory(businessId: string, input: CategoryInput) {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;
  const { data, error } = await supabase
    .from("categories")
    .insert({ ...parsed.data, business_id: auth.businessId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateCategory(
  businessId: string,
  categoryId: string,
  input: Partial<CategoryInput>
) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;
  const { data, error } = await supabase
    .from("categories")
    .update(input)
    .eq("business_id", auth.businessId)
    .eq("id", categoryId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCategory(businessId: string, categoryId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;
  const { error } = await supabase
    .from("categories")
    .update({ is_active: false })
    .eq("business_id", auth.businessId)
    .eq("id", categoryId);

  if (error) throw new Error(error.message);
}
