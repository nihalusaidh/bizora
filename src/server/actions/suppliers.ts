import { requireBusiness } from "@/lib/auth";
import { supplierSchema, type SupplierInput } from "@/lib/validators/inventory";

export async function getSuppliers(businessId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function getSupplier(businessId: string, supplierId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("business_id", businessId)
    .eq("id", supplierId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createSupplier(businessId: string, input: SupplierInput) {
  const parsed = supplierSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;
  const { data, error } = await supabase
    .from("suppliers")
    .insert({ ...parsed.data, business_id: businessId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateSupplier(
  businessId: string,
  supplierId: string,
  input: Partial<SupplierInput>
) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;
  const { data, error } = await supabase
    .from("suppliers")
    .update(input)
    .eq("business_id", businessId)
    .eq("id", supplierId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteSupplier(businessId: string, supplierId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;
  const { error } = await supabase
    .from("suppliers")
    .update({ is_active: false })
    .eq("business_id", businessId)
    .eq("id", supplierId);

  if (error) throw new Error(error.message);
}
