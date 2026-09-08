"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { customerSchema, type CustomerInput } from "@/lib/validators/customers";

export async function getCustomers(businessId: string, search?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("customers")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getCustomer(businessId: string, customerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("business_id", businessId)
    .eq("id", customerId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createCustomer(businessId: string, input: CustomerInput) {
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("customers")
    .insert({ ...parsed.data, business_id: businessId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateCustomer(
  businessId: string,
  customerId: string,
  input: Partial<CustomerInput>
) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("customers")
    .update(input)
    .eq("business_id", businessId)
    .eq("id", customerId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCustomer(businessId: string, customerId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("customers")
    .update({ is_active: false })
    .eq("business_id", businessId)
    .eq("id", customerId);

  if (error) throw new Error(error.message);
}
