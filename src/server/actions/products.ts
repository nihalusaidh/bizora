"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { productSchema, productVariantSchema, type ProductInput, type ProductVariantInput } from "@/lib/validators/inventory";

export async function getProducts(
  businessId: string,
  options?: {
    search?: string;
    category_id?: string;
    sort?: string;
    limit?: number;
    offset?: number;
  }
) {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, category:categories(id, name), supplier:suppliers(id, name)")
    .eq("business_id", businessId)
    .eq("is_active", true);

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,sku.ilike.%${options.search}%,barcode.ilike.%${options.search}%`);
  }

  if (options?.category_id) {
    query = query.eq("category_id", options.category_id);
  }

  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    newest: { column: "created_at", ascending: false },
    oldest: { column: "created_at", ascending: true },
    name_asc: { column: "name", ascending: true },
    name_desc: { column: "name", ascending: false },
    price_asc: { column: "selling_price", ascending: true },
    price_desc: { column: "selling_price", ascending: false },
  };

  const sort = options?.sort ? sortMap[options.sort] : sortMap.newest;
  if (sort) {
    query = query.order(sort.column, { ascending: sort.ascending });
  }

  if (options?.limit) {
    query = query.range(
      options.offset || 0,
      (options.offset || 0) + options.limit - 1
    );
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data: data || [], count };
}

export async function getProduct(businessId: string, productId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(id, name), supplier:suppliers(id, name), variants:product_variants(*)")
    .eq("business_id", businessId)
    .eq("id", productId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createProduct(businessId: string, input: ProductInput) {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .insert({ ...parsed.data, business_id: businessId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProduct(
  businessId: string,
  productId: string,
  input: Partial<ProductInput>
) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .update(input)
    .eq("business_id", businessId)
    .eq("id", productId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProduct(businessId: string, productId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("products")
    .update({ is_active: false })
    .eq("business_id", businessId)
    .eq("id", productId);

  if (error) throw new Error(error.message);
}

// Variants
export async function getProductVariants(businessId: string, productId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function createVariant(
  businessId: string,
  productId: string,
  input: ProductVariantInput
) {
  const parsed = productVariantSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("product_variants")
    .insert({ ...parsed.data, product_id: productId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateVariant(
  businessId: string,
  variantId: string,
  input: Partial<ProductVariantInput>
) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("product_variants")
    .update(input)
    .eq("id", variantId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteVariant(businessId: string, variantId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("product_variants")
    .update({ is_active: false })
    .eq("id", variantId);

  if (error) throw new Error(error.message);
}
