import { createClient } from "@/lib/supabase/client";
import { categorySchema, type CategoryInput } from "@/lib/validators/inventory";

export async function getCategories(businessId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function getCategory(businessId: string, categoryId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("business_id", businessId)
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

  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({ ...parsed.data, business_id: businessId })
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
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .update(input)
    .eq("business_id", businessId)
    .eq("id", categoryId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCategory(businessId: string, categoryId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("categories")
    .update({ is_active: false })
    .eq("business_id", businessId)
    .eq("id", categoryId);

  if (error) throw new Error(error.message);
}
