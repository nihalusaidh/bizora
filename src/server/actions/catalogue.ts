import { requireAuth, requireBusiness } from "@/lib/auth";

export async function getBusinessBySlug(slug: string) {
  const auth = await requireAuth();
  if (auth.error || !auth.supabase) return { error: auth.error };
  const supabase = auth.supabase;
  const { data, error } = await supabase
    .from("businesses")
    .select("id, name, type, phone, email, address, logo_url")
    .ilike("name", slug.replace(/-/g, " "))
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getCatalogueProducts(businessId: string, categoryId?: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;
  let query = supabase
    .from("products")
    .select(`
      id, name, sku, barcode, selling_price, image_url, description,
      gst_rate, brand,
      category:categories(id, name, icon),
      variants:product_variants(id, name, selling_price, sku, stock_quantity, attributes)
    `)
    .eq("business_id", auth.businessId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getCatalogueCategories(businessId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, icon, color")
    .eq("business_id", auth.businessId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}
