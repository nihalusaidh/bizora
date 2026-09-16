import { requireBusiness } from "@/lib/auth";
import {
  customerPaymentSchema,
  customerCreditSchema,
  type CustomerPaymentInput,
  type CustomerCreditInput,
} from "@/lib/validators/customers";

export async function getCustomerPayments(customerId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;
  const { data, error } = await supabase
    .from("customer_payments")
    .select("*")
    .eq("customer_id", customerId)
    .eq("business_id", auth.businessId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function addCustomerPayment(
  businessId: string,
  customerId: string,
  input: CustomerPaymentInput
) {
  const parsed = customerPaymentSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const { error: paymentError } = await supabase.from("customer_payments").insert({
    ...parsed.data,
    customer_id: customerId,
    business_id: auth.businessId,
  });

  if (paymentError) throw new Error(paymentError.message);

  // NOTE: This read-calculate-write pattern has a race condition under concurrent requests.
  // A Supabase RPC function (e.g. update_balance_atomic) would be ideal but isn't available.
  try {
    const { data: customer, error: fetchError } = await supabase
      .from("customers")
      .select("outstanding_balance")
      .eq("id", customerId)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    const newBalance = Math.max(0, (customer.outstanding_balance || 0) - parsed.data.amount);

    const { error: updateError } = await supabase
      .from("customers")
      .update({ outstanding_balance: newBalance })
      .eq("id", customerId);

    if (updateError) throw new Error(updateError.message);
  } catch (err) {
    // Known race condition: concurrent payments may overwrite each other.
    throw err;
  }

  return { success: true };
}

export async function getCustomerCredit(businessId: string, customerId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;
  const { data, error } = await supabase
    .from("customer_credit")
    .select("*")
    .eq("business_id", auth.businessId)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function addCustomerCredit(
  businessId: string,
  customerId: string,
  input: CustomerCreditInput
) {
  const parsed = customerCreditSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const { error: creditError } = await supabase.from("customer_credit").insert({
    amount: parsed.data.amount,
    description: parsed.data.description,
    due_date: parsed.data.due_date || null,
    type: "credit",
    status: "pending",
    customer_id: customerId,
    business_id: auth.businessId,
  });

  if (creditError) throw new Error(creditError.message);

  // NOTE: This read-calculate-write pattern has a race condition under concurrent requests.
  // A Supabase RPC function (e.g. update_balance_atomic) would be ideal but isn't available.
  try {
    const { data: customer, error: fetchError } = await supabase
      .from("customers")
      .select("outstanding_balance")
      .eq("id", customerId)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    const newBalance = (customer.outstanding_balance || 0) + parsed.data.amount;

    const { error: updateError } = await supabase
      .from("customers")
      .update({ outstanding_balance: newBalance })
      .eq("id", customerId);

    if (updateError) throw new Error(updateError.message);
  } catch (err) {
    // Known race condition: concurrent credits may overwrite each other.
    throw err;
  }

  return { success: true };
}

export async function markCreditPaid(
  businessId: string,
  creditId: string,
  customerId: string,
  amount: number
) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const { error: creditError } = await supabase
    .from("customer_credit")
    .update({ status: "paid" })
    .eq("business_id", auth.businessId)
    .eq("id", creditId);

  if (creditError) throw new Error(creditError.message);

  // NOTE: This read-calculate-write pattern has a race condition under concurrent requests.
  // A Supabase RPC function (e.g. update_balance_atomic) would be ideal but isn't available.
  try {
    const { data: customer, error: fetchError } = await supabase
      .from("customers")
      .select("outstanding_balance")
      .eq("id", customerId)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    const newBalance = Math.max(0, (customer.outstanding_balance || 0) - amount);

    const { error: updateError } = await supabase
      .from("customers")
      .update({ outstanding_balance: newBalance })
      .eq("id", customerId);

    if (updateError) throw new Error(updateError.message);
  } catch (err) {
    // Known race condition: concurrent payments may overwrite each other.
    throw err;
  }

  return { success: true };
}
